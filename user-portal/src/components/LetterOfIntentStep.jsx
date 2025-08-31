import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function LetterOfIntentForm() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    citizenship: "Liberia", // hardcoded as requested
    office: "",
    district: "",
    county: "",
    partyType: "Independent", // Independent or Political Party
    partyName: "",
    homeAddress: "",
    telephoneNumbers: "",
    voterRegistrationNumber: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    aspirantName: "",
    aspirantSignature: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Handle input changes generically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation function
  function validate() {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.office.trim() ||
      !form.district.trim() ||
      !form.county.trim() ||
      !form.partyType ||
      (form.partyType === "Political Party" && !form.partyName.trim()) ||
      !form.homeAddress.trim() ||
      !form.telephoneNumbers.trim() ||
      !form.voterRegistrationNumber.trim() ||
      !form.dateOfBirth.trim() ||
      !form.gender ||
      !form.occupation.trim() ||
      !form.aspirantName.trim() ||
      !form.aspirantSignature.trim()
    ) {
      setError("Please fill in all required fields.");
      return false;
    }
    setError(null);
    return true;
  }

  // Generate random 8-char alphanumeric code
  function generateUniqueCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get today's date YYYY-MM-DD
  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Check if unique code exists
  async function checkUniqueCodeExists(code) {
    const { data, error } = await supabase
      .from("letters_of_intent")
      .select("unique_code")
      .eq("unique_code", code)
      .limit(1);

    if (error) throw error;

    return data.length > 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate unique code
      let uniqueCode = generateUniqueCode(8);
      let tries = 0;
      const maxTries = 10;
      while (tries < maxTries) {
        const exists = await supabase
          .from("letters_of_intent")
          .select("unique_code")
          .eq("unique_code", uniqueCode)
          .limit(1);
        if (exists.data.length === 0) break;
        uniqueCode = generateUniqueCode(8);
        tries++;
      }
      if (tries === maxTries) throw new Error("Could not generate unique code");

      const insertData = {
        user_id: user.id, // <-- crucial for admin approval
        first_name: form.firstName.trim(),
        middle_name: form.middleName.trim() || null,
        last_name: form.lastName.trim(),
        citizenship: form.citizenship,
        office: form.office.trim(),
        district: form.district.trim(),
        county: form.county.trim(),
        party_type: form.partyType,
        party_name:
          form.partyType === "Political Party" ? form.partyName.trim() : null,
        home_address: form.homeAddress.trim(),
        telephone_numbers: form.telephoneNumbers.trim(),
        voter_registration_number: form.voterRegistrationNumber.trim(),
        date_of_birth: form.dateOfBirth,
        gender: form.gender,
        occupation: form.occupation.trim(),
        aspirant_name: form.aspirantName.trim(),
        aspirant_signature: form.aspirantSignature.trim(),
        application_received_date: getTodayDate(),
        unique_code: uniqueCode,
        approved: false, // <-- new submissions are pending
        submitted_at: new Date(), // <-- timestamp
      };

      const { error: insertError } = await supabase
        .from("letters_of_intent")
        .insert([insertData]);

      if (insertError) throw insertError;

      setMessage(
        `Letter of Intent submitted successfully! Your unique code: ${uniqueCode}. Wait for admin approval to proceed.`
      );

      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        citizenship: "Liberia",
        office: "",
        district: "",
        county: "",
        partyType: "Independent",
        partyName: "",
        homeAddress: "",
        telephoneNumbers: "",
        voterRegistrationNumber: "",
        dateOfBirth: "",
        gender: "",
        occupation: "",
        aspirantName: "",
        aspirantSignature: "",
      });
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Letter of Intent</h1>
      <p style={styles.note}>
        This is a legal document. Please fill all fields truthfully and
        accurately.
      </p>

      <form onSubmit={handleSubmit} noValidate style={styles.form}>
        {/* Name fields */}
        <div style={styles.row}>
          <label style={styles.label} htmlFor="firstName">
            First Name <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <label style={styles.label} htmlFor="middleName">
            Middle Name
          </label>
          <input
            style={styles.input}
            id="middleName"
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
          />
          <label style={styles.label} htmlFor="lastName">
            Last Name <span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <p style={styles.declaration}>
          hereby declare that I am a citizen of Liberia and I intend to be a
          candidate for the office of:
        </p>

        <label style={styles.label} htmlFor="office">
          Office <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="office"
          name="office"
          value={form.office}
          onChange={handleChange}
          required
          placeholder="e.g., Representative"
        />

        <label style={styles.label} htmlFor="district">
          District <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="district"
          name="district"
          value={form.district}
          onChange={handleChange}
          required
          placeholder="e.g., District 5"
        />

        <label style={styles.label} htmlFor="county">
          County <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="county"
          name="county"
          value={form.county}
          onChange={handleChange}
          required
          placeholder="e.g., Montserrado"
        />

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            Independent or Political Party/Alliance/Coalition
          </legend>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="partyType"
              value="Independent"
              checked={form.partyType === "Independent"}
              onChange={handleChange}
            />
            Independent
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="partyType"
              value="Political Party"
              checked={form.partyType === "Political Party"}
              onChange={handleChange}
            />
            Political Party / Alliance / Coalition
          </label>
        </fieldset>

        {form.partyType === "Political Party" && (
          <>
            <label style={styles.label} htmlFor="partyName">
              Name of Political Party/Alliance/Coalition{" "}
              <span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              id="partyName"
              name="partyName"
              value={form.partyName}
              onChange={handleChange}
              required={form.partyType === "Political Party"}
            />
          </>
        )}

        <label style={styles.label} htmlFor="homeAddress">
          Home Address <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="homeAddress"
          name="homeAddress"
          value={form.homeAddress}
          onChange={handleChange}
          required
        />

        <label style={styles.label} htmlFor="telephoneNumbers">
          Telephone Number(s) <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="telephoneNumbers"
          name="telephoneNumbers"
          value={form.telephoneNumbers}
          onChange={handleChange}
          required
          placeholder="Separate multiple numbers with commas"
        />

        <label style={styles.label} htmlFor="voterRegistrationNumber">
          Voter Registration Number <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="voterRegistrationNumber"
          name="voterRegistrationNumber"
          value={form.voterRegistrationNumber}
          onChange={handleChange}
          required
        />

        <label style={styles.label} htmlFor="dateOfBirth">
          Date of Birth <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleChange}
          required
        />

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            Gender <span style={styles.required}>*</span>
          </legend>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={form.gender === "Male"}
              onChange={handleChange}
              required
            />
            Male
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={form.gender === "Female"}
              onChange={handleChange}
              required
            />
            Female
          </label>
        </fieldset>

        <label style={styles.label} htmlFor="occupation">
          Current Occupation <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="occupation"
          name="occupation"
          value={form.occupation}
          onChange={handleChange}
          required
        />

        <hr style={{ margin: "2rem 0" }} />

        {/* Sworn affirmation */}
        <p style={{ fontWeight: "600", marginBottom: 12 }}>
          I swear/affirm, under penalty of perjury, that all information
          provided in this Letter of Intent and related documents is true and
          correct.
        </p>

        <label style={styles.label} htmlFor="aspirantName">
          Aspirant's Name <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="aspirantName"
          name="aspirantName"
          value={form.aspirantName}
          onChange={handleChange}
          required
          placeholder="Print full name"
        />

        <label style={styles.label} htmlFor="aspirantSignature">
          Aspirant's Signature <span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          id="aspirantSignature"
          name="aspirantSignature"
          value={form.aspirantSignature}
          onChange={handleChange}
          required
          placeholder="Type your full name as signature"
        />

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <button style={styles.submitButton} type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Letter of Intent"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: "2rem auto",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5faff",
    borderRadius: 12,
    boxShadow: "0 6px 15px rgba(0, 85, 164, 0.15)",
    color: "#003366",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  note: {
    backgroundColor: "#FFFBCC",
    border: "1px solid #FFEB3B",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: "600",
    color: "#665c00",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    borderRadius: 6,
    border: "1.5px solid #0055A4",
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    outline: "none",
    marginBottom: 12,
  },
  fieldset: {
    border: "1.5px solid #0055A4",
    borderRadius: 6,
    padding: "0.5rem 1rem",
    marginBottom: 20,
  },
  legend: {
    fontWeight: "700",
    color: "#0055A4",
    marginBottom: 8,
  },
  radioLabel: {
    marginRight: 20,
    fontWeight: "600",
  },
  required: {
    color: "#D72631",
  },
  declaration: {
    fontWeight: "600",
    marginBottom: 16,
  },
  error: {
    color: "#D72631",
    fontWeight: "700",
    marginBottom: 16,
  },
  success: {
    color: "#4CAF50",
    fontWeight: "700",
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 12,
    padding: "0.85rem",
    fontSize: 18,
    fontWeight: "700",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#0055A4",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

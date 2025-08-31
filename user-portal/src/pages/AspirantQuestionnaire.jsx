import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import CandidateFinancialDisclosureForm from "./CandidateFinancialDisclosureForm"; // <-- new form

export default function AspirantQuestionnaire({ onSubmitSuccess }) {
  const [user, setUser] = useState(null); // Supabase user
  const [form, setForm] = useState({
    currentAddress: "",
    currentAddressDuration: {
      years: "",
      months: "",
      days: "",
      startDate: "",
      endDate: "",
    },
    previousAddresses: [{ address: "", startDate: "", endDate: "" }],
    lastTravel: {
      monthYear: "",
      countriesVisited: "",
      durationWeeks: "",
      durationMonths: "",
      durationYears: "",
    },
    govtPositions: [{ position: "", startDate: "", endDate: "" }],
    resignedPositions: false,
    resignationDetails: "",
    solemnOathName: "",
    solemnOathSignature: "",
    solemnOathDate: "",
    solemnOathPlace: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showNextForm, setShowNextForm] = useState(false);

  // Fetch logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
      else setError("You must be logged in to submit this form.");
    });
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNestedChange = (section, field, value) =>
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  const handleArrayChange = (section, index, field, value) => {
    const updated = [...form[section]];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, [section]: updated }));
  };

  const addPreviousAddress = () =>
    setForm((prev) => ({
      ...prev,
      previousAddresses: [
        ...prev.previousAddresses,
        { address: "", startDate: "", endDate: "" },
      ],
    }));
  const removePreviousAddress = (i) =>
    setForm((prev) => ({
      ...prev,
      previousAddresses: prev.previousAddresses.filter((_, idx) => idx !== i),
    }));
  const addGovtPosition = () =>
    setForm((prev) => ({
      ...prev,
      govtPositions: [
        ...prev.govtPositions,
        { position: "", startDate: "", endDate: "" },
      ],
    }));
  const removeGovtPosition = (i) =>
    setForm((prev) => ({
      ...prev,
      govtPositions: prev.govtPositions.filter((_, idx) => idx !== i),
    }));

  function validate() {
    if (!user) {
      setError("You must be logged in to submit this form.");
      return false;
    }
    if (
      !form.currentAddress.trim() ||
      !form.currentAddressDuration.startDate ||
      !form.currentAddressDuration.endDate
    ) {
      setError("Please fill all required fields and dates.");
      return false;
    }
    if (
      form.previousAddresses.some(
        (a) => !a.address.trim() || !a.startDate || !a.endDate
      )
    ) {
      setError("Please fill all previous addresses.");
      return false;
    }
    if (form.resignedPositions && !form.resignationDetails.trim()) {
      setError("Provide resignation details.");
      return false;
    }
    if (
      !form.solemnOathName.trim() ||
      !form.solemnOathSignature.trim() ||
      !form.solemnOathDate ||
      !form.solemnOathPlace.trim()
    ) {
      setError("Please complete the solemn oath section.");
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const insertData = {
        user_id: user.id,
        current_address: form.currentAddress.trim(),
        current_address_duration_years:
          form.currentAddressDuration.years || null,
        current_address_duration_months:
          form.currentAddressDuration.months || null,
        current_address_duration_days: form.currentAddressDuration.days || null,
        current_address_start_date: form.currentAddressDuration.startDate,
        current_address_end_date: form.currentAddressDuration.endDate,
        previous_addresses: form.previousAddresses,
        last_travel_month_year: form.lastTravel.monthYear,
        last_travel_countries_visited: form.lastTravel.countriesVisited.trim(),
        last_travel_duration_weeks: form.lastTravel.durationWeeks || null,
        last_travel_duration_months: form.lastTravel.durationMonths || null,
        last_travel_duration_years: form.lastTravel.durationYears || null,
        govt_positions: form.govtPositions,
        resigned_positions: form.resignedPositions,
        resignation_details: form.resignationDetails.trim() || null,
        solemn_oath_name: form.solemnOathName.trim(),
        solemn_oath_signature: form.solemnOathSignature.trim(),
        solemn_oath_date: form.solemnOathDate,
        solemn_oath_place: form.solemnOathPlace.trim(),
      };

      const { error: insertError } = await supabase
        .from("aspirant_questionnaire")
        .insert([insertData]);
      if (insertError) throw insertError;

      setMessage("✅ Questionnaire submitted successfully.");
      setShowNextForm(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return (
      <p style={styles.error}>You must be logged in to submit this form.</p>
    );

  return (
    <div style={styles.container}>
      <h2>
        Aspirant Questionnaire to Establish Residency, Domicile & Compliance
      </h2>

      {!showNextForm ? (
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Current Address */}
          <label>
            1. Current home address (Street, Suburb, City/Town, County)
            <span style={styles.required}>*</span>
            <textarea
              name="currentAddress"
              value={form.currentAddress}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </label>

          {/* Current Address Duration */}
          <fieldset style={styles.fieldset}>
            <legend>
              2. Duration at current address (Exact number of years/months/days){" "}
              <span style={styles.required}>*</span>
            </legend>
            <div style={styles.durationRow}>
              {["years", "months", "days"].map((unit) => (
                <label key={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}:
                  <input
                    type="number"
                    min="0"
                    max={
                      unit === "months" ? 11 : unit === "days" ? 31 : undefined
                    }
                    value={form.currentAddressDuration[unit]}
                    onChange={(e) =>
                      handleNestedChange(
                        "currentAddressDuration",
                        unit,
                        e.target.value
                      )
                    }
                    style={styles.smallInput}
                  />
                </label>
              ))}
            </div>
            <div style={styles.dateRow}>
              <label>
                Start Date <span style={styles.required}>*</span>
                <input
                  type="date"
                  value={form.currentAddressDuration.startDate}
                  onChange={(e) =>
                    handleNestedChange(
                      "currentAddressDuration",
                      "startDate",
                      e.target.value
                    )
                  }
                  style={styles.dateInput}
                />
              </label>
              <label>
                End Date <span style={styles.required}>*</span>
                <input
                  type="date"
                  value={form.currentAddressDuration.endDate}
                  onChange={(e) =>
                    handleNestedChange(
                      "currentAddressDuration",
                      "endDate",
                      e.target.value
                    )
                  }
                  style={styles.dateInput}
                />
              </label>
            </div>
          </fieldset>

          {/* Previous Addresses */}
          <fieldset style={styles.fieldset}>
            <legend>
              3 & 4. Previous addresses last 1 year (most recent first){" "}
              <span style={styles.required}>*</span>
            </legend>
            {form.previousAddresses.map((addr, idx) => (
              <div key={idx} style={styles.previousAddressBlock}>
                <textarea
                  value={addr.address}
                  onChange={(e) =>
                    handleArrayChange(
                      "previousAddresses",
                      idx,
                      "address",
                      e.target.value
                    )
                  }
                  required
                  style={styles.textarea}
                  placeholder="Previous Address"
                />
                <div style={styles.dateRow}>
                  <input
                    type="date"
                    value={addr.startDate}
                    onChange={(e) =>
                      handleArrayChange(
                        "previousAddresses",
                        idx,
                        "startDate",
                        e.target.value
                      )
                    }
                    required
                    style={styles.dateInput}
                  />
                  <input
                    type="date"
                    value={addr.endDate}
                    onChange={(e) =>
                      handleArrayChange(
                        "previousAddresses",
                        idx,
                        "endDate",
                        e.target.value
                      )
                    }
                    required
                    style={styles.dateInput}
                  />
                  {form.previousAddresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePreviousAddress(idx)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addPreviousAddress}
              style={styles.addBtn}
            >
              + Add Previous Address
            </button>
          </fieldset>

          {/* Government Positions */}
          <fieldset style={styles.fieldset}>
            <legend>5. Government positions held in last 3 years</legend>
            {form.govtPositions.map((pos, idx) => (
              <div key={idx} style={styles.previousAddressBlock}>
                <input
                  type="text"
                  placeholder="Position"
                  value={pos.position}
                  onChange={(e) =>
                    handleArrayChange(
                      "govtPositions",
                      idx,
                      "position",
                      e.target.value
                    )
                  }
                  style={styles.textarea}
                />
                <div style={styles.dateRow}>
                  <input
                    type="date"
                    value={pos.startDate}
                    onChange={(e) =>
                      handleArrayChange(
                        "govtPositions",
                        idx,
                        "startDate",
                        e.target.value
                      )
                    }
                    style={styles.dateInput}
                  />
                  <input
                    type="date"
                    value={pos.endDate}
                    onChange={(e) =>
                      handleArrayChange(
                        "govtPositions",
                        idx,
                        "endDate",
                        e.target.value
                      )
                    }
                    style={styles.dateInput}
                  />
                  {form.govtPositions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGovtPosition(idx)}
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addGovtPosition}
              style={styles.addBtn}
            >
              + Add Government Position
            </button>
          </fieldset>

          {/* Resignation */}
          <label>
            9. Have you resigned from any positions?
            <input
              type="checkbox"
              checked={form.resignedPositions}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  resignedPositions: e.target.checked,
                }))
              }
            />
          </label>
          {form.resignedPositions && (
            <textarea
              placeholder="Resignation details"
              value={form.resignationDetails}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  resignationDetails: e.target.value,
                }))
              }
              style={styles.textarea}
            />
          )}

          {/* Solemn Oath */}
          <fieldset style={styles.fieldset}>
            <legend>
              Solemn Oath <span style={styles.required}>*</span>
            </legend>
            <input
              type="text"
              placeholder="Full Name"
              value={form.solemnOathName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, solemnOathName: e.target.value }))
              }
              style={styles.textarea}
            />
            <input
              type="text"
              placeholder="Signature"
              value={form.solemnOathSignature}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  solemnOathSignature: e.target.value,
                }))
              }
              style={styles.textarea}
            />
            <input
              type="date"
              value={form.solemnOathDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, solemnOathDate: e.target.value }))
              }
              style={styles.dateInput}
            />
            <input
              type="text"
              placeholder="Place"
              value={form.solemnOathPlace}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  solemnOathPlace: e.target.value,
                }))
              }
              style={styles.textarea}
            />
          </fieldset>

          {/* Messages */}
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Submitting..." : "Submit Questionnaire"}
          </button>
        </form>
      ) : (
        <div>
          <CandidateFinancialDisclosureForm
            userId={user.id}
            onSubmitSuccess={onSubmitSuccess}
          />
        </div>
      )}
    </div>
  );
}

// ---- Styles ----
const styles = {
  container: {
    maxWidth: 800,
    margin: "2rem auto",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f9faff",
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,85,164,0.15)",
    color: "#003366",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  fieldset: { border: "1.5px solid #0055A4", borderRadius: 6, padding: "1rem" },
  durationRow: { display: "flex", gap: "1rem", marginBottom: 12 },
  dateRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: 12,
  },
  smallInput: { width: 80, padding: "0.25rem 0.5rem", fontSize: 14 },
  dateInput: { padding: "0.3rem 0.5rem", fontSize: 14 },
  textarea: {
    width: "100%",
    minHeight: 40,
    padding: "0.5rem 0.8rem",
    borderRadius: 6,
    border: "1.5px solid #0055A4",
    fontSize: 16,
    fontWeight: 600,
    color: "#003366",
    outline: "none",
    marginBottom: 6,
  },
  addBtn: {
    marginTop: 8,
    padding: "0.5rem 1rem",
    fontWeight: 700,
    color: "#0055A4",
    border: "2px solid #0055A4",
    borderRadius: 6,
    backgroundColor: "transparent",
    cursor: "pointer",
    alignSelf: "start",
  },
  removeBtn: {
    marginLeft: 12,
    padding: "0.25rem 0.5rem",
    fontWeight: 700,
    color: "#D72631",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  error: { color: "#D72631", fontWeight: 700 },
  success: { color: "#4CAF50", fontWeight: 700 },
  submitButton: {
    padding: "0.85rem",
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#0055A4",
    color: "white",
    cursor: "pointer",
  },
  required: { color: "#D72631" },
  previousAddressBlock: { marginBottom: 12 },
};

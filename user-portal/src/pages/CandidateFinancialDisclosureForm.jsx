import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function CandidateFinancialDisclosureForm({
  userId,
  onSubmitSuccess,
}) {
  const [form, setForm] = useState({
    candidateName: "",
    independentParty: "",
    politicalParty: "",
    electionPosition: "",
    assessmentDate: "",
    assets: [{ description: "", location: "", marketValue: "" }],
    liabilities: [{ description: "", amount: "" }],
    otherIncome: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showDeclarationForm, setShowDeclarationForm] = useState(false);

  // Handle input change
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle array changes
  const handleArrayChange = (section, index, field, value) => {
    const updated = [...form[section]];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, [section]: updated }));
  };

  const addAsset = () =>
    setForm((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        { description: "", location: "", marketValue: "" },
      ],
    }));
  const removeAsset = (i) =>
    setForm((prev) => ({
      ...prev,
      assets: prev.assets.filter((_, idx) => idx !== i),
    }));

  const addLiability = () =>
    setForm((prev) => ({
      ...prev,
      liabilities: [...prev.liabilities, { description: "", amount: "" }],
    }));
  const removeLiability = (i) =>
    setForm((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((_, idx) => idx !== i),
    }));

  // Validation
  const validate = () => {
    if (!form.candidateName.trim() || !form.electionPosition.trim()) {
      setError("Please fill candidate name and election position.");
      return false;
    }
    if (
      form.assets.some((a) => !a.description || !a.location || !a.marketValue)
    ) {
      setError("Please complete all asset fields.");
      return false;
    }
    if (form.liabilities.some((l) => !l.description || !l.amount)) {
      setError("Please complete all liability fields.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: insertError } = await supabase
        .from("candidate_financial_disclosure")
        .insert([
          {
            user_id: userId,
            candidate_name: form.candidateName,
            independent_party: form.independentParty || null,
            political_party: form.politicalParty || null,
            election_position: form.electionPosition,
            assessment_date: form.assessmentDate || null,
            assets: form.assets,
            liabilities: form.liabilities,
            other_income: form.otherIncome || null,
          },
        ]);

      if (insertError) throw insertError;

      setMessage("✅ Financial disclosure submitted successfully.");
      setShowDeclarationForm(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showDeclarationForm) {
    return (
      <div style={styles.container}>
        <h2>
          Declaration of Candidate to Abide by Political Parties' Code of
          Conduct
        </h2>
        <p>
          I, (First Name) (Middle Name) (Last Name), hereby declare that if I
          qualify as an independent candidate to contest as{" "}
          {form.electionPosition}, I will abide by the Political Parties' Code
          of Conduct and shall be held liable for any breach thereof.
        </p>
        <p>
          <strong>FOR NEC USE ONLY:</strong>
        </p>
        <p>Declaration Received By: ___________________</p>
        <p>Signature: ___________________</p>
        <p>Date: ___________________</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Candidate Financial Disclosure Form</h2>
      <p>
        Set all incomes realized in Liberia and abroad during the last twelve
        months.
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Name of Candidate <span style={styles.required}>*</span>
          <input
            type="text"
            name="candidateName"
            value={form.candidateName}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label>
          Name of Independent Candidate / Political Party / Coalition / Alliance
          <input
            type="text"
            name="independentParty"
            value={form.independentParty}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label>
          Name of Political Party / Coalition / Alliance
          <input
            type="text"
            name="politicalParty"
            value={form.politicalParty}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label>
          Candidate for Election <span style={styles.required}>*</span>
          <input
            type="text"
            name="electionPosition"
            value={form.electionPosition}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label>
          Date of Assessment
          <input
            type="date"
            name="assessmentDate"
            value={form.assessmentDate}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        {/* Assets */}
        <fieldset style={styles.fieldset}>
          <legend>Assets (All assets above USD $5,000)</legend>
          <p>
            List all monies, bank balances, business documentation, stocks,
            securities, bonds, real estate, vehicles, and any fixed assets with
            market value above USD $5,000, including assets held abroad.
          </p>
          {form.assets.map((asset, idx) => (
            <div key={idx} style={styles.assetRow}>
              <input
                type="text"
                placeholder="Description of Asset"
                value={asset.description}
                onChange={(e) =>
                  handleArrayChange(
                    "assets",
                    idx,
                    "description",
                    e.target.value
                  )
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Location of Asset"
                value={asset.location}
                onChange={(e) =>
                  handleArrayChange("assets", idx, "location", e.target.value)
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Current Market Value"
                value={asset.marketValue}
                onChange={(e) =>
                  handleArrayChange(
                    "assets",
                    idx,
                    "marketValue",
                    e.target.value
                  )
                }
                style={styles.input}
              />
              {form.assets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAsset(idx)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAsset} style={styles.addBtn}>
            + Add Asset
          </button>
        </fieldset>

        {/* Liabilities */}
        <fieldset style={styles.fieldset}>
          <legend>Liabilities</legend>
          <p>
            State all debts, obligations, promissory notes, credits, and
            guarantees.
          </p>
          {form.liabilities.map((liab, idx) => (
            <div key={idx} style={styles.assetRow}>
              <input
                type="text"
                placeholder="Description"
                value={liab.description}
                onChange={(e) =>
                  handleArrayChange(
                    "liabilities",
                    idx,
                    "description",
                    e.target.value
                  )
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Amount"
                value={liab.amount}
                onChange={(e) =>
                  handleArrayChange(
                    "liabilities",
                    idx,
                    "amount",
                    e.target.value
                  )
                }
                style={styles.input}
              />
              {form.liabilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLiability(idx)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addLiability} style={styles.addBtn}>
            + Add Liability
          </button>
        </fieldset>

        {/* Other Income */}
        <label>
          Other Income
          <p>
            Set all incomes realized in Liberia and abroad during the last
            twelve months.
          </p>
          <input
            type="text"
            name="otherIncome"
            value={form.otherIncome}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <p>
          This form shall be submitted to the NEC with the nomination papers.
          Upon receiving the form, the NEC shall make all information contained
          in the candidate financial disclosure form available to the public.
        </p>
        <label>
          <input type="checkbox" required /> I certify that I have read the
          information.
        </label>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? "Submitting..." : "Submit Financial Disclosure"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "2rem auto",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f9faff",
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,85,164,0.15)",
    color: "#003366",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem 0.8rem",
    borderRadius: 6,
    border: "1.5px solid #0055A4",
    fontSize: 16,
    fontWeight: 600,
    color: "#003366",
    outline: "none",
    marginBottom: 6,
  },
  fieldset: {
    border: "1.5px solid #0055A4",
    borderRadius: 6,
    padding: "1rem",
    marginBottom: 12,
    backgroundColor: "#f0f5ff",
  },
  assetRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  addBtn: {
    padding: "0.4rem 0.8rem",
    fontWeight: 700,
    color: "#0055A4",
    border: "2px solid #0055A4",
    borderRadius: 6,
    backgroundColor: "transparent",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  removeBtn: {
    padding: "0.25rem 0.5rem",
    fontWeight: 700,
    color: "#D72631",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    alignSelf: "center",
  },
  submitButton: {
    padding: "0.85rem",
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#0055A4",
    color: "white",
    cursor: "pointer",
    marginTop: 12,
  },
  error: {
    color: "#D72631",
    fontWeight: 700,
    marginTop: 4,
  },
  success: {
    color: "#4CAF50",
    fontWeight: 700,
    marginTop: 4,
  },
  required: {
    color: "#D72631",
  },
  legend: {
    fontWeight: 700,
    color: "#003366",
    marginBottom: 6,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 600,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 14,
    color: "#003366",
    marginBottom: 8,
  },
};

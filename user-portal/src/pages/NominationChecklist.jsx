import React from "react";
import { useNavigate } from "react-router-dom";

export default function NominationChecklist() {
  const navigate = useNavigate();

  const checklistItems = [
    "Notarized Letter of Intent",
    "Sworn Declaration or Affidavit Attesting to Citizenship",
    "Sworn Declaration or Affidavit Attesting to Domicile/Residency",
    "Tax Clearance",
    "Candidate Questionnaire Regarding Residency and Domicile",
    "Candidate's Financial Disclosure Form",
    "Candidate Endorsement Form (Individual)",
    "Liberian Passport (if any), National or International Driver License",
    "Voter Registration Cards, National Identification Card and/or any other official document reflecting the candidate's address",
    "Receipt Showing Payment or Its Equivalent in Liberian Dollars for the Registration Fee to the NEC's Candidate Nomination Account",
    "US$500.00 for Representative",
    "General Endorsement Form",
    "Bank Statement Showing Deposit of $10,000.00 USD by the Party",
    "Proof of Indemnity/Insurance Bond of U$100,000.00",
    "Information on Established Office in the Capital of the District",
    "Notarized Letter of Authorization to Verify Bank Account",
    "Notarized Letter of Authorization to Verify Indemnity Insurance Bond",
  ];

  function handleNext() {
    navigate("/nomination-form");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Nomination Application Checklist</h1>
      <p style={styles.note}>
        <strong>Important Legal Notice:</strong> This checklist constitutes a
        legal declaration of the necessary documents and requirements for
        nomination. Ensure all items listed are complete and accurate before
        proceeding with your application.
      </p>

      <p style={styles.intro}>
        Please review the following documents carefully. These are required to
        complete your nomination application:
      </p>

      <ul style={styles.list}>
        {checklistItems.map((item, idx) => (
          <li key={idx} style={styles.listItem}>
            {item}
          </li>
        ))}
      </ul>

      <div style={styles.buttonGroup}>
        <button style={styles.printButton} onClick={handlePrint}>
          Print Checklist
        </button>
        <button style={styles.nextButton} onClick={handleNext}>
          Next: Start Nomination Application
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "2rem auto",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#003366",
    backgroundColor: "#f9fafe",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
    padding: "12px 16px",
    borderRadius: 8,
    fontWeight: "600",
    color: "#665c00",
    marginBottom: 24,
  },
  intro: {
    fontSize: 16,
    marginBottom: 16,
  },
  list: {
    listStyleType: "disc",
    paddingLeft: 20,
    marginBottom: 32,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  printButton: {
    flex: 1,
    padding: "12px 16px",
    fontSize: 16,
    fontWeight: "600",
    borderRadius: 6,
    border: "2px solid #0055A4",
    backgroundColor: "transparent",
    color: "#0055A4",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  nextButton: {
    flex: 2,
    padding: "12px 16px",
    fontSize: 16,
    fontWeight: "700",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#0055A4",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

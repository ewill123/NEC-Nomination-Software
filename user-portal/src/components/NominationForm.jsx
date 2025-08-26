import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import existing components
import ChecklistStep from "../components/ChecklistStep";
import LetterOfIntentStep from "../components/LetterOfIntentStep";
import PartyDocs from "../components/PartyDocs";

export default function NominationForm() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  function handleNextStep(newData) {
    setFormData((prev) => ({ ...prev, ...newData }));
    setCurrentStep((prev) => prev + 1);
  }

  function handlePrevStep() {
    setCurrentStep((prev) => prev - 1);
  }

  function handleSubmit(finalData) {
    console.log("Submitting nomination data:", finalData);
    navigate("/nomination-dashboard");
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <ChecklistStep formData={formData} onNext={handleNextStep} />;
      case 2:
        return (
          <LetterOfIntentStep
            formData={formData}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      case 3:
        return (
          <PartyDocs
            formData={formData}
            onBack={handlePrevStep}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Nomination Application Form</h1>
      <p style={styles.legalNotice}>
        <strong>Legal Notice:</strong> This form is part of an official NEC
        nomination process. All information provided is legally binding and
        subject to verification by the National Elections Commission.
      </p>

      {renderStep()}

      <p style={styles.stepIndicator}>Step {currentStep} of 3</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "2rem auto",
    padding: "1rem 2rem",
    backgroundColor: "#f9fafe",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 16,
    textAlign: "center",
    color: "#003366",
  },
  legalNotice: {
    backgroundColor: "#FFFBCC",
    border: "1px solid #FFEB3B",
    padding: "12px 16px",
    borderRadius: 8,
    fontWeight: "600",
    color: "#665c00",
    marginBottom: 24,
  },
  stepIndicator: {
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
    color: "#333",
  },
};

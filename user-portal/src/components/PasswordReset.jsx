import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";

const containerStyle = {
  maxWidth: "400px",
  margin: "2rem auto",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  color: "#1B2938",
  userSelect: "none",
};

const headingStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  marginBottom: "1rem",
  color: "#003366",
};

const warningStyle = {
  backgroundColor: "#FDEDEC",
  border: "1px solid #F5C6CB",
  color: "#721C24",
  padding: "1rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  fontWeight: "600",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "0.5rem",
  color: "#003366",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
  marginBottom: "1rem",
  outline: "none",
  transition: "border-color 0.3s ease",
};

const checkboxContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "1rem",
  color: "#003366",
  fontWeight: "600",
  userSelect: "none",
};

const checkboxStyle = {
  marginRight: "0.5rem",
  width: "18px",
  height: "18px",
  cursor: "pointer",
};

const buttonStyle = {
  width: "100%",
  padding: "0.85rem",
  fontSize: "1.1rem",
  borderRadius: "0.75rem",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#0055A4",
  color: "#fff",
  fontWeight: "700",
  boxShadow: "0 5px 20px rgba(0, 85, 164, 0.6)",
  transition: "background-color 0.3s ease",
  userSelect: "none",
};

const buttonDisabledStyle = {
  backgroundColor: "rgba(0, 85, 164, 0.5)",
  cursor: "not-allowed",
  boxShadow: "none",
};

const messageStyle = {
  marginTop: "1rem",
  fontWeight: "700",
  textAlign: "center",
};

const errorMessageStyle = {
  ...messageStyle,
  color: "#D72631",
};

const successMessageStyle = {
  ...messageStyle,
  color: "#007A33",
};

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  async function handleReset(e) {
    e.preventDefault();

    if (!confirmed) {
      setIsError(true);
      setMessage(
        "Please confirm that you understand the implications before proceeding."
      );
      return;
    }

    if (!email) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login", // update to your login URL
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage(
        "If this email is registered, a password reset link has been sent."
      );
    }
    setLoading(false);
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Reset Password</h2>

      <div style={warningStyle} role="alert" aria-live="polite">
        <strong>Important:</strong> Resetting your password is a serious action
        affecting your access to the NEC portal. Unauthorized resets may lead to
        legal consequences. Please proceed only if you initiated this request.
      </div>

      <form onSubmit={handleReset} noValidate>
        <label htmlFor="email" style={labelStyle}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          disabled={loading}
          required
          autoComplete="email"
        />

        <label style={checkboxContainer}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
            disabled={loading}
            style={checkboxStyle}
            aria-required="true"
          />
          I understand the implications and want to reset my password.
        </label>

        <button
          type="submit"
          disabled={!confirmed || loading}
          style={{
            ...buttonStyle,
            ...(!confirmed || loading ? buttonDisabledStyle : {}),
          }}
          aria-disabled={!confirmed || loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && (
        <p
          style={isError ? errorMessageStyle : successMessageStyle}
          role="alert"
          aria-live="assertive"
        >
          {message}
        </p>
      )}
    </div>
  );
}

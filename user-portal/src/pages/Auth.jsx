import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import necLogo from "../assets/nec-logo.png";

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #003366 0%, #0055A4 100%)",
  padding: "1rem",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const glassCardStyle = {
  background: "rgba(255, 255, 255, 0.12)",
  borderRadius: "1rem",
  boxShadow: "0 8px 32px 0 rgba(0, 51, 102, 0.37)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  width: "400px",
  maxWidth: "90vw",
  padding: "2.5rem 3rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  color: "#fff",
  userSelect: "none",
};

const logoStyle = {
  display: "block",
  margin: "0 auto 1.5rem auto",
  width: "120px",
  height: "auto",
  filter: "drop-shadow(0 0 5px rgba(0, 51, 102, 0.6))",
};

const titleStyle = {
  textAlign: "center",
  fontWeight: "700",
  fontSize: "2rem",
  letterSpacing: "1.5px",
  textShadow: "0 0 12px rgba(255, 255, 255, 0.3)",
  fontFamily: "'Segoe UI Semibold', Tahoma, Geneva, Verdana, sans-serif",
};

const inputStyle = {
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  borderRadius: "0.5rem",
  border: "none",
  outline: "none",
  background: "rgba(255, 255, 255, 0.18)",
  color: "#003366",
  boxShadow:
    "inset 2px 2px 6px rgba(255,255,255,0.3), inset -2px -2px 6px rgba(0,51,102,0.3)",
  transition: "background 0.3s ease, color 0.3s ease",
  caretColor: "#0055A4",
  fontWeight: "600",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const inputFocusStyle = {
  background: "#ffffff",
  color: "#003366",
  boxShadow: "0 0 8px 2px rgba(0, 85, 164, 0.6)",
};

const buttonStyle = {
  padding: "0.85rem",
  fontSize: "1.1rem",
  borderRadius: "0.75rem",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(90deg, #0055A4 0%, #003366 100%)",
  color: "#fff",
  fontWeight: "700",
  boxShadow: "0 5px 20px rgba(0, 85, 164, 0.6)",
  transition: "background 0.3s ease",
  userSelect: "none",
  fontFamily: "'Segoe UI Semibold', Tahoma, Geneva, Verdana, sans-serif",
};

const buttonDisabledStyle = {
  background: "rgba(0, 85, 164, 0.5)",
  cursor: "not-allowed",
  boxShadow: "none",
};

const toggleTextStyle = {
  textAlign: "center",
  color: "rgba(255, 255, 255, 0.85)",
  cursor: "pointer",
  marginTop: "1.25rem",
  fontWeight: "600",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  textShadow: "0 0 8px rgba(0, 0, 0, 0.25)",
  userSelect: "none",
};

const messageStyle = {
  textAlign: "center",
  marginTop: "0.5rem",
  fontWeight: "700",
  fontFamily: "'Segoe UI Semibold', Tahoma, Geneva, Verdana, sans-serif",
  textShadow: "0 0 6px rgba(0, 0, 0, 0.2)",
};

const errorMessageStyle = {
  ...messageStyle,
  color: "#D72631",
};

const successMessageStyle = {
  ...messageStyle,
  color: "#7BAFD4",
};

function generatePasscode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to ensure user profile exists after auth
async function ensureUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Check if profile exists
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!data) {
    // Insert new profile row
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        email: user.email,
        full_name: "",
        avatar_url: null,
      },
    ]);
    if (insertError) {
      console.error("Error creating profile:", insertError);
    } else {
      console.log("Profile created for user:", user.id);
    }
  }
}

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setMessage("");
    setIsError(false);
    setShowPassword(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsError(true);
          setMessage(error.message);
        } else {
          // Ensure profile exists on login
          await ensureUserProfile();

          setIsError(false);
          setMessage("Logged in successfully!");
          navigate("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setIsError(true);
          setMessage(error.message);
        } else {
          const userId = data.user.id;
          const passcode = generatePasscode();

          // Save passcode in user_passcodes table
          const { error: insertPasscodeError } = await supabase
            .from("user_passcodes")
            .insert([{ user_id: userId, passcode }]);

          if (insertPasscodeError) {
            setIsError(true);
            setMessage("Signup failed: Could not save passcode.");
            setLoading(false);
            return;
          }

          // Ensure profile exists on signup
          await ensureUserProfile();

          setIsError(false);
          setMessage(
            `Signup successful! Your unique passcode is ${passcode}. Check your email for confirmation.`
          );
          // Optionally you can redirect or let user login manually now
        }
      }
    } catch (err) {
      setIsError(true);
      setMessage("Unexpected error, please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form
        style={glassCardStyle}
        onSubmit={handleSubmit}
        aria-label={isLogin ? "Login form" : "Signup form"}
        noValidate
      >
        <img src={necLogo} alt="NEC Liberia Logo" style={logoStyle} />

        <h2 style={titleStyle}>{isLogin ? "Login" : "Signup"}</h2>

        <input
          style={{
            ...inputStyle,
            ...(emailFocused ? inputFocusStyle : {}),
          }}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          required
          autoComplete="email"
          aria-required="true"
          aria-label="Email address"
        />

        <div style={{ position: "relative" }}>
          <input
            style={{
              ...inputStyle,
              ...(passwordFocused ? inputFocusStyle : {}),
              paddingRight: "3.5rem",
            }}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-required="true"
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(0, 51, 102, 0.85)",
              fontWeight: "600",
              fontSize: "0.9rem",
              userSelect: "none",
              padding: 0,
              textShadow: "0 0 5px rgba(255,255,255,0.8)",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            ...(loading ? buttonDisabledStyle : {}),
          }}
          aria-busy={loading}
        >
          {loading
            ? isLogin
              ? "Logging in..."
              : "Signing up..."
            : isLogin
            ? "Login"
            : "Signup"}
        </button>

        {message && (
          <p
            style={isError ? errorMessageStyle : successMessageStyle}
            role="alert"
          >
            {message}
          </p>
        )}

        <p
          style={toggleTextStyle}
          onClick={toggleForm}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleForm();
          }}
          role="button"
          aria-pressed={!isLogin}
        >
          {isLogin
            ? "Don't have an account? Signup here"
            : "Already have an account? Login here"}
        </p>
      </form>
    </div>
  );
}

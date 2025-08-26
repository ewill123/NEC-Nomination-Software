import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const containerStyle = {
  minHeight: "80vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  background: "linear-gradient(135deg, #003366 0%, #0055A4 100%)",
  padding: "2rem",
  userSelect: "none",
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.15)",
  borderRadius: "1rem",
  boxShadow: "0 8px 32px 0 rgba(0, 51, 102, 0.37)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  width: "400px",
  maxWidth: "90vw",
  padding: "2rem 3rem",
  color: "#fff",
  textAlign: "center",
};

const headingStyle = {
  fontWeight: "700",
  fontSize: "1.8rem",
  marginBottom: "1.5rem",
  textShadow: "0 0 12px rgba(255, 255, 255, 0.4)",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "0.5rem",
  color: "rgba(255, 255, 255, 0.85)",
  textShadow: "0 0 5px rgba(0, 0, 0, 0.15)",
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 1rem",
  borderRadius: "0.6rem",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  fontWeight: "600",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  background: "rgba(255, 255, 255, 0.18)",
  color: "#003366",
  boxShadow:
    "inset 2px 2px 6px rgba(255,255,255,0.3), inset -2px -2px 6px rgba(0,51,102,0.3)",
  transition: "background 0.3s ease, color 0.3s ease",
};

const inputDisabledStyle = {
  ...inputStyle,
  background: "rgba(255, 255, 255, 0.12)",
  color: "rgba(0, 51, 102, 0.6)",
  cursor: "not-allowed",
  userSelect: "text",
};

const buttonStyle = {
  marginTop: "1.75rem",
  width: "100%",
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

const avatarStyle = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  objectFit: "cover",
  margin: "0 auto 1rem auto",
  boxShadow: "0 0 12px rgba(255, 255, 255, 0.7)",
};

const messageStyle = {
  marginTop: "1rem",
  textAlign: "center",
  fontWeight: "700",
  textShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
};

const errorMessageStyle = {
  ...messageStyle,
  color: "#D72631",
};

const successMessageStyle = {
  ...messageStyle,
  color: "#7BAFD4",
};

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsError(true);
        setMessage("Could not get user session.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (error) {
        setIsError(true);
        setMessage("Failed to fetch profile data.");
      } else if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setEmail(data.email || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function uploadAvatar(e) {
    setUploading(true);
    setMessage(null);
    setIsError(false);

    const file = e.target.files[0];
    if (!file) {
      setUploading(false);
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated.");

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL after upload
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      setMessage("Avatar uploaded successfully!");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsError(true);
        setMessage("User not authenticated.");
        setLoading(false);
        return;
      }

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        setIsError(true);
        setMessage("Failed to update profile: " + error.message);
      } else {
        setIsError(false);
        setMessage("Profile updated successfully!");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} aria-live="polite">
        <h2 style={headingStyle}>Edit Profile</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleUpdate} noValidate>
            <label htmlFor="email" style={labelStyle}>
              Email (read-only)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              style={inputDisabledStyle}
            />

            <label htmlFor="fullName" style={labelStyle}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your full name"
            />

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Avatar</label>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={avatarStyle} />
            ) : (
              <div
                style={{
                  ...avatarStyle,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  lineHeight: "100px",
                  color: "#003366",
                  fontWeight: "700",
                  userSelect: "none",
                }}
              >
                No Avatar
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              style={{ marginTop: "0.75rem" }}
              aria-label="Upload avatar image"
            />

            <button
              type="submit"
              disabled={loading || uploading}
              style={{
                ...buttonStyle,
                ...(loading || uploading ? buttonDisabledStyle : {}),
              }}
            >
              {loading
                ? "Saving..."
                : uploading
                ? "Uploading avatar..."
                : "Save Changes"}
            </button>

            {message && (
              <p
                style={isError ? errorMessageStyle : successMessageStyle}
                role="alert"
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

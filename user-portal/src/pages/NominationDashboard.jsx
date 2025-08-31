// src/pages/NominationDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PartyDocs from "../components/PartyDocs";
import NominationForm from "../components/NominationForm";
import ProfileEditor from "../components/ProfileEditor";
import PasswordReset from "../components/PasswordReset";
import AspirantQuestionnaire from "../pages/AspirantQuestionnaire";
import { supabase } from "../utils/supabaseClient";

export default function NominationDashboard() {
  const [activeTab, setActiveTab] = useState("party");
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    avatar_url: null,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/"); // If no user, redirect to login
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setUserProfile({ name: "", email: user.email, avatar_url: null });
      } else {
        setUserProfile({
          name: data.full_name || "",
          email: data.email || user.email,
          avatar_url: data.avatar_url || null,
        });
      }
      setLoadingProfile(false);
    }

    fetchProfile();
  }, [navigate]);

  const tabs = [
    { key: "party", label: "Party Document Submission" },
    { key: "nomination", label: "Nomination Process" },
    { key: "questionnaire", label: "Aspirant Questionnaire" },
    { key: "profile", label: "Edit Profile" },
    { key: "password", label: "Reset Password" },
  ];

  // Handle user logout
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/"); // Redirect to login
    } catch (error) {
      setLogoutError(error.message);
      setLoggingOut(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.profileBox}>
          {loadingProfile ? (
            <div style={{ ...styles.avatar, ...styles.avatarLoading }} />
          ) : userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt="User avatar"
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarFallback}>
              {(userProfile.name
                ? userProfile.name.charAt(0)
                : userProfile.email.charAt(0)
              ).toUpperCase()}
            </div>
          )}
          <h2 style={styles.profileName}>
            {userProfile.name || userProfile.email || "User"}
          </h2>
          <p style={styles.profileEmail}>{userProfile.email}</p>
        </div>

        <nav style={styles.nav}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                ...styles.navButton,
                ...(activeTab === key ? styles.navButtonActive : {}),
              }}
              aria-pressed={activeTab === key}
              disabled={loggingOut}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            ...styles.logoutButton,
            ...(loggingOut ? styles.logoutButtonDisabled : {}),
          }}
          aria-label="Logout"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
        {logoutError && (
          <p style={styles.logoutError} role="alert">
            {logoutError}
          </p>
        )}
      </aside>

      {/* Main content */}
      <main style={styles.mainContent}>
        <h1 style={styles.heading}>NEC Nomination Dashboard</h1>

        <section style={styles.contentSection}>
          {activeTab === "party" && <PartyDocs />}
          {activeTab === "nomination" && <NominationForm />}
          {activeTab === "questionnaire" && <AspirantQuestionnaire />}
          {activeTab === "profile" && <ProfileEditor />}
          {activeTab === "password" && <PasswordReset />}
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1B2938",
    backgroundColor: "#F7F9FC",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#fff",
    boxShadow: "2px 0 8px rgba(27, 41, 56, 0.1)",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    boxSizing: "border-box",
  },
  profileBox: {
    marginBottom: 40,
    textAlign: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 16px",
    border: "3px solid #0055A4",
    boxShadow: "0 2px 12px rgba(0, 85, 164, 0.3)",
    backgroundColor: "#EEE",
  },
  avatarLoading: {
    backgroundColor: "#D1D5DB",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    backgroundColor: "#0055A4",
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
    boxShadow: "0 2px 12px rgba(0, 85, 164, 0.6)",
    userSelect: "none",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    color: "#003366",
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748B",
    userSelect: "text",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  navButton: {
    padding: "12px 20px",
    fontSize: 16,
    fontWeight: 600,
    color: "#0055A4",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.3s ease",
    boxShadow: "inset 0 0 0 0 transparent",
    userSelect: "none",
  },
  navButtonActive: {
    backgroundColor: "#0055A4",
    color: "#fff",
    boxShadow: "inset 4px 0 0 0 #003366",
  },
  logoutButton: {
    marginTop: "auto",
    padding: "12px 20px",
    fontSize: 16,
    fontWeight: 600,
    color: "#D72631",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.3s ease, color 0.3s ease",
    userSelect: "none",
  },
  logoutButtonDisabled: {
    color: "rgba(215, 38, 49, 0.5)",
    cursor: "not-allowed",
  },
  logoutError: {
    marginTop: 8,
    color: "#D72631",
    fontWeight: "600",
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
    padding: "40px 48px",
    overflowY: "auto",
  },
  heading: {
    fontSize: 36,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 28,
  },
  contentSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    minHeight: 520,
  },
};

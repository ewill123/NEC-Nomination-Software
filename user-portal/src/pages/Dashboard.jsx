import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState(null);
  const [approved, setApproved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      // Fetch passcode & approval status
      const { data, error } = await supabase
        .from("user_passcodes")
        .select("passcode, approved")
        .eq("user_id", user.id)
        .single();

      if (error) {
        alert("Failed to load your approval status.");
        return;
      }

      setPasscode(data.passcode);
      setApproved(data.approved);

      // Check if profile exists
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      // If profile missing, create a default one
      if (profileError || !profile) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: "",
          avatar_url: null,
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const goToNominationDashboard = () => {
    navigate("/nomination-dashboard"); // your actual nomination dashboard path
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #003366 0%, #0055A4 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1>Welcome to NEC Nomination portal!</h1>

      {!approved ? (
        <>
          <p>Your account is pending admin approval.</p>
          <p>
            Your unique passcode:{" "}
            <strong
              style={{
                fontSize: "1.5rem",
                letterSpacing: "0.1em",
                background: "rgba(255, 255, 255, 0.15)",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                userSelect: "all",
              }}
            >
              {passcode}
            </strong>
          </p>
          <p>
            Please wait for an admin to approve your account before accessing
            the full portal.
          </p>
        </>
      ) : (
        <>
          <p>Your account is approved! You now have full access.</p>
          <button
            onClick={goToNominationDashboard}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              borderRadius: "0.5rem",
              background: "#009688",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              boxShadow: "0 5px 15px rgba(0, 150, 136, 0.7)",
            }}
          >
            Go to Nomination Dashboard
          </button>
        </>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
          background: "#D72631",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: "700",
          boxShadow: "0 5px 15px rgba(215, 38, 49, 0.7)",
        }}
      >
        Logout
      </button>
    </div>
  );
}

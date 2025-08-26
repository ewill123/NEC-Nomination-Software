import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import LetterOfIntentStep from "./components/LetterOfIntentStep";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NominationDashboard from "./pages/NominationDashboard";
import NominationChecklist from "./pages/NominationChecklist";
import NominationForm from "./components/NominationForm";
import AspirantQuestionnaire from "./pages/AspirantQuestionnaire";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nomination-dashboard" element={<NominationDashboard />} />
        <Route path="/letter-of-intent" element={<LetterOfIntentStep />} />
        <Route path="/nomination-checklist" element={<NominationChecklist />} />
        <Route path="/nomination-form" element={<NominationForm />} />
        <Route path="/questionnaire" element={<AspirantQuestionnaire />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

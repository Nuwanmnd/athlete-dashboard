// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, RequireAuth } from "@/auth/AuthProvider";

// Shell/layout
import ProtectedLayout from "@/App";

// Public auth pages
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// App pages
import Dashboard from "@/pages/Dashboard";
import AddAthlete from "@/pages/AddAthlete";
import NewAssessment from "@/pages/NewAssessment";
import MovementAssessmentPage from "@/pages/MovementAssessmentPage";
import AthleteProfile from "@/pages/AthleteProfile";
import InjuryPage from "@/pages/InjuryPage";
import AthleteList from "@/pages/AthleteList";
import Settings from "@/pages/Settings";

import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public (no sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected (shows sidebar) */}
          <Route
            element={
              <RequireAuth>
                <ProtectedLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-athlete" element={<AddAthlete />} />
            <Route path="assessments/new" element={<NewAssessment />} />
            <Route path="movement" element={<MovementAssessmentPage />} />
            <Route path="injury" element={<InjuryPage />} />
            <Route path="athletes-list" element={<AthleteList />} />
            <Route path="athletes/:id" element={<AthleteProfile />} />
            <Route path="athletes/:id/injury" element={<InjuryPage />} />
            <Route
              path="athletes/:id/movement-assessment"
              element={<MovementAssessmentPage />}
            />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

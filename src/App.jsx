import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Upload from "./pages/upload";
import Search from "./pages/search";
import Jobs from "./pages/Jobs";
import Candidate from "./pages/Candidate";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const navigate = useNavigate();

useEffect(() => {
  if (!isLoggedIn && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    navigate("/login");
  }
}, [isLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show navbar only when logged in */}
      {isLoggedIn && <Navbar onLogout={handleLogout} />}

      <main className="p-6 max-w-6xl mx-auto">
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/upload" replace />
              ) : (
                <Login onLogin={(success) => setIsLoggedIn(success)} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isLoggedIn ? (
                <Navigate to="/upload" replace />
              ) : (
                <Signup onSignupSuccess={() => navigate("/login")} />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/upload"
            element={isLoggedIn ? <Upload /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/search"
            element={isLoggedIn ? <Search /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/jobs"
            element={isLoggedIn ? <Jobs /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/candidates/:id"
            element={isLoggedIn ? <Candidate /> : <Navigate to="/login" replace />}
          />

          {/* Default route */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/upload" : "/login"} replace />}
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
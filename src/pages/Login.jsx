import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        if (onLogin) onLogin(true);
        else navigate("/upload");
      } else {
        setError(data.detail || "Invalid username or password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30"
      >
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Welcome Back 👋
        </h1>
        <p className="text-center text-blue-700 mb-8">
          Sign in to continue to{" "}
          <span className="font-semibold">ResumeRAG</span>
        </p>

        {/* 👇 Hackathon Credentials Section */}
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
  <p className="font-semibold mb-1">🧑‍💼 Judge Test Credentials:</p>

  <p>
    <strong>Recruiter</strong> → username: <code>admin123</code>, password:{" "}
    <code>admin123</code>
  </p>
  <p>
    <strong>Candidate</strong> → username: <code>candidate1</code>, password:{" "}
    <code>candidate123</code>
  </p>

  <p className="mt-3 text-gray-700 leading-relaxed">
    🔹 Recruiter can <b>create and manage jobs</b>.<br />
    🔹 Candidate can <b>upload resume and apply for jobs</b>.
  </p>

  <p className="mt-3 text-blue-700 font-medium">
    💡 You can also <b>sign up</b> with your own account and choose your role
    (Recruiter or Candidate) during registration.
  </p>
</div>


        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-700 font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </motion.div>

      {/* Footer note for judges */}
      <p className="text-xs text-gray-700 mt-6 text-center max-w-md">
        💡 For testing: If you sign up, choose <b>Recruiter</b> role to create
        jobs or <b>Candidate</b> to upload resumes. Your login credentials will
        work immediately.
      </p>
    </div>
  );
}

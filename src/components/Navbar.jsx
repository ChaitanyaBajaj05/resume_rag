import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/upload" className="text-2xl font-extrabold text-blue-700 tracking-wide">
            ResumeRag
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-10 mr-6">
            <Link
              to="/upload"
              className="px-3 py-2 rounded-md text-lg font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition duration-150"
            >
              Upload
            </Link>
            <Link
              to="/search"
              className="px-3 py-2 rounded-md text-lg font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition duration-150"
            >
              Search
            </Link>
            <Link
              to="/jobs"
              className="px-3 py-2 rounded-md text-lg font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition duration-150"
            >
              Jobs
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="hidden md:inline-block bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <Link
            to="/upload"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-blue-700 font-medium hover:bg-blue-100 transition"
          >
            Upload
          </Link>
          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-blue-700 font-medium hover:bg-blue-100 transition"
          >
            Search
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 text-blue-700 font-medium hover:bg-blue-100 transition"
          >
            Jobs
          </Link>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

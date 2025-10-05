import React, { useState, useEffect } from "react";
import { createJob, matchJob, listJobs } from "../api";
import toast, { Toaster } from "react-hot-toast";

export default function Jobs() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reqs, setReqs] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      setLoadingJobs(true);
      try {
        const jobsList = await listJobs();
        setJobs(jobsList);
        if (jobsList.length > 0) setSelectedJob(jobsList[0]);
      } catch (err) {
        toast.error("Failed to load jobs.");
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleCreate() {
    if (!title.trim() || !desc.trim()) {
      toast.error("Title and Description are required.");
      return;
    }
    setLoadingCreate(true);
    try {
      const data = {
        title,
        description: desc,
        requirements: reqs.split(",").map((r) => r.trim()).filter(Boolean),
      };
      const idempotencyKey = crypto.randomUUID();
      const res = await createJob(data, idempotencyKey);
      toast.success("Job created successfully!");
      setTitle("");
      setDesc("");
      setReqs("");
      const updatedJobs = await listJobs();
      setJobs(updatedJobs);
      setSelectedJob(res);
      setMatchResult(null);
    } catch (err) {
      toast.error(err.message || "Error creating job.");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleMatch() {
    if (!selectedJob?.id) {
      toast.error("Select a job first.");
      return;
    }
    setLoadingMatch(true);
    try {
      const res = await matchJob(selectedJob.id, 10);
      setMatchResult(res);
      toast.success("Matching completed.");
    } catch (err) {
      toast.error(err.message || "Error matching resumes.");
    } finally {
      setLoadingMatch(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6 flex flex-col md:flex-row md:justify-center md:gap-10 gap-6">
        {/* Create Job Section */}
        <section className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg flex flex-col">
          <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center">Create Job</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="space-y-5"
          >
            <input
              type="text"
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loadingCreate}
              required
              autoFocus
              aria-label="Job Title"
            />
            <textarea
              placeholder="Job Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              disabled={loadingCreate}
              required
              aria-label="Job Description"
            />
            <input
              type="text"
              placeholder="Requirements (comma separated)"
              value={reqs}
              onChange={(e) => setReqs(e.target.value)}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loadingCreate}
              aria-label="Job Requirements"
            />
            <button
              type="submit"
              disabled={loadingCreate}
              className={`w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              aria-busy={loadingCreate}
            >
              {loadingCreate && (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loadingCreate ? "Creating..." : "Create Job"}
            </button>
          </form>
        </section>

        {/* Jobs List & Match Section */}
        <section className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-lg flex flex-col">
          <h2 className="text-3xl font-semibold text-blue-800 mb-5 text-center">Open Jobs</h2>
          {loadingJobs ? (
            <div className="flex justify-center items-center h-[400px]">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center text-gray-600">No jobs available</p>
          ) : (
            <ul className="flex flex-col gap-4 overflow-y-auto max-h-[400px]">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`cursor-pointer p-4 rounded-lg border transition-shadow duration-300 ${
                    selectedJob?.id === job.id
                      ? "bg-blue-100 border-blue-700 shadow-lg"
                      : "border-gray-300 hover:border-blue-500 hover:shadow-md"
                  }`}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && setSelectedJob(job)}
                  role="button"
                  aria-pressed={selectedJob?.id === job.id}
                >
                  <h3 className="text-xl font-semibold text-blue-800 truncate">{job.title}</h3>
                  <p className="text-gray-700 text-sm mt-2 line-clamp-3">{job.description}</p>
                  <p className="text-blue-600 mt-1 text-xs italic">
                    Requirements: {job.requirements?.join(", ") || "None"}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Selected Job Details & Match Button */}
          {selectedJob && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg shadow-lg border border-blue-300">
              <h3 className="text-2xl font-semibold text-blue-700 border-b border-blue-400 pb-3 mb-4">
                Selected Job Details
              </h3>
              <p className="text-blue-900 mb-2">
                <strong>Title:</strong> {selectedJob.title}
              </p>
              <p className="text-blue-900 mb-2 whitespace-pre-wrap">{selectedJob.description}</p>
              <p className="text-blue-700 italic mb-4">
                <strong>Requirements:</strong> {selectedJob.requirements?.join(", ")}
              </p>
              <button
                onClick={handleMatch}
                disabled={loadingMatch}
                className={`w-full py-3 rounded-lg font-bold text-white transition duration-300 ${
                  loadingMatch ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
                } flex items-center justify-center gap-2`}
                aria-busy={loadingMatch}
              >
                {loadingMatch && (
                  <svg
                    className="w-6 h-6 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {loadingMatch ? "Matching..." : "Match Resumes"}
              </button>
            </div>
          )}

          {/* Match Results */}
          {matchResult && (
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg max-h-[400px] overflow-y-auto border border-blue-200">
              <h3 className="text-2xl font-semibold text-blue-900 border-b border-blue-300 pb-3 mb-4">
                Matched Resumes
              </h3>
              {matchResult.matches.length === 0 ? (
                <p className="text-center text-blue-700 font-medium">No matches found.</p>
              ) : (
                matchResult.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition"
                    role="listitem"
                    tabIndex={0}
                  >
                    <p className="font-semibold text-blue-800 select-text">
                      Resume ID: {m.resume_id}
                    </p>
                    <p className="text-green-700 font-semibold">Score: {m.score.toFixed(2)}</p>
                    <div className="mt-3 space-y-2">
                      {m.evidence.map((e, i) => (
                        <p
                          key={i}
                          className="text-blue-900 text-sm bg-white rounded-lg border border-blue-200 p-3 shadow-sm"
                        >
                          {e.text.length > 200 ? e.text.slice(0, 200) + "..." : e.text}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

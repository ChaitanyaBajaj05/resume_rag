import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ask, getResume } from "../api";
import toast, { Toaster } from "react-hot-toast";

export default function Search() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy] = useState("score");
  const pageSize = 5;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const searchQuery = searchParams.get("q") || "";
    const loc = searchParams.get("location") || "";
    const exp = searchParams.get("experience") || "";

    setQ(searchQuery);
    setLocation(loc);
    setExperience(exp);

    if (searchQuery) {
      runSearch(searchQuery, loc, exp, 1);
    }
  }, []);

  const saveSearchHistory = (query, loc, exp) => {
    try {
      let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const newEntry = { query, location: loc, experience: exp, timestamp: Date.now() };
      history = history.filter(h => !(h.query === query && h.location === loc && h.experience === exp));
      history.unshift(newEntry);
      history = history.slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(history));
    } catch {}
  };

  async function fetchResults(query, loc, exp, pageNum) {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let apiQuery = query;
      if (loc) apiQuery += ` location:${loc}`;
      if (exp) apiQuery += ` experience:${exp}`;

      const limit = pageSize;
      const res = await ask(apiQuery, limit);

      const enriched = await Promise.all(
        res.answers.map(async (a) => {
          try {
            const data = await getResume(a.resume_id);
            return { ...a, filename: data.filename || a.resume_id };
          } catch {
            return { ...a, filename: a.resume_id };
          }
        })
      );

      if (pageNum === 1) setAnswers(enriched);
      else setAnswers(prev => [...prev, ...enriched]);

      setHasMore(enriched.length === limit);
    } catch {
      toast.error("Error fetching results");
    } finally {
      setLoading(false);
    }
  }

  function runSearch(qs = q, loc = location, exp = experience, p = 1) {
    setPage(p);
    setQ(qs);
    setLocation(loc);
    setExperience(exp);

    const params = {};
    if (qs) params.q = qs;
    if (loc) params.location = loc;
    if (exp) params.experience = exp;
    setSearchParams(params);

    saveSearchHistory(qs, loc, exp);
    fetchResults(qs, loc, exp, p);
  }

  function loadMore() {
    runSearch(q, location, experience, page + 1);
  }

  function highlightText(text) {
    if (!q) return text;
    try {
      const words = q.trim().split(/\s+/);
      let parts = [text];
      words.forEach(word => {
        const regex = new RegExp(`(${word})`, "gi");
        parts = parts.flatMap(part =>
          typeof part === "string"
            ? part.split(regex).map((chunk, i) =>
                regex.test(chunk) ? <mark key={i} className="bg-yellow-300 rounded px-1">{chunk}</mark> : chunk
              )
            : [part]
        );
      });
      return parts;
    } catch {
      return text;
    }
  }

  function copyToClipboard(id) {
    navigator.clipboard.writeText(id);
    toast.success("Copied Resume ID to clipboard!");
  }

  function goToCandidate(id) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (experience) params.set("experience", experience);
    navigate(`/candidates/${id}?${params.toString()}`);
  }

  const [searchHistory, setSearchHistory] = useState([]);
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setSearchHistory(history);
    } catch {}
  }, []);

  function deleteHistoryEntry(index) {
    const newHistory = [...searchHistory];
    newHistory.splice(index, 1);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  }

  const sortedAnswers = [...answers].sort((a, b) =>
    sortBy === "score" ? b.score - a.score : 0
  );

  return (
    <>
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-8 flex flex-col items-center space-y-10">
        {/* Filters and Search */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <h1 className="text-5xl font-extrabold text-blue-700 text-center">Resume Search</h1>
          <div className="flex flex-wrap gap-4 justify-center">
            <input
              type="text"
              placeholder="Search skills, roles, keywords..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="flex-grow min-w-[200px] md:min-w-[400px] px-5 py-3 rounded-full border border-blue-300 focus:ring-2 focus:ring-blue-600"
              onKeyDown={e => e.key === "Enter" && runSearch()}
            />
            <select
              className="rounded-full border border-blue-300 px-4 py-3"
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="New York">New York</option>
              <option value="California">California</option>
              <option value="Texas">Texas</option>
            </select>
            <select
              className="rounded-full border border-blue-300 px-4 py-3"
              value={experience}
              onChange={e => setExperience(e.target.value)}
            >
              <option value="">Experience Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
            <button
              onClick={() => runSearch()}
              disabled={loading || !q.trim()}
              className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search History */}
        <div className="w-full max-w-5xl rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-blue-700 font-semibold">Recent Searches</h2>
            {searchHistory.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem("searchHistory");
                  setSearchHistory([]);
                  toast("Search history cleared");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          {searchHistory.length === 0 && (
            <p className="text-gray-600 select-none">No search history</p>
          )}
          <div className="flex flex-wrap gap-3">
            {searchHistory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-blue-700 text-sm cursor-pointer">
                <button
                  onClick={() => {
                    setQ(item.query);
                    setLocation(item.location);
                    setExperience(item.experience);
                    runSearch(item.query, item.location, item.experience, 1);
                  }}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {item.query} {item.location && ` | ${item.location}`} {item.experience && ` | ${item.experience}`}
                </button>
                <button
                  onClick={() => deleteHistoryEntry(idx)}
                  aria-label="Delete search history entry"
                  className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  &#x2715;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="w-full max-w-6xl bg-white rounded-xl shadow p-6 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-100">
          {sortedAnswers.length === 0 && !loading && (
            <p className="text-center text-blue-600">No results to display. Try different keywords or filters.</p>
          )}
          {loading && <p className="text-center text-blue-700 animate-pulse mb-4">Loading...</p>}
          {sortedAnswers.map(answer => (
            <div
              key={answer.resume_id}
              onClick={() => goToCandidate(answer.resume_id)}
              tabIndex={0}
              role="button"
              onKeyDown={e => e.key === "Enter" && goToCandidate(answer.resume_id)}
              className="cursor-pointer border border-blue-200 rounded-lg shadow p-4 mb-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-800 truncate select-text">
                  {answer.filename.replace(/\.[^/.]+$/, "")}
                </h3>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    copyToClipboard(answer.resume_id);
                  }}
                  className="bg-blue-700 text-white px-2 py-1 rounded select-text text-xs"
                  title="Copy Resume ID"
                >
                  Copy ID
                </button>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden mb-3">
                <div
                  className="h-2 bg-blue-700 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(answer.score * 100, 100)}%` }}
                />
              </div>
              {answer.evidence.slice(0, 2).map((chunk, i) => (
                <p key={i} className="bg-blue-50 rounded p-2 mb-2 text-blue-800 whitespace-pre-line select-text">
                  {highlightText(chunk.text)}
                </p>
              ))}
            </div>
          ))}
          {hasMore && !loading && (
            <button
              onClick={() => loadMore()}
              className="block mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition"
            >
              Load More
            </button>
          )}
        </div>
      </main>
    </>
  );

  function copyToClipboard(id) {
    navigator.clipboard.writeText(id);
    toast.success("Copied Resume ID to clipboard!");
  }
}

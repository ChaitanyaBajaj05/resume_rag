import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getResume } from "../api";

export default function Candidate() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);

  // Extract search keywords from URL query param "q"
  const keywords = useMemo(() => {
    const q = new URLSearchParams(location.search).get("q");
    return q ? q.trim().split(/\s+/) : [];
  }, [location.search]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getResume(id);
        if (mounted) setData(r);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Highlight matched keywords in text
  function Highlight({ text }) {
    if (!keywords.length) return <>{text}</>;
    let parts = [text];
    try {
      keywords.forEach((kw) => {
        const regex = new RegExp(`(${kw})`, "gi");
        parts = parts.flatMap((part) =>
          typeof part !== "string"
            ? [part]
            : part.split(regex).map((chunk, i) =>
                regex.test(chunk) ? (
                  <mark
                    key={i}
                    className="bg-yellow-300 rounded px-1"
                    style={{ boxShadow: "inset 0 -0.4em 0 rgba(250, 204, 21, 0.4)" }}
                  >
                    {chunk}
                  </mark>
                ) : (
                  chunk
                )
              )
        );
      });
    } catch {
      return text;
    }
    return <>{parts}</>;
  }

  // Status badge component with animation and icon
  function StatusBadge({ status }) {
    switch (status) {
      case "processed":
        return (
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-1 font-semibold text-sm select-none shadow-md">
            <svg
              className="w-5 h-5 stroke-green-700"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Processed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 rounded-full px-4 py-1 font-semibold text-sm select-none animate-spin shadow-md">
            <svg
              className="w-5 h-5 stroke-yellow-700"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={12} r={10} strokeOpacity="0.25" />
              <path d="M22 12a10 10 0 01-10 10" />
            </svg>
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 rounded-full px-4 py-1 font-semibold text-sm select-none shadow-md">
            <svg
              className="w-5 h-5 stroke-red-700"
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            {status || "Unknown"}
          </span>
        );
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-blue-500 p-8">
        <p className="text-center text-white text-2xl font-mono animate-pulse">
          Loading candidate data...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-300 to-blue-500 p-8 flex justify-center">
      <div className="w-full max-w-5xl bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 flex flex-col space-y-8 max-h-[85vh] overflow-hidden">
        {/* Sticky Header */}
        <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-md z-20 rounded-xl shadow-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-6xl font-extrabold text-blue-900 select-text mb-4 md:mb-0 truncate">
            {data.filename.replace(/\.[^/.]+$/, "")}
          </h1>
          <div className="flex gap-6 items-center text-lg font-semibold text-blue-900">
            <span className="select-text">
              Resume ID: <code className="font-mono">{id}</code>
            </span>
            <StatusBadge status={data.status} />
          </div>
        </header>

        {/* Scrollable Chunks */}
        <section className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-thumb-rounded-md pr-4 space-y-6">
          {data.chunks && data.chunks.length > 0 ? (
            data.chunks.map((chunk) => (
              <article
                key={chunk.id}
                className="bg-white rounded-3xl shadow-md p-6 transition-transform transform hover:scale-[1.02] hover:shadow-xl select-text"
              >
                <div className="text-blue-600 font-mono text-sm tracking-wide mb-3 select-text flex justify-between items-center">
                  <span>Chunk ID: {chunk.id.slice(0, 10)}...</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(chunk.id)}
                    title="Copy Chunk ID"
                    className="text-blue-700 underline text-xs cursor-pointer select-none"
                  >
                    Copy ID
                  </button>
                </div>
                <p className="text-blue-900 text-lg leading-relaxed whitespace-pre-wrap">
                  <Highlight text={chunk.chunk_text} />
                </p>
              </article>
            ))
          ) : (
            <p className="text-blue-900 text-xl text-center mt-32 font-semibold select-none">
              No chunks available.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

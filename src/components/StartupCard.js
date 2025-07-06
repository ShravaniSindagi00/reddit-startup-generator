"use client";
import { useState } from "react";

export default function StartupCard({ post }) {
  const [showModal, setShowModal] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState("");

  // Construct the Reddit post URL
  const redditUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : null;

  // Handler for Generate Startup Idea button
  const handleOpenModal = async () => {
    setShowModal(true);
    setSolution(null);
    setSolutionError("");
    setSolutionLoading(true);
    try {
      const res = await fetch("/api/gemini/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          selftext: post.selftext
        })
      });
      const data = await res.json();
      if (data.solution) {
        setSolution(data.solution.replace(/\*\*/g, ""));
      } else {
        setSolutionError("No solution generated.");
      }
    } catch (err) {
      setSolutionError("Failed to generate solution.");
    } finally {
      setSolutionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 max-w-md w-full border border-gray-200">
      {/* Top: Subreddit badge and upvotes */}
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">r/{post.subreddit || "startups"}</span>
        <span className="flex items-center text-gray-400 text-sm font-medium ml-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="inline-block mr-1"><path d="M8 3v10M8 3l3.5 3.5M8 3L4.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {post.ups || 0}
        </span>
      </div>
      {/* Title */}
      <div className="text-lg font-bold text-gray-900 mb-1 leading-snug">
        {post.title}
      </div>
      {/* Username */}
      <div className="text-sm text-gray-500 mb-2">
        {post.author ? `u/${post.author}` : ""}
      </div>
      {/* Button */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold text-base shadow transition-colors"
        onClick={handleOpenModal}
        title="Generate a startup idea solution"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 2v2M15.657 4.343l-1.414 1.414M18 10h-2M15.657 15.657l-1.414-1.414M10 18v-2M4.343 15.657l1.414-1.414M2 10h2M4.343 4.343l1.414 1.414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
        Generate Startup Idea
      </button>
      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative border border-gray-700 max-h-[70vh] overflow-y-auto pt-10">
            {redditUrl && (
              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-4 top-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors z-10"
                style={{ textDecoration: 'none' }}
              >
                View on Reddit
              </a>
            )}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">Solution Outline</h3>
            {solutionLoading ? (
              <div className="text-gray-300">Generating solution...</div>
            ) : solutionError ? (
              <div className="text-red-400">{solutionError}</div>
            ) : solution ? (
              <pre className="whitespace-pre-wrap text-gray-200 text-sm">{solution}</pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

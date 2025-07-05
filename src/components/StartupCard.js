"use client";
import { useState, useEffect } from "react";

function generateSolution(summary) {
  if (!summary) return "No solution available.";
  const title = summary.title || "this startup idea";
  const desc = summary.description || "";
  const keywords = summary.keyWords && summary.keyWords.length > 0 ? summary.keyWords.join(", ") : null;
  return (
    <div>
      <p className="mb-2"><span className="font-semibold">How to build: </span>{title}</p>
      {desc && <p className="mb-2 text-sm text-gray-300">{desc}</p>}
      <ol className="list-decimal list-inside text-sm space-y-1">
        <li>Validate the idea by talking to potential users and researching the market{keywords ? ` (focus: ${keywords})` : ""}.</li>
        <li>Build a minimum viable product (MVP) that solves the core problem.</li>
        <li>Launch a simple landing page and collect signups or feedback.</li>
        <li>Iterate based on user feedback and usage data.</li>
        <li>Promote your solution in relevant communities and social media.</li>
        <li>Plan for monetization and scaling if you see traction.</li>
      </ol>
    </div>
  );
}

export default function StartupCard({ post }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState("");

  // Construct the Reddit post URL
  const redditUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : null;

  useEffect(() => {
    let ignore = false;
    async function fetchSummary() {
      setLoading(true);
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: post.title, 
            selftext: post.selftext,
            ups: post.ups,
            num_comments: post.num_comments,
            created_utc: post.created_utc
          }),
        });
        const data = await res.json();
        if (!ignore) setSummary(data);
      } catch (err) {
        if (!ignore) setSummary({ 
          title: post.title, 
          description: "Summary failed to load." 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch AI solution when modal opens
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
          title: summary?.title || post.title,
          selftext: post.selftext
        })
      });
      const data = await res.json();
      if (data.solution) {
        setSolution(data.solution);
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
    <div className="bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px] border border-gray-700 relative">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-white line-clamp-2">
          {summary?.title || post.title}
        </h2>
        <p className="text-gray-300 text-sm mb-4 line-clamp-4">
          {summary?.description || (loading ? "Loading summary..." : "No summary available.")}
        </p>
        {summary?.keyWords && summary.keyWords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {summary.keyWords.map((word, index) => (
              <span key={index} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {word}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-2 mt-2">
        <div className="text-xs text-gray-400">
          {summary?.confidence && `Confidence: ${summary.confidence}%`}
        </div>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            onClick={handleOpenModal}
            disabled={loading || !summary}
            title="Generate a solution outline for this idea"
          >
            Generate Solution
          </button>
          {redditUrl && (
            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition-colors"
              title="View this post on Reddit"
            >
              View on Reddit
            </a>
          )}
        </div>
      </div>
      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative border border-gray-700 max-h-[70vh] overflow-y-auto">
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
              <pre className="whitespace-pre-wrap text-gray-200 text-sm">{solution.replace(/\*\*/g, "")}</pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

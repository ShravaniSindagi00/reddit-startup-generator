"use client";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import FloatingCard from "./FloatingCard";

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-8/12" />
    </div>
  );
}

// Utility: Clean summary for display
function cleanSummary(text) {
  if (!text) return "";
  // Remove markdown links [text](url)
  let clean = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
  // Remove * _ ~ ` > # (markdown)
  clean = clean.replace(/[\*\_\~\`\>#]/g, "");
  // Remove emojis (basic unicode ranges)
  clean = clean.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  // Remove URLs
  clean = clean.replace(/https?:\/\/\S+/g, "");
  // Remove repeated punctuation (e.g., !!!!, ???)
  clean = clean.replace(/([!?.,])\1{1,}/g, "$1");
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // Remove leading/trailing special chars
  clean = clean.replace(/^[^\w]+|[^\w]+$/g, "");
  // Remove generic openers
  clean = clean.replace(/^(this post is about|in this post|here's|here is|the post discusses|the post is about|in summary|summary:)\s*/i, "");
  return clean;
}

export default function StartupCard({ post }) {
  const [showModal, setShowModal] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const redditUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : null;

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

  // Handler for summary reveal
  const handleShowSummary = () => setShowSummary(true);

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 max-w-md w-full border border-gray-200 transition-all duration-200 transform hover:shadow-xl hover:scale-[1.025] hover:border-blue-400">
      {/* Top Info */}
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          r/{post.subreddit || "startups"}
        </span>
        <span className="flex items-center text-gray-400 text-sm font-medium ml-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="inline-block mr-1">
            <path d="M8 3v10M8 3l3.5 3.5M8 3L4.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {post.ups || 0}
        </span>
      </div>

      {/* Title */}
      <div className="text-lg font-bold text-gray-900">{post.title}</div>

      {/* Author */}
      <div className="text-sm text-gray-500 mb-2">{post.author ? `u/${post.author}` : ""}</div>

      {/* Generate Startup Idea Button */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold shadow"
        onClick={handleShowSummary}
        disabled={showSummary}
      >
        <Lightbulb className="w-5 h-5" />
        Generate Startup Idea
      </button>

      {/* Summary and View on Reddit button, only after click */}
      {showSummary && post.summary?.description && (
        <div className="mb-1">
          <span className="block text-sm text-gray-500 font-medium mb-0.5">Summary:</span>
          <p className="text-gray-700 text-base leading-snug line-clamp-2">{cleanSummary(post.summary.description)}</p>
          {redditUrl && (
            <div className="flex justify-center mt-3">
              <a
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold shadow text-center"
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Reddit
              </a>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <FloatingCard open={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Solution Outline</h3>

        {solutionLoading ? (
          <SkeletonLoader />
        ) : solutionError ? (
          <div className="text-red-500 text-center py-8 text-lg">{solutionError}</div>
        ) : solution ? (
          <pre className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed bg-gray-100 rounded p-4 w-full shadow-inner mb-6">
            {solution}
          </pre>
        ) : null}

        {solution && redditUrl && (
          <div className="flex justify-center mt-4">
            <a
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow transition text-lg"
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Reddit
            </a>
          </div>
        )}
      </FloatingCard>
    </div>
  );
}

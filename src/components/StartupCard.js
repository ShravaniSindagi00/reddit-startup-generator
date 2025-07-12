"use client";
import { useState, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import Modal from "./Modal";

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-8/12" />
      <div className="h-4 bg-gray-200 rounded w-9/12" />
      <div className="h-4 bg-gray-200 rounded w-7/12" />
    </div>
  );
}

// Utility: Clean solution text for display
function cleanSolution(text) {
  if (!text) return "";
  // Remove markdown stars
  let clean = text.replace(/\*\*/g, "");
  // Remove markdown links [text](url)
  clean = clean.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
  // Remove other markdown symbols
  clean = clean.replace(/[\*\_\~\`\>#]/g, "");
  // Remove emojis (basic unicode ranges)
  clean = clean.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  // Remove URLs
  clean = clean.replace(/https?:\/\/\S+/g, "");
  // Remove repeated punctuation
  clean = clean.replace(/([!?.,])\1{1,}/g, "$1");
  // Add space after numbered points (e.g., "1." becomes "1. ")
  clean = clean.replace(/(\d+\.)([^\s])/g, "$1 $2");
  // Add space after bullet points (e.g., "-" becomes "- ")
  clean = clean.replace(/(^|\n)-([^\s])/g, "$1- $2");
  // Add a newline before each numbered section except the first
  clean = clean.replace(/(\d\.)/g, '\n$1');
  clean = clean.replace(/^\s*\n/, ''); // Remove leading newline if present
  // Remove extra whitespace
  clean = clean.replace(/[ \t]+\n/g, '\n'); // Remove trailing spaces before newlines
  clean = clean.replace(/\s+\n/g, '\n');   // Remove extra spaces before newlines
  clean = clean.replace(/\n{2,}/g, '\n\n'); // Collapse multiple newlines
  clean = clean.trim();
  return clean;
}

export default function StartupCard({ post }) {
  const [showModal, setShowModal] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState("");

  const redditUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : null;

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      setSolution(null);
      setSolutionError("");
      setSolutionLoading(false);
    }, 200);
  }, []);

  const handleGenerateStartupIdea = async () => {
    setShowModal(true);
    setSolution(null);
    setSolutionError("");
    setSolutionLoading(true);

    // Delay Gemini fetch to allow modal animation to finish
    setTimeout(async () => {
      try {
        const res = await fetch("/api/gemini/solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: post.title,
            selftext: post.selftext,
          }),
        });

        const data = await res.json();
        if (data.solution) {
          setSolution(cleanSolution(data.solution));
        } else {
          setSolutionError("No solution generated. Please try again.");
        }
      } catch (err) {
        setSolutionError("Failed to generate solution. Please check your connection.");
      } finally {
        setSolutionLoading(false);
      }
    }, 300); // Delay to allow modal to render
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 max-w-md w-full border border-gray-200 transition-all duration-200 transform hover:shadow-xl hover:scale-[1.025] hover:border-blue-400">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            r/{post.subreddit || "startups"}
          </span>
          <span className="flex items-center text-gray-400 text-sm font-medium ml-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M8 3v10M8 3l3.5 3.5M8 3L4.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {post.ups || 0}
          </span>
        </div>

        <div className="text-lg font-bold text-gray-900">{post.title}</div>
        <div className="text-sm text-gray-500 mb-2">{post.author ? `u/${post.author}` : ""}</div>

        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold shadow transition-all duration-200"
          onClick={handleGenerateStartupIdea}
        >
          <Lightbulb className="w-5 h-5" />
          Generate Startup Idea
        </button>
      </div>

      {/* Always Mounted Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Startup Solution</h3>

          {solutionLoading ? (
            <div className="space-y-4">
              <div className="text-gray-600 mb-4">Generating your startup idea...</div>
              <SkeletonLoader />
            </div>
          ) : solutionError ? (
            <div className="text-red-500 text-center py-8 text-lg">{solutionError}</div>
          ) : solution ? (
            <div className="text-left space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed font-sans">
                  {solution}
                </pre>
              </div>

              {redditUrl && (
                <div className="flex justify-center pt-4">
                  <a
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors duration-200"
                    href={redditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Reddit
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

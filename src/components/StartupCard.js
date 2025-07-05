"use client";
import { useState, useEffect } from "react";

export default function StartupCard({ post }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between min-h-[220px] border border-gray-700">
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
            disabled
            title="Coming soon"
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
    </div>
  );
}

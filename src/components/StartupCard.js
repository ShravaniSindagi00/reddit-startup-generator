"use client";
import { useState, useEffect } from "react";

export default function StartupCard({ post }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchSummary() {
      setLoading(true);
      try {
        const res = await fetch("/api/gemini/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: post.title, selftext: post.selftext }),
        });
        const data = await res.json();
        if (!ignore) setSummary(data);
      } catch (err) {
        if (!ignore) setSummary({ title: post.title, description: "Summary failed to load." });
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
      </div>
      <button
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        disabled
        title="Coming soon"
      >
        Generate Solution
      </button>
    </div>
  );
}

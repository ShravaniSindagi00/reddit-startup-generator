"use client";
import React, { useEffect, useState, useRef } from "react";
import StartupCard from "../components/StartupCard";
import CardSkeleton from "../components/CardSkeleton";
import { Lightbulb } from "lucide-react";

const SUBREDDIT = "startups";
const PAGE_SIZE = 6;
const CONFIDENCE_THRESHOLD = 45;

async function fetchSummary(post) {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        selftext: post.selftext,
        ups: post.ups,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
      }),
    });
    const summary = await res.json();
    return { ...post, summary };
  } catch {
    return { ...post, summary: { confidence: 0 } };
  }
}

export default function Home() {
  const [tab, setTab] = useState("hot"); // 'hot' or 'new'
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState(null); // for pagination in 'new'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hotCache, setHotCache] = useState([]); // to compare hot topics
  const [showHotMessage, setShowHotMessage] = useState(false);
  const [readMoreLoading, setReadMoreLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Used to detect if user refreshed hot topics
  const prevHotPostsRef = useRef([]);

  useEffect(() => {
    setLoading(true);
    setError("");
    setShowHotMessage(false);
    setNoResults(false);
    if (tab === "hot") {
      fetchHotTopics();
    } else {
      fetchNewTopics(true); // true = reset
    }
    // eslint-disable-next-line
  }, [tab]);

  // Fetch hot topics
  async function fetchHotTopics() {
    try {
      const res = await fetch(`/api/reddit?subreddit=${SUBREDDIT}&limit=${PAGE_SIZE}&mode=hot`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch hot topics");
      const data = await res.json();
      // Fetch summaries for all posts
      const postsWithSummaries = await Promise.all(data.posts.map(fetchSummary));
      // Filter by confidence
      const filtered = postsWithSummaries.filter(p => p.summary && p.summary.confidence > CONFIDENCE_THRESHOLD);
      setPosts(filtered);
      setAfter(null);
      setNoResults(filtered.length === 0);
      // Compare with previous hot posts to show message if unchanged
      if (
        prevHotPostsRef.current.length > 0 &&
        JSON.stringify(prevHotPostsRef.current.map(p => p.id)) === JSON.stringify(data.posts.map(p => p.id))
      ) {
        setShowHotMessage(true);
      }
      prevHotPostsRef.current = data.posts;
      setHotCache(data.posts);
    } catch (err) {
      setError("Failed to load hot topics.");
      setPosts([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  }

  // Fetch new topics (reset = true means start from scratch)
  async function fetchNewTopics(reset = false) {
    try {
      const afterParam = reset ? null : after;
      const res = await fetch(`/api/reddit?subreddit=${SUBREDDIT}&limit=${PAGE_SIZE}&mode=new${afterParam ? `&after=${afterParam}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch new topics");
      const data = await res.json();
      // Fetch summaries for all posts
      const postsWithSummaries = await Promise.all(data.posts.map(fetchSummary));
      // Filter by confidence
      const filtered = postsWithSummaries.filter(p => p.summary && p.summary.confidence > CONFIDENCE_THRESHOLD);
      if (reset) {
        setPosts(filtered);
      } else {
        setPosts(prev => [...prev, ...filtered]);
      }
      setAfter(data.after);
      setNoResults(filtered.length === 0 && (reset || posts.length === 0));
    } catch (err) {
      setError("Failed to load new topics.");
      if (reset) setPosts([]);
      setNoResults(true);
    } finally {
      setLoading(false);
      setReadMoreLoading(false);
    }
  }

  // Handler for Read More button
  const handleReadMore = () => {
    setReadMoreLoading(true);
    fetchNewTopics(false);
  };

  // Handler for tab switch
  const handleTab = (tabName) => {
    setTab(tabName);
    setError("");
    setShowHotMessage(false);
    setAfter(null);
    setNoResults(false);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start bg-blue-50 py-12">
      <div className="w-full flex justify-center mb-8">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${tab === "hot" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => handleTab("hot")}
          >
            Hot Topics
          </button>
          <button
            className={`px-4 py-2 rounded font-medium transition-colors ${tab === "new" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => handleTab("new")}
          >
            New Topics
          </button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : noResults ? (
        <div className="text-gray-400 mt-8">No startup ideas found with confidence &gt; {CONFIDENCE_THRESHOLD}.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-start">
          {posts.map((post) => (
            <StartupCard key={post.id} post={post} />
          ))}
        </div>
      )}
      {tab === "new" && after && !loading && !noResults && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors font-medium disabled:opacity-60"
            onClick={handleReadMore}
            disabled={readMoreLoading}
          >
            {readMoreLoading ? "Loading..." : "Read More"}
          </button>
        </div>
      )}
    </main>
  );
}

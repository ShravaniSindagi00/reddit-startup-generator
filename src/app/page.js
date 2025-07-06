"use client";
import React, { useEffect, useState, useRef } from "react";
import StartupCard from "../components/StartupCard";
import CardSkeleton from "../components/CardSkeleton";
import { Lightbulb } from "lucide-react";
import ErrorState from "../components/EmptyState";
import EmptyState from "../components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

// 1. Define allowed technical subreddits
const TECHNICAL_SUBREDDITS = [
  { label: "Startups", value: "startups" },
  { label: "Entrepreneur", value: "Entrepreneur" },
  { label: "Side Project", value: "SideProject" },
  { label: "Web Dev", value: "webdev" },
  { label: "Learn Programming", value: "learnprogramming" },
  { label: "Machine Learning", value: "MachineLearning" },
  { label: "Programming", value: "Programming" },
  { label: "SaaS", value: "SaaS" },
  { label: "Indie Hackers", value: "indiehackers" }
];

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
  // 2. Add subreddit state
  const [selectedSubreddit, setSelectedSubreddit] = useState(TECHNICAL_SUBREDDITS[0].value);
  const [tab, setTab] = useState("hot");
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hotCache, setHotCache] = useState([]);
  const [showHotMessage, setShowHotMessage] = useState(false);
  const [readMoreLoading, setReadMoreLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const prevHotPostsRef = useRef([]);

  // 3. Refetch when subreddit changes
  useEffect(() => {
    setLoading(true);
    setError("");
    setShowHotMessage(false);
    setNoResults(false);
    if (tab === "hot") {
      fetchHotTopics();
    } else {
      fetchNewTopics(true);
    }
    // eslint-disable-next-line
  }, [tab, selectedSubreddit]);

  // 4. Update API calls to use selectedSubreddit
  async function fetchHotTopics() {
    try {
      const res = await fetch(`/api/reddit?subreddit=${selectedSubreddit}&limit=${PAGE_SIZE}&mode=hot`, { cache: "no-store" });
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

  async function fetchNewTopics(reset = false) {
    try {
      const afterParam = reset ? null : after;
      const res = await fetch(`/api/reddit?subreddit=${selectedSubreddit}&limit=${PAGE_SIZE}&mode=new${afterParam ? `&after=${afterParam}` : ""}`);
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
      {/* 5. Subreddit selector */}
      <div className="w-full flex justify-center mb-6">
        <select
          className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 font-medium shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedSubreddit}
          onChange={e => setSelectedSubreddit(e.target.value)}
          aria-label="Select subreddit"
        >
          {TECHNICAL_SUBREDDITS.map(sub => (
            <option key={sub.value} value={sub.value}>
              r/{sub.value}
            </option>
          ))}
        </select>
      </div>
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
      ) : error ? (
        <ErrorState message={error} />
      ) : noResults ? (
        <EmptyState message={`No startup ideas found with confidence > ${CONFIDENCE_THRESHOLD}.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-start">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              >
                <StartupCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {tab === "new" && after && !loading && !noResults && (
        <div className="flex justify-center mt-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors font-medium disabled:opacity-60"
            onClick={handleReadMore}
            disabled={readMoreLoading}
          >
            {readMoreLoading ? "Loading..." : "Read More"}
          </motion.button>
        </div>
      )}
    </main>
  );
}

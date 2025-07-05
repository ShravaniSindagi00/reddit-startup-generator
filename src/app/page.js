"use client";
import React, { useEffect, useState } from "react";
import StartupCard from "../components/StartupCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/reddit?subreddit=startups&limit=5", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch Reddit posts");

        const data = await res.json();
        setPosts(data.posts);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Reddit Startup Idea Generator</h1>
        <p>Loading posts and startup ideas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Reddit Startup Idea Generator</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen py-10 bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-white">Reddit Startup Idea Generator</h1>
      <p className="text-gray-400 mb-8 text-center max-w-2xl">
        Discover startup opportunities from Reddit discussions using AI-free intelligent summarization
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {posts.map((post) => (
          <StartupCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}

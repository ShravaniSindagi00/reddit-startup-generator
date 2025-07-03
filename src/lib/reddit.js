import axios from "axios";
import 'dotenv/config';

// ✅ Use process.env.VARIABLE to access environment variables
console.log({
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_USERNAME: process.env.REDDIT_USERNAME,
  REDDIT_PASSWORD: process.env.REDDIT_PASSWORD ? '***' : undefined
});

let cachedToken = null;
let tokenExpiry = null;
let requestCount = 0;
let requestResetTime = Date.now() + 60 * 1000; // 1 minute from now
const REQUEST_LIMIT = 55; // Stay below Reddit's 60/min limit

export async function getRedditAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
}

  const auth = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    cachedToken = response.data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = now + (response.data.expires_in - 300) * 1000;
    return cachedToken;
  } catch (error) {
    console.error("Failed to get Reddit access token:", error.response?.data || error.message);
    throw new Error("Reddit authentication failed");
  }
}

export async function fetchRedditPosts(subreddit, limit = 5) {
  const now = Date.now();
  if (now > requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60 * 1000;
  }
  if (requestCount >= REQUEST_LIMIT) {
    throw new Error("Rate limit exceeded. Please wait a minute and try again.");
  }
  requestCount++;

  const accessToken = await getRedditAccessToken();

  try {
    const response = await axios.get(
      `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "RedditStartupIdeaGenerator/0.1 by " + process.env.REDDIT_USERNAME,
        },
      }
    );
    // Filter for text posts only (no images/videos)
    const posts = response.data.data.children
      .map((child) => child.data)
      .filter((post) =>
        post.selftext &&
        !post.is_video &&
        !post.url_overridden_by_dest?.endsWith(".jpg") &&
        !post.url_overridden_by_dest?.endsWith(".png")
      );
    return posts;
  } catch (error) {
    console.error("Failed to fetch Reddit posts:", error.response?.data || error.message);
    throw new Error("Fetching Reddit posts failed");
  }
}

/**
 * Fetches public posts from a subreddit using Reddit's public JSON endpoint.
 * No authentication required.
 * @param {string} subreddit - The subreddit to fetch from (e.g., "startups")
 * @param {number} limit - Number of posts to fetch (default: 5)
 * @returns {Promise<Array>} - Array of post objects
 */
export async function fetchRedditPostsPublic(subreddit, limit = 5) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const response = await axios.get(url, {
      headers: { "User-Agent": "RedditStartupIdeaGenerator/0.1" }
    });
    // Filter for text posts only (no images/videos)
    return response.data.data.children
      .map(child => child.data)
      .filter(post => post.selftext && !post.is_video);
  } catch (error) {
    console.error("Failed to fetch public Reddit posts:", error.response?.data || error.message);
    throw new Error("Fetching public Reddit posts failed");
  }
}

// Temporary test code - remove or comment out after testing!
(async () => {
  try {
    const posts = await fetchRedditPosts("startups", 3);
    console.log("Fetched posts:", posts.map(p => p.title));
  } catch (e) {
    console.error("Test error:", e);
  }
})();

(async () => {
  try {
    const posts = await fetchRedditPostsPublic("startups", 3);
    console.log("Fetched posts:", posts.map(p => p.title));
  } catch (e) {
    console.error("Test error:", e);
  }
})();

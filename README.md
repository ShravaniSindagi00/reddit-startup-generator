# Reddit Startup Idea Generator

A modern web app to discover, summarize, and act on startup ideas from Reddit's r/startups subreddit.

## Features
- **Hot/New Tabs:** Switch between trending (hot) and latest (new) startup posts.
- **Confidence Filtering:** Only shows posts with a summarizer confidence score > 45 for relevance.
- **Summarization:** Each post is summarized using a local NLP method for cost-free, fast filtering.
- **AI Solution Generation:** Click **"Generate Startup Idea"** to open a centered modal. The modal triggers Google Gemini AI to generate a structured, actionable solution outline based on the post's content.
- **Structured Solution Format:** Gemini is prompted to return solutions in a clean outline with these sections:
  1. 🧠 Problem Summary
  2. 🚀 Proposed Startup Solution
  3. 📦 MVP Plan
  4. 🔧 Suggested Tools/Tech
  5. 🧪 Validation Tips
- **Clean Display:** The AI output is cleaned to remove markdown, emojis (except section headers), and ensures each section starts on a new line for readability.
- **Scrollable Modal:** The solution modal is scrollable for long content and always fits the viewport.
- **View on Reddit:** After the solution is generated, a blue "View on Reddit" button appears in the modal to open the original post.
- **Infinite Scroll for New:** 'Read More' button loads more new posts.

## Tech Stack
- Next.js (App Router, JS)
- Tailwind CSS
- Google Gemini API (for solution generation)
- Local NLP (for summarization)

## Getting Started
1. Clone the repo and install dependencies.
2. Add your Gemini API key to your environment variables.
3. Run `npm run dev` and visit [http://localhost:3000](http://localhost:3000).

## How the Solution Modal Works
- Clicking **"Generate Startup Idea"** opens a modal and immediately shows a loading shimmer.
- The Gemini API is called with a prompt that requests a structured, sectioned outline (see above).
- The response is cleaned and formatted so each numbered section starts on a new line.
- The "View on Reddit" button only appears after the solution is displayed.

## Next Steps
- Optional: Add user voting, bookmarking, or more advanced filtering.
- Optional: Support for more subreddits or user-submitted ideas.

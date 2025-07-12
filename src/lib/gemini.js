import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function getGeminiSummary({ title, selftext }) {
  const prompt = `
Given the following Reddit post, extract:
- A concise, clear title (max 10 words)
- A 1-2 sentence summary/description

Format:
Title: ...
Description: ...
`;

  const content = `Title: ${title}\n\nText: ${selftext}\n\n${prompt}`;

  const body = {
    contents: [
      {
        parts: [{ text: content }]
      }
    ]
  };

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );
    // The response structure may vary; adjust as needed
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseGeminiSummary(text);
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw new Error("Gemini API call failed");
  }
}

export async function getGeminiSolution({ title, selftext }) {
  const prompt = `You are an expert startup consultant.

Given the Reddit post below (title and body), generate a startup solution with clear sections in bullet points or numbered steps. Format the response in a clean outline suitable for web display.

Follow this format exactly:
1. 📝 Problem Summary – 1-2 lines explaining the user's problem.
2. 🚀 Proposed Startup Solution – 2-3 lines describing the idea in simple language.
3. 📦 MVP Plan – Bullet points showing what a minimum viable version would look like.
4. 🔧 Suggested Tools/Tech – Mention free tools or platforms.
5. 🧪 Validation Tips – How to test this idea quickly.

Avoid emojis in your answer (except for those used in section headers).
Avoid markdown formatting (no **, [](), or backticks).
Avoid large paragraphs. Keep it structured and readable.

Now here is the Reddit post:
Title: ${title}
Body: ${selftext}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { solution: text };
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw new Error("Gemini API call failed");
  }
}

function parseGeminiSummary(text) {
  const titleMatch = text.match(/Title:(.*)/i);
  const descMatch = text.match(/Description:(.*)/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    description: descMatch ? descMatch[1].trim() : "",
    raw: text
  };
}

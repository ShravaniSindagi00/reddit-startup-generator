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

function parseGeminiSummary(text) {
  const titleMatch = text.match(/Title:(.*)/i);
  const descMatch = text.match(/Description:(.*)/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    description: descMatch ? descMatch[1].trim() : "",
    raw: text
  };
}

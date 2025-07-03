import { getGeminiSummary } from '../../../../lib/gemini.js';

export async function POST(request) {
  try {
    const { title, selftext } = await request.json();
    console.log("Incoming request to /api/gemini/summary:", { title, selftext });

    const summary = await getGeminiSummary({ title, selftext });

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in /api/gemini/summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

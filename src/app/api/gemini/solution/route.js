import { getGeminiSolution } from '../../../../lib/gemini.js';

export async function POST(request) {
  try {
    const { title, selftext } = await request.json();
    const result = await getGeminiSolution({ title, selftext });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

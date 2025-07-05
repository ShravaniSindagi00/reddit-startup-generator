import { extractSummary, simpleSummary } from '../../../lib/summarizer.js';

export async function POST(request) {
  try {
    const { title, selftext, ups, num_comments, created_utc } = await request.json();
    
    // Create a post object with all required fields
    const post = {
      title,
      selftext,
      ups: ups || 0,
      num_comments: num_comments || 0,
      created_utc: created_utc || Math.floor(Date.now() / 1000)
    };

    // Use the cost-free summarization
    const summary = extractSummary(post);
    
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in /api/summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
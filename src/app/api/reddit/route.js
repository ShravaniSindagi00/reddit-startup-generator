import { fetchRedditPostsPublicMode } from '../../../lib/reddit.js';

export async function GET(request) {
  // Get the 'subreddit', 'limit', 'mode', and 'after' query params, or use defaults
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit') || 'startups';
  const limit = parseInt(searchParams.get('limit') || '5', 10);
  const mode = searchParams.get('mode') || 'hot'; // 'hot' or 'new'
  const after = searchParams.get('after') || null;

  try {
    const { posts, after: nextAfter } = await fetchRedditPostsPublicMode(subreddit, limit, mode, after);
    return new Response(JSON.stringify({ posts, after: nextAfter }), {
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

import { fetchRedditPostsPublic } from '../../../lib/reddit.js';

export async function GET(request) {
  // Get the 'subreddit' and 'limit' query params, or use defaults
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit') || 'startups';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  try {
    const posts = await fetchRedditPostsPublic(subreddit, limit);
    return new Response(JSON.stringify({ posts }), {
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

import natural from 'natural';

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
]);

// Startup-related keywords to prioritize
const STARTUP_KEYWORDS = new Set([
  'startup', 'business', 'company', 'product', 'service', 'market', 'customer', 'revenue', 'profit',
  'funding', 'investor', 'venture', 'capital', 'entrepreneur', 'founder', 'cofounder', 'ceo', 'cto',
  'saas', 'app', 'platform', 'software', 'mobile', 'web', 'api', 'ai', 'ml', 'data', 'analytics',
  'ecommerce', 'marketplace', 'subscription', 'freemium', 'b2b', 'b2c', 'pivot', 'scale', 'growth',
  'acquisition', 'exit', 'ipo', 'unicorn', 'bootstrapped', 'accelerator', 'incubator'
]);

export function extractSummary(post) {
  const { title, selftext, ups, num_comments, created_utc } = post;
  
  // Calculate engagement score
  const engagement = ups + num_comments;
  const ageInDays = Math.floor((Date.now() - created_utc * 1000) / (1000 * 60 * 60 * 24));
  
  // Extract key information
  const titleWords = extractKeyWords(title);
  const contentWords = extractKeyWords(selftext);
  
  // Combine and prioritize startup-related words
  const allWords = [...titleWords, ...contentWords];
  const startupWords = allWords.filter(word => STARTUP_KEYWORDS.has(word.toLowerCase()));
  
  // Generate summary
  const summary = {
    title: generateTitle(title, titleWords),
    description: generateDescription(title, selftext, engagement, ageInDays, startupWords),
    engagement: engagement,
    age: ageInDays,
    keyWords: startupWords.slice(0, 5),
    confidence: calculateConfidence(engagement, startupWords.length, selftext.length)
  };
  
  return summary;
}

function extractKeyWords(text) {
  if (!text) return [];
  
  // Tokenize and clean
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Filter out stop words and short words
  const filtered = tokens.filter(word => 
    word.length > 3 && 
    !STOP_WORDS.has(word) &&
    /^[a-zA-Z]+$/.test(word) // Only letters
  );
  
  // Stem words to group similar forms
  const stemmed = filtered.map(word => stemmer.stem(word));
  
  // Count frequency
  const wordCount = {};
  stemmed.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Return most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function generateTitle(originalTitle, keyWords) {
  // If title is already short and clear, use it
  if (originalTitle.length <= 60) {
    return originalTitle;
  }
  
  // Otherwise, create a shorter version
  const words = originalTitle.split(' ');
  if (words.length <= 8) {
    return originalTitle;
  }
  
  // Take first 8 words and add ellipsis
  return words.slice(0, 8).join(' ') + '...';
}

function generateDescription(title, selftext, engagement, ageInDays, startupWords) {
  const parts = [];
  
  // Add engagement info
  if (engagement > 0) {
    parts.push(`🔥 ${engagement} total engagement`);
  }
  
  // Add age info
  if (ageInDays === 0) {
    parts.push('📅 Posted today');
  } else if (ageInDays === 1) {
    parts.push('📅 Posted yesterday');
  } else {
    parts.push(`📅 ${ageInDays} days ago`);
  }
  
  // Add startup keywords if available
  if (startupWords.length > 0) {
    parts.push(`🏷️ Keywords: ${startupWords.slice(0, 3).join(', ')}`);
  }
  
  // Add content preview
  const preview = selftext.substring(0, 100).trim();
  if (preview && preview.length > 20) {
    parts.push(`💡 ${preview}${selftext.length > 100 ? '...' : ''}`);
  }
  
  return parts.join(' • ');
}

function calculateConfidence(engagement, startupWordCount, contentLength) {
  let score = 0;
  
  // Engagement score (0-40 points)
  if (engagement > 100) score += 40;
  else if (engagement > 50) score += 30;
  else if (engagement > 20) score += 20;
  else if (engagement > 10) score += 10;
  
  // Startup keyword score (0-30 points)
  if (startupWordCount > 5) score += 30;
  else if (startupWordCount > 3) score += 20;
  else if (startupWordCount > 1) score += 10;
  
  // Content length score (0-30 points)
  if (contentLength > 500) score += 30;
  else if (contentLength > 200) score += 20;
  else if (contentLength > 100) score += 10;
  
  return Math.min(score, 100);
}

// Alternative: Simple text truncation method
export function simpleSummary(post) {
  const { title, selftext, ups, num_comments, created_utc } = post;
  const engagement = ups + num_comments;
  const ageInDays = Math.floor((Date.now() - created_utc * 1000) / (1000 * 60 * 60 * 24));
  
  return {
    title: title.length > 60 ? title.substring(0, 60) + '...' : title,
    description: `🔥 ${engagement} engagement • 📅 ${ageInDays}d ago • 💡 ${selftext.substring(0, 80)}${selftext.length > 80 ? '...' : ''}`,
    engagement,
    age: ageInDays
  };
} 
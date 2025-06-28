# 🚀 Reddit Startup Idea Generator - Project Plan

## �� Project Overview

A clean and simple web app that fetches real startup-related Reddit posts, uses Gemini AI to extract startup ideas, and displays them in an elegant UI for makers, founders, and indie hackers.

### 🎯 Core Value Proposition
- **Discover** real problems from Reddit communities
- **Generate** startup ideas using AI analysis
- **Learn** from actual pain points and discussions
- **Build** solutions that people actually need

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: JavaScript
- **Deployment**: Vercel (recommended)

### Backend & APIs
- **Reddit API**: Fetch posts from r/startups, r/Entrepreneur, r/SaaS
- **Gemini AI**: Google's Gemini API for idea generation
- **Environment**: Server-side API routes for secure API calls

### Key Dependencies to Add
```json
{
  "axios": "^1.6.0",
  "@google/generative-ai": "^0.2.0",
  "lucide-react": "^0.294.0",
  "framer-motion": "^10.16.0"
}
```


┌─────────────────────────────────────┐
│ 🚀 Reddit Startup Idea Generator │
│ │
│ 📌 I'm tired of managing recurring │
│ tasks manually │
│ [ Generate Idea ] │
│ │
│ 📌 How do I validate my SaaS idea? │
│ [ Generate Idea ] │
│ │
│ 📌 Looking for a co-founder... │
│ [ Generate Idea ] │
└─────────────────────────────────────┘
```

### 2. After Generation
```
┌─────────────────────────────────────┐
│ 📌 I'm tired of managing recurring  │
│    tasks manually                   │
│                                     │
│ ✅ Startup Idea: Tool for flexible  │
│    recurring task automation        │
│ 💡 Problem: No tools let users      │
│    automate complex recurring tasks │
│ 👥 Target Users: Remote teams,      │
│    project managers                 │
│                                     │
│ 🔗 [View on Reddit]                 │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX Design

### Design System
- **Colors**: Clean, professional palette
  - Primary: `#3B82F6` (Blue)
  - Secondary: `#10B981` (Green)
  - Background: `#F8FAFC` (Light gray)
  - Text: `#1F2937` (Dark gray)
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation with `box-shadow`

### Component States
1. **Initial State**: Post title + "Generate Idea" button
2. **Loading State**: Spinner + "Generating..." text
3. **Success State**: Idea details + "View on Reddit" link
4. **Error State**: Error message + retry button

### Responsive Design
- **Mobile**: Single column, full-width cards
- **Tablet**: Two columns
- **Desktop**: Three columns with max-width container

---

##  Core Features

### 1. Reddit Post Fetching
```javascript
// Target subreddits
const SUBREDDITS = [
  'startups',
  'Entrepreneur', 
  'SaaS',
  'indiehackers',
  'sidehustle'
];

// Fetch top posts from last 24 hours
const fetchRedditPosts = async () => {
  // Use Reddit API to get hot posts
  // Filter for text posts (not images/videos)
  // Limit to 5 posts initially
};
```

### 2. Gemini AI Integration
```javascript
// Gemini prompt template
const GEMINI_PROMPT = `
You are a startup assistant.
Given a Reddit post, extract the following:

- A potential startup idea
- The problem it solves  
- Who would benefit from it (target users)

If there's no clear idea, say: "No idea found."

Format your response like this:
Startup Idea: ...
Problem: ...
Target Users: ...
`;
```

### 3. Interactive Cards
- **Hover effects**: Subtle scale and shadow
- **Loading states**: Skeleton loaders
- **Error handling**: Graceful fallbacks
- **Caching**: Store generated ideas locally

---

## 🔐 API Configuration

### Environment Variables
```bash
# .env.local
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### API Rate Limits
- **Reddit**: 60 requests per minute
- **Gemini**: 15 requests per minute (free tier)
- **Caching**: 1 hour for Reddit posts, 24 hours for generated ideas

---

## 📱 User Flow

### 1. Landing Page
```
┌─────────────────────────────────────┐
│ 🚀 Reddit Startup Idea Generator    │
│                                     │
│ 📌 I'm tired of managing recurring  │
│    tasks manually                   │
│ [ Generate Idea ]                   │
│                                     │
│ 📌 How do I validate my SaaS idea?  │
│ [ Generate Idea ]                   │
│                                     │
│ 📌 Looking for a co-founder...      │
│ [ Generate Idea ]                   │
└─────────────────────────────────────┘
```

### 2. After Generation
```
┌─────────────────────────────────────┐
│ 📌 I'm tired of managing recurring  │
│    tasks manually                   │
│                                     │
│ ✅ Startup Idea: Tool for flexible  │
│    recurring task automation        │
│ 💡 Problem: No tools let users      │
│    automate complex recurring tasks │
│ 👥 Target Users: Remote teams,      │
│    project managers                 │
│                                     │
│ 🔗 [View on Reddit]                 │
└─────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. **Set up Reddit Developer Account**
   - Create app at https://www.reddit.com/prefs/apps
   - Get Client ID and Secret

2. **Get Gemini API Key**
   - Visit https://makersuite.google.com/app/apikey
   - Create new API key

3. **Start Development**
   - Begin with Phase 1 MVP
   - Focus on core functionality first
   - Iterate based on user feedback

---

## 📞 Support & Resources

### Documentation
- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Community
- Reddit: r/startups, r/Entrepreneur
- Discord: Indie Hackers, Makerlog
- Twitter: #buildinpublic

---

*This project plan is designed to be iterative and can be updated based on user feedback and market validation.*
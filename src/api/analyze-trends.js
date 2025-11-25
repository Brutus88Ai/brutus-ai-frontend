// Server-side API: Analyze trends with Gemini and generate video concepts
import { rateLimit } from '../lib/rate-limit.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

export default async function handler(req, res) {
  // Apply rate limiting
  try {
    await limiter(req, res);
  } catch (err) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, category } = req.body || {};
    
    // Input validation
    if (!topic || typeof topic !== 'string' || topic.length > 200) {
      return res.status(400).json({ error: 'Invalid topic' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API not configured' });
    }

    const prompt = `You are a viral content strategist for TikTok and YouTube Shorts.

Analyze current trends in the "${category || 'general'}" niche related to: "${topic}"

Generate exactly 4 video concepts that have high viral potential. For each concept provide:
1. title: A catchy, click-worthy title (max 60 chars)
2. hook: The first 3 seconds hook that stops scrolling
3. visualPrompt: Detailed visual description for AI image generation (focus on what to show in the thumbnail)
4. script: Brief 30-second script outline
5. tags: 5 relevant hashtags

Return ONLY valid JSON in this exact format:
{
  "concepts": [
    {
      "title": "string",
      "hook": "string",
      "visualPrompt": "string",
      "script": "string",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res.status(502).json({ error: 'Failed to analyze trends', details: errorText });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response', rawText: text });
    }

    const concepts = JSON.parse(jsonMatch[0]);
    
    // Validate response structure
    if (!concepts.concepts || !Array.isArray(concepts.concepts) || concepts.concepts.length === 0) {
      return res.status(500).json({ error: 'Invalid AI response structure' });
    }

    return res.status(200).json(concepts);

  } catch (error) {
    console.error('Trend analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

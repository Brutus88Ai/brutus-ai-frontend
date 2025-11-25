// Server-side API: Generate thumbnail with Pollinations.ai
import { rateLimit } from '../lib/rate-limit.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

export default async function handler(req, res) {
  try {
    await limiter(req, res);
  } catch (err) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    
    if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    // Pollinations.ai URL encoding
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true`;

    // Optional: Validate that image is accessible
    const testResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (!testResponse.ok) {
      return res.status(502).json({ error: 'Failed to generate image' });
    }

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

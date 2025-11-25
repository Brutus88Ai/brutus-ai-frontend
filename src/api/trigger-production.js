// Server-side API: Send video concept to Make.com webhook for production
import { rateLimit } from '../lib/rate-limit.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
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
    const { concept, imageUrl, userId } = req.body || {};
    
    // Input validation
    if (!concept || !concept.title || !concept.script) {
      return res.status(400).json({ error: 'Invalid concept data' });
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
    if (!WEBHOOK_URL) {
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Send to Make.com
    const payload = {
      userId,
      timestamp: new Date().toISOString(),
      concept: {
        title: concept.title,
        hook: concept.hook,
        script: concept.script,
        tags: concept.tags
      },
      thumbnail: imageUrl,
      platform: 'tiktok', // or from request
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Make.com webhook error:', errorText);
      return res.status(502).json({ error: 'Production trigger failed' });
    }

    const result = await response.json();

    return res.status(200).json({ 
      success: true, 
      productionId: result.id || Date.now(),
      message: 'Video production started'
    });

  } catch (error) {
    console.error('Production trigger error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

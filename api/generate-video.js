export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, imageUrl } = req.body || {};
    if (!prompt || !imageUrl) return res.status(400).json({ error: 'Missing prompt or imageUrl' });

    const VIDEO_API_URL = process.env.VIDEO_API_URL || process.env.VITE_VIDEO_API_URL;
    const VIDEO_API_KEY = process.env.VIDEO_API_KEY || process.env.VITE_VIDEO_API_KEY;
    if (!VIDEO_API_URL) return res.status(500).json({ error: 'Video API not configured' });

    const payload = { prompt, imageUrl };
    const headers = { 'Content-Type': 'application/json' };
    if (VIDEO_API_KEY) headers['Authorization'] = `Bearer ${VIDEO_API_KEY}`;

    const resp = await fetch(VIDEO_API_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Upstream video API error', status: resp.status, body: text });
    }
    const data = await resp.json();
    if (data?.videoUrl) return res.status(200).json({ videoUrl: data.videoUrl });
    return res.status(502).json({ error: 'No videoUrl returned by upstream', body: data });
  } catch (e) {
    console.error('generate-video error', e);
    return res.status(500).json({ error: 'Internal Server Error', message: String(e) });
  }
}
// Vercel Serverless Function: /api/generate-video
// Expects POST { prompt, imageUrl }
// Forwards request to an external video API set in VIDEO_API_URL and returns { videoUrl }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, imageUrl } = req.body || {};
    if (!prompt || !imageUrl) return res.status(400).json({ error: 'Missing prompt or imageUrl' });

    const VIDEO_API_URL = process.env.VIDEO_API_URL || process.env.VITE_VIDEO_API_URL;
    const VIDEO_API_KEY = process.env.VIDEO_API_KEY || process.env.VITE_VIDEO_API_KEY;
    if (!VIDEO_API_URL) return res.status(500).json({ error: 'Video API not configured' });

    const payload = { prompt, imageUrl };
    const headers = { 'Content-Type': 'application/json' };
    if (VIDEO_API_KEY) headers['Authorization'] = `Bearer ${VIDEO_API_KEY}`;

    const resp = await fetch(VIDEO_API_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Upstream video API error', status: resp.status, body: text });
    }
    const data = await resp.json();
    // Expect upstream to return { videoUrl: 'https://...' }
    if (data?.videoUrl) return res.status(200).json({ videoUrl: data.videoUrl });
    return res.status(502).json({ error: 'No videoUrl returned by upstream', body: data });
  } catch (e) {
    console.error('generate-video error', e);
    return res.status(500).json({ error: 'Internal Server Error', message: String(e) });
  }
}

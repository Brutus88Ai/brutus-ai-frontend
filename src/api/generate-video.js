export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, imageUrl } = req.body || {};
    if (!prompt || !imageUrl) return res.status(400).json({ error: 'Missing prompt or imageUrl' });

    // Use Hugging Face Spaces Ovi API
    const HF_TOKEN = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
    const API_URL = 'https://akhaliq-ovi.hf.space/api/predict';

    const payload = {
      data: [
        imageUrl,  // input image
        prompt,    // motion description
        42,        // seed
        5,         // num_inference_steps
        6.0        // guidance_scale
      ]
    };

    const headers = { 'Content-Type': 'application/json' };
    if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;

    const resp = await fetch(API_URL, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(payload) 
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Hugging Face API error', status: resp.status, body: text });
    }

    const data = await resp.json();
    
    // Hugging Face returns: { data: [{ url: "video_url" }] }
    if (data?.data?.[0]?.url) {
      return res.status(200).json({ videoUrl: data.data[0].url });
    }
    
    return res.status(502).json({ error: 'No video URL returned', body: data });
  } catch (e) {
    console.error('generate-video error', e);
    return res.status(500).json({ error: 'Internal Server Error', message: String(e) });
  }
}

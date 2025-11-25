export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt, imageUrl } = req.body || {};
    if (!prompt || !imageUrl) return res.status(400).json({ error: 'Missing prompt or imageUrl' });

    // Use Hugging Face HunyuanVideo-1.5 Space
    const HF_TOKEN = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
    const API_URL = 'https://multimodalart-hunyuan-video-1-5.hf.space/api/predict';

    const payload = {
      data: [
        imageUrl,      // input_image_path
        prompt,        // prompt_text
        "",            // negative_prompt (empty)
        42,            // seed
        480,           // height
        832,           // width
        false,         // is_image (false = text+image mode)
        50,            // num_inference_steps
        7,             // guidance_scale
        true,          // enable_sr (super resolution)
        121            // num_frames
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
      return res.status(502).json({ error: 'HunyuanVideo API error', status: resp.status, body: text });
    }

    const data = await resp.json();
    
    // HunyuanVideo Space returns: { data: [{ video: { url: "..." } }] }
    if (data?.data?.[0]?.video?.url) {
      return res.status(200).json({ videoUrl: data.data[0].video.url });
    } else if (data?.data?.[0]?.url) {
      return res.status(200).json({ videoUrl: data.data[0].url });
    }
    
    return res.status(502).json({ error: 'No video URL returned', body: data });
  } catch (e) {
    console.error('generate-video error', e);
    return res.status(500).json({ error: 'Internal Server Error', message: String(e) });
  }
}

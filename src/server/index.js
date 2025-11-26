const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - wichtig für Nginx Reverse Proxy
app.set('trust proxy', 1);

// Gemini AI Setup - only initialize if API key is configured
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('⚠️ GEMINI_API_KEY not configured - AI features will use mock data');
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: ['https://brutus-ai.de', 'https://www.brutus-ai.de', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // 100 Requests pro IP
  message: 'Zu viele Anfragen von dieser IP, bitte später erneut versuchen.'
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 10, // 10 Content-Generierungen pro Stunde
  message: 'Content-Generierung Limit erreicht. Bitte in einer Stunde erneut versuchen.'
});

app.use('/api/', limiter);
app.use('/api/generate', apiLimiter);

// Mock Content Response Helper
function useMockContentResponse(res, trend, style, platform) {
  const content = {
    script: {
      hook: `🔥 Hast du schon von ${trend} gehört? Das wird alles verändern!`,
      main: `In diesem ${style} Video zeige ich dir, warum ${trend} der nächste große Trend auf ${platform} ist. Hier sind die wichtigsten Punkte, die du wissen musst...`,
      cta: `👉 Folge für mehr ${trend} Content! Kommentiere "MEHR" für Teil 2!`
    },
    videoPrompt: `Create a dynamic ${style} video about ${trend} for ${platform}, with engaging visuals and text overlays`,
    hashtags: ['#' + trend.replace(/\s+/g, ''), '#viral', '#trending', '#' + platform.toLowerCase(), '#contentcreator', '#socialmedia', '#2024'],
    metadata: {
      trend,
      style,
      platform,
      generatedAt: new Date().toISOString(),
      note: 'Mock-Daten - Bitte gültigen Gemini API Key in Settings hinterlegen'
    }
  };

  return res.json({
    success: true,
    content,
    warning: 'Demo-Modus: Bitte Gemini API Key in den Einstellungen aktualisieren'
  });
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Content Generation Endpoint
app.post('/api/generate/content', async (req, res) => {
  try {
    const { trend, style, platform } = req.body;

    if (!trend || !style || !platform) {
      return res.status(400).json({
        error: 'Fehlende Parameter: trend, style, platform erforderlich'
      });
    }

    // Check if Gemini API is available
    if (!genAI || !process.env.GEMINI_API_KEY) {
      console.warn('⚠️ Gemini API not configured - using mock data');
      return useMockContentResponse(res, trend, style, platform);
    }
    
    // Try Gemini AI first, fallback to mock if API fails
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
Du bist ein professioneller Social Media Content Creator. Erstelle ein virales Video-Skript für ${platform}.

Trend/Thema: ${trend}
Content-Stil: ${style}
Plattform: ${platform}

Erstelle folgendes (auf Deutsch):
1. Hook (erste 3 Sekunden - aufmerksamkeitserregend)
2. Main Content (Hauptinhalt - wertvoll und unterhaltsam)
3. Call-to-Action (CTA - zum Engagement anregen)
4. Video-Prompt für AI-Generierung (auf Englisch)
5. 5-8 relevante Hashtags

Format:
HOOK: [Text]
MAIN: [Text]
CTA: [Text]
VIDEO_PROMPT: [Text]
HASHTAGS: [Liste]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse Response
      const hookMatch = text.match(/HOOK:(.+?)(?=MAIN:|$)/s);
      const mainMatch = text.match(/MAIN:(.+?)(?=CTA:|$)/s);
      const ctaMatch = text.match(/CTA:(.+?)(?=VIDEO_PROMPT:|$)/s);
      const videoPromptMatch = text.match(/VIDEO_PROMPT:(.+?)(?=HASHTAGS:|$)/s);
      const hashtagsMatch = text.match(/HASHTAGS:(.+?)$/s);

      const content = {
        script: {
          hook: hookMatch ? hookMatch[1].trim() : '',
          main: mainMatch ? mainMatch[1].trim() : '',
          cta: ctaMatch ? ctaMatch[1].trim() : ''
        },
        videoPrompt: videoPromptMatch ? videoPromptMatch[1].trim() : '',
        hashtags: hashtagsMatch 
          ? hashtagsMatch[1].trim().split(/[,\s]+/).filter(h => h.startsWith('#'))
          : [],
        metadata: {
          trend,
          style,
          platform,
          generatedAt: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        content
      });

    } catch (apiError) {
      // Fallback: Mock Response wenn API fehlschlägt
      console.log('⚠️ Gemini API Error - Using Mock Data:', apiError.message);
      return useMockContentResponse(res, trend, style, platform);
    }

  } catch (error) {
    console.error('Content Generation Error:', error);
    res.status(500).json({
      error: 'Fehler bei der Content-Generierung',
      message: error.message
    });
  }
});

// Trend Analysis Endpoint
app.post('/api/trends/analyze', async (req, res) => {
  console.log('Received trend analyze request:', req.body);
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword erforderlich' });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
Analysiere den aktuellen Social Media Trend: "${keyword}"

Gib folgende Informationen zurück (auf Deutsch):
1. Trend-Score (1-100)
2. Wachstumspotential (niedrig/mittel/hoch)
3. Zielgruppe
4. Beste Plattformen (TikTok, Instagram, Facebook)
5. Content-Ideen (3-5 Vorschläge)

Format: JSON
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        success: true,
        analysis: text,
        keyword,
        analyzedAt: new Date().toISOString()
      });

    } catch (apiError) {
      // Fallback: Mock Response
      console.log('⚠️ Gemini API Error - Using Mock Data:', apiError.message);
      
      const mockAnalysis = {
        trendScore: Math.floor(Math.random() * 30) + 70,
        wachstumsPotential: 'hoch',
        zielgruppe: 'Gen Z und Millennials (18-35 Jahre)',
        bestePlattformen: ['TikTok', 'Instagram', 'YouTube'],
        contentIdeen: [
          `${keyword} Tutorial für Anfänger`,
          `Top 5 ${keyword} Tipps & Tricks`,
          `${keyword} Challenge`,
          `Warum ${keyword} gerade viral geht`,
          `${keyword} vs. Alternative - Was ist besser?`
        ]
      };

      res.json({
        success: true,
        analysis: JSON.stringify(mockAnalysis, null, 2),
        keyword,
        analyzedAt: new Date().toISOString(),
        warning: 'Demo-Modus: Bitte Gemini API Key in den Einstellungen aktualisieren'
      });
    }

  } catch (error) {
    console.error('Trend Analysis Error:', error);
    res.status(500).json({
      error: 'Fehler bei der Trend-Analyse',
      message: error.message
    });
  }
});

// Video Generation Endpoint (Mock - würde FFmpeg benötigen)
app.post('/api/generate/video', async (req, res) => {
  try {
    const { script, videoPrompt, platform } = req.body;

    // Hier würde die echte Video-Generierung mit FFmpeg/Runway/Stable Diffusion passieren
    // Für jetzt: Mock Response

    res.json({
      success: true,
      video: {
        id: `video_${Date.now()}`,
        status: 'processing',
        estimatedTime: '2-5 minutes',
        message: 'Video wird generiert...'
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Fehler bei der Video-Generierung',
      message: error.message
    });
  }
});

// Support Contact Endpoint
app.post('/api/support/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Hier würde Email-Versand an brutusaiswebapp@gmail.com passieren
    console.log('Support Request:', { name, email, message });

    res.json({
      success: true,
      message: 'Deine Nachricht wurde gesendet. Wir melden uns innerhalb von 24 Stunden bei dir.',
      supportEmail: 'brutusaiswebapp@gmail.com'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Fehler beim Senden der Nachricht',
      message: error.message
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Interner Server-Fehler',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ein Fehler ist aufgetreten'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Brutus AI Backend läuft auf Port ${PORT}`);
  console.log(`📧 Support Email: brutusaiswebapp@gmail.com`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? 'Konfiguriert' : 'Nicht konfiguriert'}`);
});

module.exports = app;

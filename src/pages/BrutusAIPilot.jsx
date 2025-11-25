import React, { useState, useEffect, useRef } from 'react';
import { Zap, Calendar, BarChart3, User, Lightbulb, MessageSquare, Users, Rocket, Search, Loader2, Trash2, Eye, Heart, TrendingUp } from 'lucide-react';
import { firebaseFunctions } from '../lib/firebase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';

// Mock Firebase functions - replace with real Firebase later
const mockFirebase = firebaseFunctions;

const DEFAULT_TRENDS = [
  {
    id: 'default-super-hack',
    title: 'Der 5-Sekunden Super-Hack',
    icon: 'lightbulb',
    description: 'Extrem schneller Schnitt mit einem überraschenden Alltagsgegenstand.',
    bullets: [
      'Hook unter 0,5 Sekunden',
      'Zeigt gewöhnlichen Gegenstand in neuem Licht',
      'Explosiver Soundeffekt als Punchline'
    ],
    imagePrompt: 'Ultra-fast TikTok cut with glowing everyday object, cinematic neon lighting, 9:16',
    text: 'Hook: "Stop! Du nutzt DAS falsch." ... CTA: "Speichere dieses Video!"'
  },
  {
    id: 'default-unpopular',
    title: "Der 'Unpopuläre Meinung' Reveal",
    icon: 'message-square',
    description: 'Creator flüstert ein heißes Statement im dunklen Raum.',
    bullets: [
      'Low-Light Stimmung',
      'Aufbau: erst leise, dann laut',
      'Faktencheck am Ende'
    ],
    imagePrompt: 'Moody room, creator whispering into camera, cinematic shadows, 9:16',
    text: 'Hook: "Alle liegen falsch bei ..." Aufbau -> Reveal -> CTA.'
  },
  {
    id: 'default-failure',
    title: 'Die Perfektion des Scheiterns (Relatability)',
    icon: 'users',
    description: 'Split-Screen zwischen Profi-Influencer und Realität.',
    bullets: [
      'Linke Seite: perfekte Challenge',
      'Rechte Seite: Creator versucht es schiefgehend',
      'Overlay-Tipps für Community'
    ],
    imagePrompt: 'Split screen of perfect influencer vs real attempt, bold captions, 9:16',
    text: 'Hook: "So sieht es bei mir WIRKLICH aus" ... CTA: "Markiere jemanden."'
  },
  {
    id: 'default-niche',
    title: 'Das Nischen-Phänomen (Micro-Viral)',
    icon: 'rocket',
    description: 'Fokussiert auf extrem spezifisches Detail (keyboard ASMR, etc.).',
    bullets: [
      'Hyperfokussiertes Detail',
      'Kontrastreiche Macro-Shots',
      'Mini-Storyline in 20 Sekunden'
    ],
    imagePrompt: 'Macro shot of keyboard hacks with neon lighting, viral short form look, 9:16',
    text: 'Hook: "Nur Keyboard-Nerds verstehen das" ... CTA: "Share mit deinem Duo."'
  }
];

const ALLOWED_ICONS = new Set(['lightbulb', 'message-square', 'users', 'rocket']);
const REQUIRED_TITLES = new Map(
  DEFAULT_TRENDS.map(trend => [trend.title.toLowerCase(), trend])
);

const sanitizeTrendsResponse = (raw = []) => {
  const normalized = raw
    .filter(Boolean)
    .map((item, index) => {
      const fallback = DEFAULT_TRENDS[index % DEFAULT_TRENDS.length];
      const title = (item.title || fallback.title || `Trend ${index + 1}`).trim();
      const canonicalId = item.id || `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${index}`;
      const fallbackBullets = fallback?.bullets || ['Hook', 'Story', 'CTA'];

      return {
        id: canonicalId,
        title,
        icon: ALLOWED_ICONS.has(item.icon) ? item.icon : (fallback?.icon || 'lightbulb'),
        description: item.description || fallback?.description || 'Neue Viral-Idee.',
        bullets: Array.isArray(item.bullets) && item.bullets.length ? item.bullets : fallbackBullets,
        imagePrompt: item.imagePrompt || fallback?.imagePrompt || 'Viral short-form content prompt',
        text: item.text || fallback?.text || 'Hook -> Mehrwert -> CTA',
      };
    });

  const ensuredDefaults = DEFAULT_TRENDS.map(defaultTrend => {
    const match = normalized.find(item => item.title.toLowerCase() === defaultTrend.title.toLowerCase());
    return match ? { ...defaultTrend, ...match } : defaultTrend;
  });

  const extras = normalized.filter(item => !REQUIRED_TITLES.has(item.title.toLowerCase()));
  return [...ensuredDefaults, ...extras];
};

export default function BrutusAIPilot() {
  const [activeTab, setActiveTab] = useState('studio');
  const [autoMode, setAutoMode] = useState(false);
  const [theme, setTheme] = useState('');
  const [trends, setTrends] = useState(DEFAULT_TRENDS);
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [trendAiInput, setTrendAiInput] = useState('Live Trend Fokus: Noch nicht gescannt');
  const [strategyInput, setStrategyInput] = useState('Konzentriere dich auf klare Hooks und CTA.');
  const [strategyStatus, setStrategyStatus] = useState('');

  const autoGenerationQueueRef = useRef(new Set());
  const autoStartRef = useRef(false);

  // Load prompts and videos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [promptsData, videosData] = await Promise.all([
      mockFirebase.getPrompts(),
      mockFirebase.getVideos()
    ]);
    setPrompts(promptsData);
    setVideos(videosData);
  };

  const handleStrategyUpdate = () => {
    if (!trendAiInput.trim() && !strategyInput.trim()) {
      setStrategyStatus('Bitte fülle Trend AI und Strategie aus.');
      return;
    }
    const timestamp = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    setStrategyStatus(`Strategie aktualisiert (${timestamp})`);
    setStatusMessage('Strategie Engine synchronisiert.');
  };

  // Auto-Pilot Loop
  useEffect(() => {
    if (!isAutoRunning) return;

    const interval = setInterval(async () => {
      try {
        const openPrompts = prompts.filter(p => p.status === 'Draft');
        if (openPrompts.length === 0) {
          setStatusMessage('Keine offenen Prompts gefunden...');
          return;
        }

        const selectedPrompt = openPrompts[0];
        setStatusMessage(`Bearbeite: ${selectedPrompt.title}...`);

        // Generate image with Pollinations.ai
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(selectedPrompt.imagePrompt)}?width=1080&height=1920&nologo=true`;
        
        // Update status
        await mockFirebase.updatePromptStatus(selectedPrompt.id, 'AUTO_PUBLISH');
        
        // Post to Make.com webhook (simulated)
        if (!MAKE_WEBHOOK_URL) {
          console.warn('Missing VITE_MAKE_WEBHOOK_URL for Auto-Pilot webhook calls.');
          setStatusMessage('⚠ Kein Webhook konfiguriert. Bitte VITE_MAKE_WEBHOOK_URL setzen.');
          return;
        }

        try {
          await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: imageUrl,
              text: selectedPrompt.text,
              promptId: selectedPrompt.id
            })
          });
          setStatusMessage(`✓ ${selectedPrompt.title} veröffentlicht!`);
        } catch (error) {
          console.error('Webhook error:', error);
          setStatusMessage(`⚠ Webhook-Fehler bei ${selectedPrompt.title}`);
        }

        loadData();
      } catch (error) {
        console.error('Auto-Pilot error:', error);
        setStatusMessage('⚠ Fehler im Auto-Pilot');
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoRunning, prompts]);

  useEffect(() => {
    if (!autoMode) {
      autoStartRef.current = false;
      if (isAutoRunning) {
        setIsAutoRunning(false);
        setStatusMessage('Auto-Pilot pausiert (Custom Modus).');
      }
      return;
    }

    if (autoStartRef.current || isAutoRunning || prompts.length === 0) {
      return;
    }

    autoStartRef.current = true;
    setIsAutoRunning(true);
    setStatusMessage('Auto-Pilot läuft im Auto-Modus.');
  }, [autoMode, prompts, isAutoRunning]);

  useEffect(() => {
    if (!autoMode || trends.length === 0) {
      return;
    }

    const missingTrends = trends.filter(trend => {
      if (autoGenerationQueueRef.current.has(trend.title)) {
        return false;
      }
      return !prompts.some(p => p.title === trend.title);
    });

    if (missingTrends.length === 0) {
      return;
    }

    missingTrends.forEach(async trend => {
      autoGenerationQueueRef.current.add(trend.title);
      try {
        await createPrompt(trend, { silent: true, autoGenerated: true });
      } finally {
        autoGenerationQueueRef.current.delete(trend.title);
      }
    });
  }, [autoMode, trends, prompts]);

  const scanTrends = async () => {
    if (!theme.trim()) {
      alert('Bitte gib ein Thema ein!');
      return;
    }

    if (!GEMINI_API_KEY) {
      alert('Kein Gemini API Key konfiguriert. Bitte VITE_GEMINI_API_KEY in der .env setzen.');
      return;
    }

    setIsScanning(true);
    setTrends([]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analysiere aktuelle Trends zum Thema "${theme}" und erstelle 4 virale Kurzvideo-Konzepte für TikTok/Instagram Reels. 

Antworte AUSSCHLIESSLICH mit einem JSON-Array (ohne Markdown-Formatierung):
[
  {
    "title": "Catchy Titel",
    "icon": "lightbulb|message-square|users|rocket",
    "description": "Kurze Beschreibung",
    "bullets": ["Punkt 1", "Punkt 2", "Punkt 3"],
    "imagePrompt": "Detaillierter Prompt für Thumbnail-Generierung",
    "text": "Vollständiger Video-Script-Text"
  }
]

Wichtig: 
- Nur gültiges JSON ohne \`\`\`json
- 4 unterschiedliche Konzepte
- Bullets sind konkrete Hook-Strategien
- imagePrompt ist detailliert für Pollinations.ai
- text ist komplettes Video-Skript (30-60 Sekunden)`
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 4000
            }
          })
        }
      );

      const data = await response.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Robust JSON parsing
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = content.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        const sanitized = sanitizeTrendsResponse(parsed);
        setTrends(sanitized);

        const summary = sanitized
          .slice(0, 3)
          .map(item => item.title)
          .join(' | ');
        setTrendAiInput(`Top Trends (${theme}): ${summary}`);
        setStrategyInput(`Fokus: ${sanitized[0].title} -> ${sanitized[0].bullets[0]}`);
      } else {
        throw new Error('Kein JSON-Array gefunden in der Antwort');
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Fehler beim Scannen der Trends. Wir laden Standard-Konzepte.');
      setTrends(DEFAULT_TRENDS);
    } finally {
      setIsScanning(false);
    }
  };

  const createPrompt = async (trend, options = {}) => {
    const { silent = false, autoGenerated = false } = options;
    await mockFirebase.addPrompt({
      title: trend.title,
      theme: theme || 'Auto-Thema',
      status: 'Draft',
      imagePrompt: trend.imagePrompt,
      text: trend.text,
      bullets: trend.bullets,
      source: autoGenerated ? 'auto' : 'manual'
    });
    await loadData();
    if (!silent) {
      alert(`"${trend.title}" wurde als Draft gespeichert!`);
    } else {
      setStatusMessage(`Auto-Pilot hat ${trend.title} zur Pipeline hinzugefügt.`);
    }
  };

  const deletePromptById = async (id) => {
    if (confirm('Wirklich löschen?')) {
      await mockFirebase.deletePrompt(id);
      loadData();
    }
  };

  const updateStatus = async (id, newStatus) => {
    await mockFirebase.updatePromptStatus(id, newStatus);
    loadData();
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'lightbulb': Lightbulb,
      'message-square': MessageSquare,
      'users': Users,
      'rocket': Rocket
    };
    return icons[iconName] || Lightbulb;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              BrutusAi Pilot
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Code
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
            <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              Teilen
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === 'studio'
                  ? 'text-white bg-purple-600 rounded-t-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              Studio
            </button>
            <button
              onClick={() => setActiveTab('planer')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === 'planer'
                  ? 'text-white bg-purple-600 rounded-t-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Planer
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === 'tracking'
                  ? 'text-white bg-purple-600 rounded-t-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Tracking
            </button>
            <button
              onClick={() => setActiveTab('profil')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                activeTab === 'profil'
                  ? 'text-white bg-purple-600 rounded-t-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Profil
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Studio Tab */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Auto Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Auto-Pilot Modus</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAutoMode(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      autoMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setAutoMode(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !autoMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>
              {autoMode && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setIsAutoRunning(!isAutoRunning)}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isAutoRunning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isAutoRunning ? 'Stop Auto' : 'Start Auto'}
                  </button>
                  {statusMessage && (
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      {isAutoRunning && <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
                      {statusMessage}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Thema eingeben (z.B. Tech, Cooking)..."
                className="flex-1 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
                onKeyPress={(e) => e.key === 'Enter' && scanTrends()}
              />
              <button
                onClick={scanTrends}
                disabled={isScanning}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scannen...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Scannen
                  </>
                )}
              </button>
            </div>

            {/* Sidebar & Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Trend AI
                  </label>
                  <textarea
                    value={trendAiInput}
                    onChange={(event) => setTrendAiInput(event.target.value)}
                    placeholder="Trendreport..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-purple-500 min-h-[80px]"
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Strategie
                  </label>
                  <textarea
                    value={strategyInput}
                    onChange={(event) => setStrategyInput(event.target.value)}
                    placeholder="Aktueller Fokus..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-purple-500 mb-3 min-h-[80px]"
                  />
                  <button
                    onClick={handleStrategyUpdate}
                    className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Strategie Update
                  </button>
                  {strategyStatus && (
                    <p className="text-xs text-slate-500 mt-2">{strategyStatus}</p>
                  )}
                </div>
              </div>

              {/* Trend Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {trends.map((trend, index) => {
                  const IconComponent = getIconComponent(trend.icon);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                          {trend.title}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {trend.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {trend.bullets.map((bullet, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-purple-600 font-bold mt-0.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
                          Details ansehen
                        </button>
                        <button
                          onClick={() => createPrompt(trend)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          Erstellen
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!isScanning && trends.length === 0 && theme && (
                  <div className="md:col-span-2 text-center py-12 text-slate-400">
                    Keine Trends gefunden. Klicke auf "Scannen" um zu starten.
                  </div>
                )}

                {!theme && !isScanning && (
                  <div className="md:col-span-2 text-center py-12 text-slate-400">
                    Gib ein Thema ein und klicke auf "Scannen" um virale Konzepte zu entdecken.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Planer Tab */}
        {activeTab === 'planer' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Content Planer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">{prompt.title}</h3>
                    <button
                      onClick={() => deletePromptById(prompt.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      prompt.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                      prompt.status === 'AUTO_PUBLISH' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {prompt.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{prompt.text}</p>

                  <div className="flex gap-2">
                    {prompt.status === 'Draft' && (
                      <button
                        onClick={() => updateStatus(prompt.id, 'Completed')}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        Fertig
                      </button>
                    )}
                    {prompt.status === 'AUTO_PUBLISH' && (
                      <button
                        onClick={() => updateStatus(prompt.id, 'Draft')}
                        className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Zurück
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {prompts.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400">
                  Noch keine Prompts erstellt. Gehe zu Studio und scanne Trends!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Video Tracking</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Titel</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Plattform</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Likes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">{video.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {video.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        {video.views?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          {video.likes?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Live
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {videos.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  Noch keine Videos veröffentlicht.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profil Tab */}
        {activeTab === 'profil' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Profil Einstellungen</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {mockFirebase.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{mockFirebase.user.name}</h3>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full mt-1">
                    {mockFirebase.user.plan} Plan
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue={mockFirebase.user.name}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="creator@brutusai.de"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mt-4">
                  Änderungen speichern
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">API Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gemini API Key</label>
                  <input
                    type="password"
                    value={GEMINI_API_KEY}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Make.com Webhook</label>
                  <input
                    type="text"
                    placeholder="https://hook.eu2.make.com/..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

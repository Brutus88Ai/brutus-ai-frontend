import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader, Zap, Calendar, TrendingUp, BarChart3, User, Settings, Play, Pause,
  CheckCircle, Trash2, Eye, Image, X, BarChart
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, getDocs, getDoc, addDoc, 
  deleteDoc, updateDoc, serverTimestamp, onSnapshot
} from 'firebase/firestore';

// === FIREBASE SETUP ===
let firebaseConfig = {};
try {
  const serialized = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
  firebaseConfig = JSON.parse(serialized);
} catch (error) {
  console.error('Firebase config parse error:', error);
}

let app, auth, db;
try {
  if (firebaseConfig?.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase init error:', error);
}

const appId = (typeof __app_id !== 'undefined' ? __app_id : 'brutusai').replace(/[^a-zA-Z0-9_-]/g, '_');

// === MAIN APP ===
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('studio');
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  
  // Studio
  const [mode, setMode] = useState('auto');
  const [strategy, setStrategy] = useState('');
  const [topic, setTopic] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  // Auto-Pilot
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const autoPilotInterval = useRef(null);
  
  // Planner
  const [drafts, setDrafts] = useState([]);
  
  // Tracking
  const [published, setPublished] = useState([]);
  const [showSimulator, setShowSimulator] = useState(null);
  
  // Profile
  const [userProfile, setUserProfile] = useState({ 
    name: 'Creator', 
    tier: 'free', 
    videosProduced: 0 
  });
  
  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
      setApiKeyValid(true);
    }
    
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser.uid);
      } else {
        await signInAnonymously(auth);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    if (!db) return;
    try {
      const profileDoc = await getDoc(doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data'));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }

      onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/prompts`), (snapshot) => {
        const promptsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPrompts(promptsList.filter(p => p.status === 'PENDING' || p.status === 'IMAGE_READY'));
      });

      onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/drafts`), (snapshot) => {
        setDrafts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/published`), (snapshot) => {
        setPublished(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', geminiApiKey);
    setApiKeyValid(!!geminiApiKey);
    setShowSettings(false);
    showToast('API Key gespeichert!');
  };

  const generatePrompts = async () => {
    if (!topic.trim()) {
      showToast('Bitte Thema eingeben');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic, 
          category: mode === 'auto' ? 'Auto' : 'Custom',
          strategy: strategy 
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      
      if (user && db) {
        for (const concept of data.concepts) {
          await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/prompts`), {
            title: concept.title,
            hook: concept.hook,
            script: concept.script,
            visualDescription: concept.visualDescription,
            tags: concept.tags || [],
            status: 'PENDING',
            createdAt: serverTimestamp()
          });
        }
      }
      
      showToast(`${data.concepts.length} Ideen generiert!`);
    } catch (error) {
      console.error('Generate error:', error);
      showToast('Fehler beim Generieren');
    } finally {
      setGenerating(false);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const response = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.visualDescription })
      });

      if (!response.ok) throw new Error('Image generation failed');

      const data = await response.json();
      
      if (user && db) {
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/prompts`, prompt.id), {
          imageUrl: data.imageUrl,
          status: 'IMAGE_READY'
        });
      }
      
      showToast('Bild erstellt!');
    } catch (error) {
      console.error('Image error:', error);
      showToast('Bild-Fehler');
    }
  };

  const startProduction = async (prompt) => {
    try {
      await fetch('/api/trigger-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'anonymous',
          concept: prompt,
          thumbnail: prompt.imageUrl,
          platform: 'tiktok'
        })
      });

      if (user && db) {
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/published`), {
          ...prompt,
          status: 'PROCESSING',
          publishedAt: serverTimestamp(),
          platform: 'TikTok',
          views: 0,
          likes: 0
        });
        
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/prompts`, prompt.id));
      }
      
      showToast('Produktion gestartet!');
    } catch (error) {
      console.error('Production error:', error);
      showToast('Produktions-Fehler');
    }
  };

  const toggleAutoPilot = () => {
    if (autoPilotActive) {
      stopAutoPilot();
    } else {
      startAutoPilot();
    }
  };

  const startAutoPilot = () => {
    setAutoPilotActive(true);
    showToast('Auto-Pilot gestartet!');
    
    autoPilotInterval.current = setInterval(async () => {
      if (!user || !db) return;
      
      try {
        const promptsSnap = await getDocs(collection(db, `artifacts/${appId}/users/${user.uid}/prompts`));
        const pendingPrompts = promptsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.status === 'PENDING');
        
        if (pendingPrompts.length === 0) return;
        
        const nextPrompt = pendingPrompts[0];
        
        const imgResponse = await fetch('/api/generate-thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: nextPrompt.visualDescription })
        });
        
        const imgData = await imgResponse.json();
        
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/prompts`, nextPrompt.id), {
          imageUrl: imgData.imageUrl,
          status: 'IMAGE_READY'
        });
        
        await fetch('/api/trigger-production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            concept: { ...nextPrompt, imageUrl: imgData.imageUrl },
            thumbnail: imgData.imageUrl,
            platform: 'tiktok'
          })
        });
        
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/published`), {
          ...nextPrompt,
          imageUrl: imgData.imageUrl,
          status: 'AUTO_PUBLISH',
          publishedAt: serverTimestamp(),
          platform: 'TikTok',
          views: 0,
          likes: 0
        });
        
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/prompts`, nextPrompt.id));
        
      } catch (error) {
        console.error('Auto-pilot error:', error);
      }
    }, 2000);
  };

  const stopAutoPilot = () => {
    setAutoPilotActive(false);
    if (autoPilotInterval.current) {
      clearInterval(autoPilotInterval.current);
      autoPilotInterval.current = null;
    }
    showToast('Auto-Pilot gestoppt');
  };

  const saveToDraft = async (prompt) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/drafts`), {
        ...prompt,
        savedAt: serverTimestamp()
      });
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/prompts`, prompt.id));
      showToast('Als Entwurf gespeichert');
    } catch (error) {
      console.error('Draft error:', error);
    }
  };

  const completeDraft = async (draft) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/published`), {
        ...draft,
        status: 'COMPLETED',
        publishedAt: serverTimestamp(),
        platform: 'TikTok',
        views: 0,
        likes: 0
      });
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/drafts`, draft.id));
      showToast('Entwurf abgeschlossen');
    } catch (error) {
      console.error('Complete error:', error);
    }
  };

  const deleteDraft = async (draftId) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/drafts`, draftId));
      showToast('Entwurf gelöscht');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const simulateStats = async (videoId) => {
    if (!user || !db) return;
    const views = Math.floor(Math.random() * 10000) + 500;
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.05));
    
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/published`, videoId), {
        views,
        likes,
        status: 'COMPLETED'
      });
      showToast(`Simuliert: ${views} Views, ${likes} Likes`);
      setShowSimulator(null);
    } catch (error) {
      console.error('Simulator error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (autoPilotInterval.current) {
        clearInterval(autoPilotInterval.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-indigo-600">BrutusAi</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {autoPilotActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-700">Auto-Pilot Aktiv</span>
              </div>
            )}
            
            <button
              onClick={toggleAutoPilot}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                autoPilotActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {autoPilotActive ? <Pause size={16} /> : <Play size={16} />}
              {autoPilotActive ? 'Stop Auto' : 'Start Auto'}
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            >
              <Settings size={20} className="text-gray-600" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${apiKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-[73px] z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex">
            {[
              { id: 'studio', label: '⚡ Studio', icon: Zap },
              { id: 'planer', label: '📅 Planer', icon: Calendar },
              { id: 'tracking', label: '📈 Tracking', icon: BarChart3 },
              { id: 'profil', label: '👤 Profil', icon: User }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition relative ${
                  activeTab === tab.id 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'studio' && (
          <StudioTab
            mode={mode}
            setMode={setMode}
            strategy={strategy}
            setStrategy={setStrategy}
            topic={topic}
            setTopic={setTopic}
            generatePrompts={generatePrompts}
            generating={generating}
            prompts={prompts}
            generateImage={generateImage}
            startProduction={startProduction}
            saveToDraft={saveToDraft}
          />
        )}
        {activeTab === 'planer' && (
          <PlanerTab
            drafts={drafts}
            completeDraft={completeDraft}
            deleteDraft={deleteDraft}
          />
        )}
        {activeTab === 'tracking' && (
          <TrackingTab
            published={published}
            setShowSimulator={setShowSimulator}
          />
        )}
        {activeTab === 'profil' && <ProfilTab userProfile={userProfile} />}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Einstellungen</h3>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={saveApiKey}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {showSimulator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Statistik Simulator</h3>
              <button onClick={() => setShowSimulator(null)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Simuliert Views und Likes für: <br />
              <span className="font-bold">{showSimulator.title}</span>
            </p>
            <button
              onClick={() => simulateStats(showSimulator.id)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Zufällige Stats generieren
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-24 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          {toast}
        </div>
      )}
    </div>
  );
}

function StudioTab({ mode, setMode, strategy, setStrategy, topic, setTopic, generatePrompts, generating, prompts, generateImage, startProduction, saveToDraft }) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('auto')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            mode === 'auto' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Auto
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            mode === 'custom' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Custom
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="space-y-4">
          {mode === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚙️ Strategie
              </label>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Dein Prompt..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={3}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thema eingeben (z.B. Tech, Cooking...)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="z.B. Crypto, Fitness..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={generatePrompts}
                disabled={generating}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? <Loader className="animate-spin" size={20} /> : null}
                {generating ? 'Generieren...' : 'Scannen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {prompts.length > 0 && (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex gap-4">
                {prompt.imageUrl ? (
                  <img src={prompt.imageUrl} alt={prompt.title} className="w-32 h-32 object-cover rounded-lg" />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image size={32} className="text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">{prompt.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{prompt.hook}</p>
                  {prompt.tags && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {prompt.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!prompt.imageUrl && (
                      <button
                        onClick={() => generateImage(prompt)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                      >
                        BILD
                      </button>
                    )}
                    {prompt.imageUrl && (
                      <button
                        onClick={() => startProduction(prompt)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition text-sm"
                      >
                        PRODUZIEREN
                      </button>
                    )}
                    <button
                      onClick={() => saveToDraft(prompt)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                    >
                      DRAFT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanerTab({ drafts, completeDraft, deleteDraft }) {
  return (
    <div className="space-y-6">
      {drafts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Keine Entwürfe vorhanden</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              {draft.imageUrl && (
                <img src={draft.imageUrl} alt={draft.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h4 className="font-bold mb-2">{draft.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{draft.hook}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => completeDraft(draft)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition text-sm flex items-center justify-center gap-1"
                >
                  <CheckCircle size={16} />Abschließen
                </button>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackingTab({ published, setShowSimulator }) {
  return (
    <div className="space-y-6">
      {published.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <Eye size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Noch keine Videos veröffentlicht</p>
        </div>
      ) : (
        <div className="space-y-4">
          {published.map(video => (
            <div key={video.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex gap-4">
              {video.imageUrl && (
                <img src={video.imageUrl} alt={video.title} className="w-32 h-32 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <h4 className="font-bold mb-1">{video.title}</h4>
                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                  <span>📱 {video.platform}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    video.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    video.status === 'AUTO_PUBLISH' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {video.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>👁️ {video.views || 0} Views</span>
                  <span>❤️ {video.likes || 0} Likes</span>
                </div>
              </div>
              <button
                onClick={() => setShowSimulator(video)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
              >
                <BarChart size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilTab({ userProfile }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          {userProfile.name[0]}
        </div>
        <h2 className="text-2xl font-bold mb-2">{userProfile.name}</h2>
        
        {userProfile.tier === 'pro' ? (
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold mb-6">
            PRO Member
          </div>
        ) : (
          <div className="mb-6">
            <div className="text-gray-600 mb-2">Free Plan</div>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Upgrade
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{userProfile.videosProduced}</div>
            <div className="text-sm text-gray-600">Videos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600">0</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600">0</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

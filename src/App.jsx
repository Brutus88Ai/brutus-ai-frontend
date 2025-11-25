import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader, Zap, Calendar, TrendingUp, BarChart3, User, Crown, Play, Pause,
  CheckCircle, Clock, Trash2, Eye, Upload, Search, Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, getDocs, getDoc, addDoc, deleteDoc, serverTimestamp
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
  
  // Auto-Scan State
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState('');
  const [trends, setTrends] = useState([]);
  const [scanningMode, setScanningMode] = useState('auto'); // 'auto' or 'custom'
  
  // Scheduler State
  const [schedulerActive, setSchedulerActive] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduledPosts, setScheduledPosts] = useState([]);
  
  // Published & Profile
  const [published, setPublished] = useState([]);
  const [userProfile, setUserProfile] = useState({ tier: 'free', videosProduced: 0, creditsRemaining: 10 });
  
  const autoScanInterval = useRef(null);
  const schedulerInterval = useRef(null);

  useEffect(() => {
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
      if (profileDoc.exists()) setUserProfile(profileDoc.data());

      const publishedSnap = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/published`));
      setPublished(publishedSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const scheduleSnap = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/schedule`));
      setScheduledPosts(scheduleSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  // === AUTO TREND SCAN ===
  const startAutoScan = async () => {
    setAutoScanActive(true);
    await scanTrends();
    
    autoScanInterval.current = setInterval(async () => {
      await scanTrends();
    }, 3600000); // Scan every hour
  };

  const stopAutoScan = () => {
    setAutoScanActive(false);
    if (autoScanInterval.current) {
      clearInterval(autoScanInterval.current);
      autoScanInterval.current = null;
    }
  };

  const scanTrends = async () => {
    try {
      // Get real Google Trends data
      const trendsResponse = await fetch('/api/google-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'DE', category: '' })
      });

      if (!trendsResponse.ok) throw new Error('Trends fetch failed');

      const trendsData = await trendsResponse.json();
      
      // Generate video concepts from trending topics
      const concepts = await Promise.all(
        trendsData.trends.slice(0, 4).map(async (trend) => {
          const response = await fetch('/api/analyze-trends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: trend.title, category: trend.category })
          });

          if (!response.ok) throw new Error('Concept generation failed');

          const data = await response.json();
          const concept = data.concepts[0];
          
          // Generate thumbnail
          const imgResponse = await fetch('/api/generate-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: concept.visualDescription })
          });
          const imgData = await imgResponse.json();
          
          return { 
            ...concept, 
            imageUrl: imgData.imageUrl, 
            id: Date.now() + Math.random(),
            trendInfo: trend
          };
        })
      );

      setTrends(prev => [...concepts, ...prev].slice(0, 20));
      setCurrentStrategy('Google Trends Auto');
    } catch (error) {
      console.error('Auto scan error:', error);
    }
  };

  const scanCustomTrends = async () => {
    if (!currentStrategy.trim()) {
      alert('Bitte Strategie eingeben');
      return;
    }
    
    try {
      const response = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: currentStrategy, category: 'Custom' })
      });

      if (!response.ok) throw new Error('Scan failed');

      const data = await response.json();
      const conceptsWithImages = await Promise.all(
        data.concepts.map(async (concept) => {
          const imgResponse = await fetch('/api/generate-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: concept.visualDescription })
          });
          const imgData = await imgResponse.json();
          return { ...concept, imageUrl: imgData.imageUrl, id: Date.now() + Math.random() };
        })
      );

      setTrends(conceptsWithImages);
    } catch (error) {
      console.error('Custom scan error:', error);
      alert('Scan fehlgeschlagen');
    }
  };

  // === SCHEDULER ===
  const startScheduler = () => {
    if (trends.length === 0) {
      alert('Erst Trends scannen!');
      return;
    }
    
    setSchedulerActive(true);
    
    const intervalMs = scheduleInterval === 'daily' ? 86400000 : 
                      scheduleInterval === 'weekly' ? 604800000 : 2592000000;
    
    schedulerInterval.current = setInterval(async () => {
      if (trends.length > 0) {
        const randomTrend = trends[Math.floor(Math.random() * trends.length)];
        await produceAndUpload(randomTrend);
      }
    }, intervalMs);
  };

  const stopScheduler = () => {
    setSchedulerActive(false);
    if (schedulerInterval.current) {
      clearInterval(schedulerInterval.current);
      schedulerInterval.current = null;
    }
  };

  const produceAndUpload = async (trend) => {
    if (userProfile.creditsRemaining <= 0 && userProfile.tier === 'free') {
      alert('Keine Credits mehr! Upgrade zu PRO.');
      stopScheduler();
      return;
    }

    try {
      // Trigger video production
      await fetch('/api/trigger-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'anonymous',
          concept: trend,
          thumbnail: trend.imageUrl,
          platform: 'tiktok'
        })
      });

      // Save to published
      if (user && db) {
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/published`), {
          ...trend,
          publishedAt: serverTimestamp(),
          status: 'processing',
          views: 0,
          likes: 0
        });
      }

      // Update credits
      const newCredits = userProfile.tier === 'free' ? Math.max(0, userProfile.creditsRemaining - 1) : userProfile.creditsRemaining;
      const newCount = userProfile.videosProduced + 1;
      setUserProfile(prev => ({ ...prev, creditsRemaining: newCredits, videosProduced: newCount }));
      
      if (user && db) {
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data'), {
          creditsRemaining: newCredits,
          videosProduced: newCount,
          tier: userProfile.tier
        }, { merge: true });
      }

      await loadUserData(user.uid);
    } catch (error) {
      console.error('Production error:', error);
    }
  };

  const schedulePost = async (trend) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/schedule`), {
        ...trend,
        scheduledFor: new Date(Date.now() + 3600000).toISOString(),
        createdAt: serverTimestamp()
      });
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Schedule error:', error);
    }
  };

  const deleteScheduled = async (id) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/schedule`, id));
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (autoScanInterval.current) clearInterval(autoScanInterval.current);
      if (schedulerInterval.current) clearInterval(schedulerInterval.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={32} className="text-yellow-300" />
              <div>
                <h1 className="text-3xl font-bold">BrutusAi</h1>
                <p className="text-sm text-blue-100">Automatisches Content Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {schedulerActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm font-bold">AUTO AKTIV</span>
                </div>
              )}
              {userProfile.tier === 'pro' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-full font-bold">
                  <Crown size={18} />PRO
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-sm opacity-90">Credits</div>
                  <div className="text-2xl font-bold">{userProfile.creditsRemaining}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Simple Navigation */}
      <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex">
            {[
              { id: 'studio', label: '🎬 Studio', icon: Zap },
              { id: 'planer', label: '📅 Planer', icon: Calendar },
              { id: 'tracking', label: '📊 Videos', icon: BarChart3 },
              { id: 'profil', label: '👤 Profil', icon: User }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 font-bold text-lg border-b-4 transition-all ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'studio' && (
          <StudioTab 
            scanningMode={scanningMode}
            setScanningMode={setScanningMode}
            currentStrategy={currentStrategy}
            setCurrentStrategy={setCurrentStrategy}
            autoScanActive={autoScanActive}
            startAutoScan={startAutoScan}
            stopAutoScan={stopAutoScan}
            scanCustomTrends={scanCustomTrends}
            trends={trends}
            produceAndUpload={produceAndUpload}
            schedulePost={schedulePost}
          />
        )}
        {activeTab === 'planer' && (
          <PlanerTab
            schedulerActive={schedulerActive}
            scheduleInterval={scheduleInterval}
            setScheduleInterval={setScheduleInterval}
            scheduleTime={scheduleTime}
            setScheduleTime={setScheduleTime}
            startScheduler={startScheduler}
            stopScheduler={stopScheduler}
            scheduledPosts={scheduledPosts}
            deleteScheduled={deleteScheduled}
            produceAndUpload={produceAndUpload}
          />
        )}
        {activeTab === 'tracking' && <TrackingTab published={published} />}
        {activeTab === 'profil' && <ProfilTab userProfile={userProfile} />}
      </main>
    </div>
  );
}

// === STUDIO TAB ===
function StudioTab({ scanningMode, setScanningMode, currentStrategy, setCurrentStrategy, autoScanActive, startAutoScan, stopAutoScan, scanCustomTrends, trends, produceAndUpload, schedulePost }) {
  return (
    <div className="space-y-8">
      {/* Big Action Button */}
      <div className="text-center">
        {autoScanActive ? (
          <div className="inline-block">
            <button
              onClick={stopAutoScan}
              className="px-12 py-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-4"
            >
              <Pause size={32} />
              <div className="text-left">
                <div>Auto-Scan STOPPEN</div>
                <div className="text-sm font-normal opacity-90">Läuft seit Start...</div>
              </div>
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Scannt automatisch Google Trends jede Stunde
            </div>
          </div>
        ) : (
          <button
            onClick={startAutoScan}
            className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-4 mx-auto"
          >
            <Play size={32} />
            <div className="text-left">
              <div>AUTO-SCAN STARTEN</div>
              <div className="text-sm font-normal opacity-90">Findet automatisch virale Trends</div>
            </div>
          </button>
        )}
      </div>

      {/* Manual Search */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="text-blue-600" />
            Oder eigenes Thema suchen
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={currentStrategy}
              onChange={(e) => setCurrentStrategy(e.target.value)}
              placeholder="z.B. KI, Fitness, Finanzen..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-blue-600 outline-none"
            />
            <button
              onClick={scanCustomTrends}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
            >
              Scannen
            </button>
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      {trends.length > 0 ? (
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="text-yellow-500" />
            {trends.length} Virale Video-Ideen gefunden
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trends.map((trend, idx) => (
              <div key={trend.id || idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-gray-100">
                {trend.imageUrl && (
                  <div className="relative">
                    <img src={trend.imageUrl} alt={trend.title} className="w-full h-48 object-cover" />
                    {trend.trendInfo && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                        🔥 {(trend.trendInfo.traffic / 1000).toFixed(0)}K
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-lg">{trend.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{trend.hook}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => schedulePost(trend)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} />Planen
                    </button>
                    <button
                      onClick={() => produceAndUpload(trend)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Play size={16} />Jetzt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp size={80} className="mx-auto mb-6 opacity-30" />
          <p className="text-xl">Klicke oben auf "AUTO-SCAN STARTEN"</p>
          <p className="text-lg mt-2">oder suche nach einem eigenen Thema</p>
        </div>
      )}
    </div>
  );
}

// === PLANER TAB ===
function PlanerTab({ schedulerActive, scheduleInterval, setScheduleInterval, scheduleTime, setScheduleTime, startScheduler, stopScheduler, scheduledPosts, deleteScheduled, produceAndUpload }) {
  return (
    <div className="space-y-8">
      {/* Big Scheduler Control */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Calendar size={36} />
          Automatischer Upload-Planer
        </h2>
        
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-white/90">Wie oft posten?</label>
              <select
                value={scheduleInterval}
                onChange={(e) => setScheduleInterval(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl font-bold text-lg focus:ring-4 focus:ring-white/50 outline-none"
              >
                <option value="daily">🗓️ Jeden Tag</option>
                <option value="weekly">📅 Jede Woche</option>
                <option value="monthly">📆 Jeden Monat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-white/90">Um welche Uhrzeit?</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl font-bold text-lg focus:ring-4 focus:ring-white/50 outline-none"
              />
            </div>
            <div className="flex items-end">
              {schedulerActive ? (
                <button
                  onClick={stopScheduler}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Pause size={24} />STOPPEN
                </button>
              ) : (
                <button
                  onClick={startScheduler}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play size={24} />STARTEN
                </button>
              )}
            </div>
          </div>
        </div>

        {schedulerActive && (
          <div className="bg-green-500 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <div className="font-bold text-lg">
              ✅ Läuft! Postet automatisch {scheduleInterval === 'daily' ? 'täglich' : scheduleInterval === 'weekly' ? 'wöchentlich' : 'monatlich'} um {scheduleTime} Uhr
            </div>
          </div>
        )}
      </div>

      {/* Scheduled Posts */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📋 Geplante Posts ({scheduledPosts.length})
        </h3>
        {scheduledPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Keine geplanten Posts</p>
            <p className="text-sm mt-2">Gehe zu Studio und klicke "Planen"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="w-20 h-20 object-cover rounded-xl" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{post.title}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Clock size={14} />
                    {new Date(post.scheduledFor).toLocaleString('de-DE')}
                  </p>
                </div>
                <button
                  onClick={() => produceAndUpload(post)}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Upload size={18} />Jetzt posten
                </button>
                <button
                  onClick={() => deleteScheduled(post.id)}
                  className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === TRACKING TAB ===
function TrackingTab({ published }) {
  const totalViews = published.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = published.reduce((sum, v) => sum + (v.likes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-sm font-semibold opacity-90 mb-2">Gesamt Videos</div>
          <div className="text-5xl font-bold">{published.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-sm font-semibold opacity-90 mb-2">Gesamt Views</div>
          <div className="text-5xl font-bold">{totalViews.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-sm font-semibold opacity-90 mb-2">Gesamt Likes</div>
          <div className="text-5xl font-bold">{totalLikes.toLocaleString()}</div>
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🎬 Alle Videos ({published.length})
        </h2>
        {published.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Eye size={80} className="mx-auto mb-6 opacity-30" />
            <p className="text-xl">Noch keine Videos veröffentlicht</p>
            <p className="text-lg mt-2">Gehe zu Studio und produziere dein erstes Video!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {published.map(video => (
              <div key={video.id} className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 hover:shadow-xl transition-all">
                {video.imageUrl && (
                  <img src={video.imageUrl} alt={video.title} className="w-32 h-32 object-cover rounded-xl shadow-md" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">{video.title}</h3>
                  <p className="text-gray-600 mb-3">{video.hook}</p>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Eye className="text-blue-500" size={20} />
                      <span className="font-bold text-lg">{video.views || 0}</span>
                      <span className="text-sm text-gray-500">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">❤️</span>
                      <span className="font-bold text-lg">{video.likes || 0}</span>
                      <span className="text-sm text-gray-500">Likes</span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-1 rounded-full font-bold ${
                      video.status === 'published' ? 'bg-green-100 text-green-700' : 
                      video.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {video.status === 'published' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      {video.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// === PROFIL TAB ===
function ProfilTab({ userProfile }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User size={36} />
          Dein Account
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Membership */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Mitgliedschaft</h3>
            {userProfile.tier === 'pro' ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-center">
                <Crown className="mx-auto mb-3 text-white" size={48} />
                <div className="text-2xl font-bold text-white">PRO Member</div>
                <div className="text-white/90 mt-2">Unlimited Credits</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="text-gray-600 text-sm mb-2">Free Tier</div>
                  <div className="text-6xl font-bold text-blue-600 mb-2">{userProfile.creditsRemaining}</div>
                  <div className="text-gray-500">Credits übrig</div>
                </div>
                <button className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3">
                  <Crown size={24} />
                  Upgrade zu PRO
                  <div className="text-sm font-normal">9,99€/Monat</div>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Deine Statistiken</h3>
            <div className="space-y-4">
              <div className="bg-white/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white/90">Videos produziert</span>
                <span className="text-3xl font-bold">{userProfile.videosProduced}</span>
              </div>
              <div className="bg-white/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white/90">Gesamt Views</span>
                <span className="text-3xl font-bold">0</span>
              </div>
              <div className="bg-white/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white/90">Gesamt Likes</span>
                <span className="text-3xl font-bold">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200">
        <h3 className="text-2xl font-bold mb-6">Was BrutusAi kann:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            '🔍 Automatische Google Trends Suche',
            '🎬 Video-Konzepte mit AI erstellen',
            '🖼️ Automatische Thumbnails generieren',
            '📅 Scheduler für automatische Posts',
            '📊 Performance Tracking',
            '⚡ Vollautomatischer Workflow',
            '🎯 TikTok & YouTube Shorts',
            '🚀 Ein-Klick Produktion'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
              <CheckCircle className="text-green-500" size={20} />
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

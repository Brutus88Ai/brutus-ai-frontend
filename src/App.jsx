import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader, Zap, Calendar, TrendingUp, BarChart3, User, Crown, Play, Pause,
  CheckCircle, Clock, Settings, Edit3, Trash2, Eye, Upload
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
      const topics = ['Tech', 'AI', 'Finance', 'Fitness', 'Food', 'Travel', 'Gaming', 'Fashion'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const response = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: randomTopic, category: randomTopic })
      });

      if (!response.ok) throw new Error('Trend scan failed');

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

      setTrends(prev => [...conceptsWithImages, ...prev].slice(0, 20));
      setCurrentStrategy(randomTopic);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BrutusAi
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2">
              <Play size={16} />Start Auto
            </button>
            {userProfile.tier === 'pro' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow">
                <Crown size={16} className="text-white" />
                <span className="text-sm font-bold text-white">PRO</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-600">
                Credits: <span className="text-blue-600 font-bold">{userProfile.creditsRemaining}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'studio', label: 'Studio', icon: Zap },
              { id: 'planer', label: 'Planer', icon: Calendar },
              { id: 'tracking', label: 'Tracking', icon: BarChart3 },
              { id: 'profil', label: 'Profil', icon: User }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition font-medium ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
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
    <div className="space-y-6">
      {/* Scan Mode Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setScanningMode('auto')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              scanningMode === 'auto' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setScanningMode('custom')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              scanningMode === 'custom' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Custom
          </button>
        </div>

        <div className="p-6">
          {scanningMode === 'auto' ? (
            <div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <TrendingUp size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Trend Spy AI</h2>
                    <p className="text-blue-100 mb-4">
                      Analysiert virale Signale für deine Nische.
                    </p>
                    {autoScanActive ? (
                      <button
                        onClick={stopAutoScan}
                        className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                      >
                        <Pause size={20} />Stoppen
                      </button>
                    ) : (
                      <button
                        onClick={startAutoScan}
                        className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                      >
                        <Play size={20} />Auto-Scan starten
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {autoScanActive && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Scannt automatisch jede Stunde...
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Settings className="inline mr-2" size={16} />Strategie
                </label>
                <input
                  type="text"
                  value={currentStrategy}
                  onChange={(e) => setCurrentStrategy(e.target.value)}
                  placeholder="Aktueller Teknus..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={scanCustomTrends}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                Strategie Update
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trends Display */}
      {trends.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Noch keine Trends. Klicke "Scannen" oder "Strategie Update".
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trends.map((trend, idx) => (
              <div key={trend.id || idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {trend.imageUrl && (
                  <img src={trend.imageUrl} alt={trend.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-gray-800">{trend.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{trend.hook}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => schedulePost(trend)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Calendar size={14} />Planen
                    </button>
                    <button
                      onClick={() => produceAndUpload(trend)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition flex items-center justify-center gap-1"
                    >
                      <Play size={14} />Produzieren
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// === PLANER TAB ===
function PlanerTab({ schedulerActive, scheduleInterval, setScheduleInterval, scheduleTime, setScheduleTime, startScheduler, stopScheduler, scheduledPosts, deleteScheduled, produceAndUpload }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" />Automatischer Planer
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Intervall</label>
            <select
              value={scheduleInterval}
              onChange={(e) => setScheduleInterval(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="monthly">Monatlich</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Uhrzeit</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            {schedulerActive ? (
              <button
                onClick={stopScheduler}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <Pause size={20} />Stoppen
              </button>
            ) : (
              <button
                onClick={startScheduler}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Play size={20} />Starten
              </button>
            )}
          </div>
        </div>

        {schedulerActive && (
          <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Scheduler aktiv - Postet automatisch {scheduleInterval === 'daily' ? 'täglich' : scheduleInterval === 'weekly' ? 'wöchentlich' : 'monatlich'} um {scheduleTime} Uhr
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Geplante Posts</h3>
        {scheduledPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Keine geplanten Posts</p>
        ) : (
          <div className="space-y-3">
            {scheduledPosts.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{post.title}</h4>
                  <p className="text-sm text-gray-600">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(post.scheduledFor).toLocaleString('de-DE')}
                  </p>
                </div>
                <button
                  onClick={() => produceAndUpload(post)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={() => deleteScheduled(post.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} />
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
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="text-blue-600" />Veröffentlichte Videos
      </h2>
      {published.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Noch keine Videos veröffentlicht</p>
      ) : (
        <div className="space-y-4">
          {published.map(video => (
            <div key={video.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition">
              {video.imageUrl && (
                <img src={video.imageUrl} alt={video.title} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{video.hook}</p>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Eye size={14} className="text-blue-500" />{video.views || 0} Views
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    ❤️ {video.likes || 0} Likes
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${
                    video.status === 'published' ? 'text-green-600' : 
                    video.status === 'processing' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {video.status === 'published' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {video.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === PROFIL TAB ===
function ProfilTab({ userProfile }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="text-blue-600" />Account Status
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-4">Mitgliedschaft</h3>
            {userProfile.tier === 'pro' ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl">
                <Crown className="text-white" size={32} />
                <div>
                  <p className="font-bold text-white">PRO Member</p>
                  <p className="text-sm text-white/90">Unlimited Credits</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-gray-600 text-sm mb-1">Free Tier</p>
                  <p className="text-3xl font-bold text-blue-600">{userProfile.creditsRemaining}</p>
                  <p className="text-sm text-gray-500">Credits verbleibend</p>
                </div>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
                  <Crown size={20} />Upgrade zu PRO - 9,99€/Monat
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-4">Statistiken</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                <span className="text-gray-600">Videos produziert</span>
                <span className="text-2xl font-bold text-blue-600">{userProfile.videosProduced}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                <span className="text-gray-600">Gesamt Views</span>
                <span className="text-2xl font-bold text-blue-600">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                <span className="text-gray-600">Gesamt Likes</span>
                <span className="text-2xl font-bold text-blue-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

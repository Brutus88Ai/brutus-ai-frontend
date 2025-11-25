import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Loader, Zap, AlertCircle, Settings, TrendingUp, Play, 
  Pause, BarChart3, User, Crown, Plus, Trash2, Eye,
  Upload, Download, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, getDocs, getDoc,
  query, where, orderBy, onSnapshot, deleteDoc, updateDoc, serverTimestamp, addDoc
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
  const [activeTab, setActiveTab] = useState('trends');
  
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Tech');
  const [concepts, setConcepts] = useState([]);
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotQueue, setAutoPilotQueue] = useState([]);
  const [currentProduction, setCurrentProduction] = useState(null);
  
  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const [userProfile, setUserProfile] = useState({ tier: 'free', videosProduced: 0, creditsRemaining: 10 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const autoPilotInterval = useRef(null);

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
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data());
      }

      const draftsSnap = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/drafts`));
      setDrafts(draftsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const publishedSnap = await getDocs(
        query(collection(db, `artifacts/${appId}/users/${userId}/published`), orderBy('publishedAt', 'desc'))
      );
      setPublished(publishedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const analyzeTrends = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }
    if (userProfile.creditsRemaining <= 0 && userProfile.tier === 'free') {
      alert('No credits remaining. Upgrade to Pro!');
      return;
    }

    setAnalyzingTrends(true);
    try {
      const response = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category })
      });

      if (!response.ok) throw new Error('Failed to analyze trends');

      const data = await response.json();
      
      const conceptsWithImages = await Promise.all(
        data.concepts.map(async (concept) => {
          try {
            const imgResponse = await fetch('/api/generate-thumbnail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: concept.visualPrompt })
            });
            const imgData = await imgResponse.json();
            return { ...concept, imageUrl: imgData.imageUrl, id: Date.now() + Math.random() };
          } catch (error) {
            return { ...concept, imageUrl: null, id: Date.now() + Math.random() };
          }
        })
      );

      setConcepts(conceptsWithImages);
      
      if (userProfile.tier === 'free') {
        const newCredits = Math.max(0, userProfile.creditsRemaining - 1);
        setUserProfile(prev => ({ ...prev, creditsRemaining: newCredits }));
        if (user && db) {
          await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data'), {
            ...userProfile,
            creditsRemaining: newCredits
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Trend analysis error:', error);
      alert('Failed to analyze trends. Please try again.');
    } finally {
      setAnalyzingTrends(false);
    }
  };

  const saveDraft = async (concept) => {
    if (!user || !db) return;
    try {
      const draftRef = await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/drafts`), {
        ...concept,
        savedAt: serverTimestamp(),
        status: 'draft'
      });
      setDrafts(prev => [...prev, { id: draftRef.id, ...concept, status: 'draft' }]);
      alert('Saved as draft!');
    } catch (error) {
      console.error('Save draft error:', error);
    }
  };

  const deleteDraft = async (draftId) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/drafts`, draftId));
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (error) {
      console.error('Delete draft error:', error);
    }
  };

  const produceVideo = async (concept) => {
    if (userProfile.creditsRemaining <= 0 && userProfile.tier === 'free') {
      alert('No credits remaining. Upgrade to Pro!');
      return;
    }

    try {
      const response = await fetch('/api/trigger-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, imageUrl: concept.imageUrl, userId: user?.uid })
      });

      if (!response.ok) throw new Error('Production failed');

      const data = await response.json();

      if (user && db) {
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/published`), {
          ...concept,
          productionId: data.productionId,
          publishedAt: serverTimestamp(),
          status: 'processing',
          views: 0,
          likes: 0
        });
      }

      const newCredits = userProfile.tier === 'free' ? Math.max(0, userProfile.creditsRemaining - 1) : userProfile.creditsRemaining;
      const newCount = userProfile.videosProduced + 1;
      setUserProfile(prev => ({ ...prev, creditsRemaining: newCredits, videosProduced: newCount }));
      
      if (user && db) {
        await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data'), {
          creditsRemaining: newCredits,
          videosProduced: newCount
        }, { merge: true });
      }

      alert('Video production started!');
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Production error:', error);
      alert('Failed to start production');
    }
  };

  const startAutoPilot = () => {
    if (concepts.length === 0) {
      alert('Generate concepts first!');
      return;
    }
    
    setAutoPilotActive(true);
    setAutoPilotQueue([...concepts]);
    
    autoPilotInterval.current = setInterval(async () => {
      setAutoPilotQueue(queue => {
        if (queue.length === 0) {
          stopAutoPilot();
          return [];
        }
        
        const [next, ...rest] = queue;
        setCurrentProduction(next);
        
        produceVideo(next).then(() => {
          setTimeout(() => setCurrentProduction(null), 2000);
        });
        
        return rest;
      });
    }, 10000);
  };

  const stopAutoPilot = () => {
    setAutoPilotActive(false);
    if (autoPilotInterval.current) {
      clearInterval(autoPilotInterval.current);
      autoPilotInterval.current = null;
    }
    setAutoPilotQueue([]);
    setCurrentProduction(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="animate-spin text-purple-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-purple-400" size={32} />
            <h1 className="text-2xl font-bold">BrutusAI Pilot</h1>
          </div>
          <div className="flex items-center gap-4">
            {userProfile.tier === 'pro' ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                <Crown size={16} />
                <span className="text-sm font-bold">PRO</span>
              </div>
            ) : (
              <div className="text-sm">
                <span className="text-gray-400">Credits: </span>
                <span className="font-bold text-purple-400">{userProfile.creditsRemaining}</span>
              </div>
            )}
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-lg transition">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'trends', label: 'Trend Spy', icon: TrendingUp },
              { id: 'planner', label: 'Content Planner', icon: BarChart3 },
              { id: 'tracking', label: 'Tracking', icon: Eye },
              { id: 'profile', label: 'Profile', icon: User }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id ? 'border-purple-400 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'trends' && (
          <TrendSpyTab
            topic={topic} setTopic={setTopic} category={category} setCategory={setCategory}
            analyzeTrends={analyzeTrends} analyzing={analyzingTrends} concepts={concepts}
            saveDraft={saveDraft} produceVideo={produceVideo}
            autoPilotActive={autoPilotActive} startAutoPilot={startAutoPilot} stopAutoPilot={stopAutoPilot}
            currentProduction={currentProduction} queueLength={autoPilotQueue.length}
          />
        )}
        {activeTab === 'planner' && <ContentPlannerTab drafts={drafts} deleteDraft={deleteDraft} produceVideo={produceVideo} />}
        {activeTab === 'tracking' && <TrackingTab published={published} />}
        {activeTab === 'profile' && <ProfileTab userProfile={userProfile} onUpgrade={() => setShowPaymentModal(true)} />}
      </main>

      {showPaymentModal && <GooglePayModal onClose={() => setShowPaymentModal(false)} user={user} onSuccess={async () => {
        setUserProfile(prev => ({ ...prev, tier: 'pro', creditsRemaining: 999999 }));
        if (user && db) {
          await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data'), {
            tier: 'pro',
            creditsRemaining: 999999
          }, { merge: true });
        }
        setShowPaymentModal(false);
        alert('Welcome to PRO! You now have unlimited credits.');
      }} />}
    </div>
  );
}

function TrendSpyTab({ topic, setTopic, category, setCategory, analyzeTrends, analyzing, concepts, saveDraft, produceVideo, autoPilotActive, startAutoPilot, stopAutoPilot, currentProduction, queueLength }) {
  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-400" />
          Analyze Viral Trends
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., AI, Crypto, Fitness" className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-400 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-400 outline-none">
              <option value="Tech">Tech</option>
              <option value="Finance">Finance</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
        </div>

        <button onClick={analyzeTrends} disabled={analyzing} className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {analyzing ? <><Loader className="animate-spin" size={20} />Analyzing...</> : <><TrendingUp size={20} />Analyze Trends</>}
        </button>
      </div>

      {concepts.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Zap className="text-orange-400" />
              Auto-Pilot Mode
            </h3>
            <p className="text-sm text-gray-300 mb-4">Automatically produce all concepts. One video every 10 seconds.</p>
            
            {currentProduction && (
              <div className="mb-4 p-3 bg-black/40 rounded-lg">
                <p className="text-sm text-gray-400">Currently producing:</p>
                <p className="font-bold text-purple-400">{currentProduction.title}</p>
              </div>
            )}

            {autoPilotActive && <div className="mb-4 text-sm text-gray-400">Queue: <span className="text-purple-400 font-bold">{queueLength}</span> videos</div>}

            <button onClick={autoPilotActive ? stopAutoPilot : startAutoPilot} className={`w-full px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${autoPilotActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'}`}>
              {autoPilotActive ? <><Pause size={20} />Stop Auto-Pilot</> : <><Play size={20} />Start Auto-Pilot</>}
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {concepts.map((concept, idx) => (
              <div key={concept.id || idx} className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden hover:border-purple-400 transition">
                {concept.imageUrl && <img src={concept.imageUrl} alt={concept.title} className="w-full h-48 object-cover" />}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg">{concept.title}</h3>
                  <p className="text-sm text-gray-400">{concept.hook}</p>
                  <div className="flex flex-wrap gap-2">
                    {concept.tags?.map((tag, i) => <span key={i} className="px-2 py-1 bg-purple-500/20 rounded text-xs">#{tag}</span>)}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => saveDraft(concept)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-sm flex items-center justify-center gap-2">
                      <Plus size={16} />Save Draft
                    </button>
                    <button onClick={() => produceVideo(concept)} className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 rounded-lg transition text-sm font-bold flex items-center justify-center gap-2">
                      <Play size={16} />Produce
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ContentPlannerTab({ drafts, deleteDraft, produceVideo }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Content Planner</h2>
      {drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No drafts yet. Save concepts from Trend Spy!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              {draft.imageUrl && <img src={draft.imageUrl} alt={draft.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
              <h3 className="font-bold mb-2">{draft.title}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{draft.hook}</p>
              <div className="flex gap-2">
                <button onClick={() => produceVideo(draft)} className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-bold hover:scale-105 transition">Produce</button>
                <button onClick={() => deleteDraft(draft.id)} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackingTab({ published }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Published Videos</h2>
      {published.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Eye size={48} className="mx-auto mb-4 opacity-50" />
          <p>No published videos yet. Start producing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {published.map(video => (
            <div key={video.id} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 flex gap-4">
              {video.imageUrl && <img src={video.imageUrl} alt={video.title} className="w-32 h-32 object-cover rounded-lg" />}
              <div className="flex-1">
                <h3 className="font-bold mb-1">{video.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{video.hook}</p>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1"><Eye size={14} className="text-purple-400" />{video.views || 0} views</span>
                  <span className="flex items-center gap-1">❤️ {video.likes || 0} likes</span>
                  <span className={`flex items-center gap-1 ${video.status === 'published' ? 'text-green-400' : video.status === 'processing' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {video.status === 'published' ? <CheckCircle size={14} /> : video.status === 'processing' ? <Clock size={14} /> : <XCircle size={14} />}
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

function ProfileTab({ userProfile, onUpgrade }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold mb-4">Account Tier</h3>
          {userProfile.tier === 'pro' ? (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <Crown className="text-yellow-400" size={32} />
              <div>
                <p className="font-bold text-yellow-400">PRO Member</p>
                <p className="text-sm text-gray-300">Unlimited credits</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-gray-400">Free Tier</p>
                <p className="text-2xl font-bold text-purple-400">{userProfile.creditsRemaining} credits</p>
              </div>
              <button onClick={onUpgrade} className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold hover:scale-105 transition flex items-center justify-center gap-2">
                <Crown size={20} />Upgrade to PRO - 9,99€/month
              </button>
            </div>
          )}
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-400">Videos Produced</span><span className="font-bold text-purple-400">{userProfile.videosProduced}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Views</span><span className="font-bold text-purple-400">0</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Likes</span><span className="font-bold text-purple-400">0</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GooglePayModal({ onClose, user, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    // Load Google Pay API
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => {
      initGooglePay();
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initGooglePay = () => {
    if (typeof google === 'undefined' || !google.payments) return;

    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST' // Change to 'PRODUCTION' for live
    });

    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        }
      }]
    };

    paymentsClient.isReadyToPay(isReadyToPayRequest)
      .then(response => {
        if (response.result) {
          setPaymentReady(true);
        }
      })
      .catch(err => console.error('Google Pay init error:', err));
  };

  const handleGooglePay = async () => {
    if (typeof google === 'undefined' || !google.payments) {
      alert('Google Pay not available');
      return;
    }

    setProcessing(true);

    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST'
    });

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleMerchantId'
          }
        }
      }],
      merchantInfo: {
        merchantName: 'BrutusAI Pilot',
        merchantId: '12345678901234567890'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: '9.99',
        currencyCode: 'EUR',
        countryCode: 'DE'
      }
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      console.log('Payment successful:', paymentData);
      
      // In production, send paymentData to your backend for verification
      await onSuccess();
    } catch (err) {
      console.error('Payment failed:', err);
      setProcessing(false);
      if (err.statusCode !== 'CANCELED') {
        alert('Payment failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XCircle size={24} />
        </button>

        <div className="text-center mb-6">
          <Crown className="text-yellow-400 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold mb-2">Upgrade to PRO</h2>
          <p className="text-gray-400">Unlock unlimited video production</p>
        </div>

        <div className="bg-black/40 rounded-xl p-6 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">PRO Subscription</span>
            <span className="text-2xl font-bold text-purple-400">9,99€</span>
          </div>
          <div className="text-sm text-gray-400 space-y-2">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" />Unlimited credits</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" />Unlimited video production</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" />Priority support</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" />Early access to new features</div>
          </div>
        </div>

        {paymentReady ? (
          <button 
            onClick={handleGooglePay}
            disabled={processing}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {processing ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <>
                <svg viewBox="0 0 50 20" className="h-5">
                  <path fill="#4285F4" d="M19.7 10c0-.6-.1-1.2-.2-1.8H10v3.4h5.4c-.2 1.2-1 2.2-2.1 2.9v2.2h3.4c2-1.8 3-4.5 3-6.7z"/>
                  <path fill="#34A853" d="M10 20c2.8 0 5.1-1 6.8-2.6l-3.4-2.6c-1 .6-2.2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H.8v2.7C2.5 18 6 20 10 20z"/>
                  <path fill="#FBBC04" d="M4.4 12.1c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V5.4H.8C.3 6.4 0 7.7 0 9s.3 2.6.8 3.7l3.6-2.6z"/>
                  <path fill="#EA4335" d="M10 4c1.5 0 2.8.5 3.9 1.5l2.9-2.9C15.1 1 12.8 0 10 0 6 0 2.5 2 .8 5.4l3.6 2.7C5.2 5.8 7.4 4 10 4z"/>
                </svg>
                Pay with Google Pay
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <Loader className="animate-spin mx-auto mb-2" size={24} />
            Loading Google Pay...
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Google Pay. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

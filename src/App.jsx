import React, { useState, useEffect, useCallback } from 'react';
import { Loader, Zap, AlertCircle, Settings, List, Video, X, Lock, Play, Layout, UploadCloud, TrendingUp, CheckCircle, Trash2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// --- KONFIGURATION ---

// HINWEIS: Für Vercel/Netlify später diesen Block aktivieren (Kommentare entfernen):
/*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
*/

// AKTIV (Für Editor):
let firebaseConfig = {};
let firebaseInitError = null;
try {
    const serializedConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    firebaseConfig = JSON.parse(serializedConfig);
} catch (error) {
    firebaseInitError = error;
    console.error('Firebase-Konfiguration konnte nicht geparst werden.', error);
    firebaseConfig = {};
}

let app = null;
let auth = null;
let db = null;
try {
    if (firebaseConfig && typeof firebaseConfig === 'object' && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        firebaseInitError = firebaseInitError || new Error('Firebase-Konfiguration unvollständig. Bitte VITE_FIREBASE_CONFIG prüfen.');
        console.error('Firebase-Konfiguration unvollständig. Bitte VITE_FIREBASE_CONFIG prüfen.');
    }
} catch (error) {
    firebaseInitError = error;
    console.error('Firebase-Initialisierung fehlgeschlagen.', error);
    app = null;
    auth = null;
    db = null;
}

// WICHTIG: App-ID säubern & Fallback, um Pfad-Fehler zu verhindern
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId ? rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'fallback-id';

// Hilfsfunktion für Umgebungsvariablen (Safe Mode)
const getEnv = (key) => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[key] !== 'undefined') {
            return import.meta.env[key];
        }
        if (typeof window !== 'undefined' && window.__env && typeof window.__env[key] !== 'undefined') {
            return window.__env[key];
        }
        if (typeof process !== 'undefined' && process.env && typeof process.env[key] !== 'undefined') {
            return process.env[key];
        }
    } catch (error) {
        console.warn(`Env lookup für ${key} fehlgeschlagen`, error);
    }
    return '';
};

const apiKey = getEnv('VITE_GEMINI_API_KEY') || '';

// --- HELPER FUNCTIONS ---

const getGeminiUrl = (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`;

// Verbesserter Parser (Jules' Optimierung): Sucht gezielt nach Arrays
const parseJsonSafe = (text) => {
    if (!text) return [];
    try {
        // Suche nach dem ersten '[' und dem letzten ']'
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonStr = text.substring(firstBracket, lastBracket + 1);
            return JSON.parse(jsonStr);
        }
        return [];
    } catch (e) { console.warn("JSON Parse Error", e); return []; }
};

const triggerAutomation = async (data) => {
    const webhookUrl = getEnv('VITE_MAKE_WEBHOOK_URL');
    if (!webhookUrl) return true; // Simuliere Erfolg wenn keine URL da ist
    try {
        await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return true;
    } catch (e) { return false; }
};

// --- HOOKS ---

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        if (!auth) {
            setIsAuthReady(true);
            return () => {};
        }
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try { await signInWithCustomToken(auth, __initial_auth_token); } 
                catch (e) { await signInAnonymously(auth); }
            } else { await signInAnonymously(auth); }
        };
        initAuth();
        return onAuthStateChanged(auth, (u) => { setUser(u); setIsAuthReady(true); });
    }, []);
    return { user, isAuthReady };
};

const useFirestore = (userId, appId) => {
    const [promptsData, setPromptsData] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [userProfile, setUserProfile] = useState({ name: 'User', avatar: '', plan: 'free' });
    const [isProSubscriber, setIsProSubscriber] = useState(false);

    useEffect(() => {
        if (!db || !userId || !appId) return;

        // Fehler-abfangende Listener
        try {
            const unsubPrompts = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/prompts`), (snap) => {
                let allPrompts = [];
                snap.forEach(doc => {
                    const data = doc.data();
                    if(data.prompts && Array.isArray(data.prompts)) allPrompts = [...allPrompts, ...data.prompts];
                });
                setPromptsData(allPrompts.slice(0, 12)); 
            }, err => console.log("Prompts Silent Fail"));

            const unsubUploads = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/uploads`), (snap) => {
                const list = [];
                snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
                list.sort((a,b) => (b.uploadDate?.seconds || 0) - (a.uploadDate?.seconds || 0));
                setUploads(list);
            }, err => console.log("Uploads Silent Fail"));

            const unsubProfile = onSnapshot(doc(db, `artifacts/${appId}/users/${userId}/profile`, 'main'), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserProfile(data); setIsProSubscriber(data.plan === 'pro');
                } else {
                    const defaultProfile = { name: 'Creator', avatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${userId}`, plan: 'free' };
                    setUserProfile(defaultProfile);
                    setDoc(doc(db, `artifacts/${appId}/users/${userId}/profile`, 'main'), defaultProfile).catch(e => {});
                }
            }, err => console.log("Profile Silent Fail"));

            return () => { unsubPrompts(); unsubUploads(); unsubProfile(); };
        } catch (e) { console.error("Firestore Init Error", e); }
    }, [userId, appId]);

    return { promptsData, uploads, userProfile, isProSubscriber };
};

// --- KOMPONENTEN ---

const Toast = ({ message, type, onClose }) => (
    <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-green-200 text-gray-800'}`}>
        {type === 'error' ? <AlertCircle size={20} className="text-red-500"/> : <CheckCircle size={20} className="text-green-500"/>}
        <span className="font-bold text-sm">{String(message)}</span>
        <button onClick={onClose}><X size={16} className="opacity-50 hover:opacity-100"/></button>
    </div>
);

const TrendSpy = ({ isAnalyzing, onAnalyze, autoPilotMode }) => {
    const [input, setInput] = useState('');
    return (
        <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg transition-all ${autoPilotMode ? 'ring-4 ring-green-400 scale-[1.01]' : ''}`}>
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <TrendingUp className={autoPilotMode ? 'animate-bounce' : ''} /> 
                {autoPilotMode ? 'Auto-Pilot Active' : 'Trend Spy AI'}
            </h3>
            <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Thema (z.B. Tech)..." className="flex-1 bg-white/20 border border-white/30 text-white placeholder-indigo-200 rounded-xl px-4 py-3 backdrop-blur-sm focus:outline-none"/>
                <button disabled={isAnalyzing} onClick={() => onAnalyze(input)} className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 disabled:opacity-50">
                    {isAnalyzing ? <Loader className="animate-spin"/> : 'Scannen'}
                </button>
            </div>
        </div>
    );
};

const StrategyInput = ({ initialValue, isGenerating, onGenerate }) => {
    const [val, setVal] = useState(initialValue);
    useEffect(() => setVal(initialValue), [initialValue]);
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 h-full flex flex-col">
            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Settings size={16}/> Strategie</h4>
            <textarea className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none" value={val} onChange={(e) => setVal(e.target.value)} placeholder="Fokus..."/>
            <button onClick={() => onGenerate(val)} className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-black" disabled={isGenerating}>
                {isGenerating ? 'Generiere...' : 'Strategie Update'}
            </button>
        </div>
    );
};

const UploadItem = ({ upload, onUpdateStats }) => (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-16 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={upload.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 text-center font-bold">{upload.platform}</div>
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 truncate text-sm">{String(upload.prompt || 'Unbekannt')}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded-full font-bold ${upload.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : upload.status === 'AUTO_PUBLISH' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{upload.status}</span>
                <span>{upload.uploadDate?.toDate ? upload.uploadDate.toDate().toLocaleDateString() : '...'}</span>
            </div>
        </div>
        <button onClick={() => onUpdateStats(upload)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><TrendingUp size={18} /></button>
    </div>
);

const ContentPlaner = ({ uploads, onUpdateStatus, onDelete }) => {
    const drafts = uploads.filter(u => u.status === 'DRAFT');
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700">Entwürfe ({drafts.length})</h3>
            {drafts.length === 0 ? <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed text-gray-400 text-sm">Keine Entwürfe.</div> : (
                <div className="grid gap-3">
                    {drafts.map(upload => (
                        <div key={upload.id} className="bg-white p-3 rounded-xl border flex items-center gap-3 group">
                             <img src={upload.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                             <div className="flex-1 overflow-hidden"><p className="text-xs font-bold truncate">{String(upload.prompt || 'Fehler')}</p></div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onUpdateStatus(upload.id, 'COMPLETED')} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"><CheckCircle size={14}/></button>
                                <button onClick={() => onDelete(upload.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- APP ---

const App = () => {
    const { user, isAuthReady } = useAuth();
    const userId = user?.uid;
    const { promptsData, uploads, userProfile, isProSubscriber } = useFirestore(userId, appId);

    const [toast, setToast] = useState(null);
    const [userApiKey, setUserApiKey] = useState(localStorage.getItem('brutus_api_key') || '');
    const [generatedImages, setGeneratedImages] = useState({});
    const [currentTab, setCurrentTab] = useState('ki-prompts');
    const [studioMode, setStudioMode] = useState('auto');
    const [trendInputTrigger, setTrendInputTrigger] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [customImage, setCustomImage] = useState(null);
    const [autoPilotMode, setAutoPilotMode] = useState(false);
    const [autoPilotState, setAutoPilotState] = useState('idle'); 
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState(null);
    const [showCryptoModal, setShowCryptoModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPromptForAction, setSelectedPromptForAction] = useState(null);
    const [generatingState, setGeneratingState] = useState({});

    if (firebaseInitError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-red-200 text-center px-6">
                <h1 className="text-2xl font-black mb-3">Firebase-Initialisierung fehlgeschlagen</h1>
                <p className="max-w-md text-sm opacity-80">{String(firebaseInitError.message || firebaseInitError)}</p>
                <p className="mt-4 text-xs text-red-300">Bitte prüfen Sie die build-time Variable VITE_FIREBASE_CONFIG im Vercel Dashboard.</p>
            </div>
        );
    }

    if (!app || !auth || !db) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-red-200 text-center px-6">
                <h1 className="text-2xl font-black mb-3">Firebase-Konfiguration fehlt</h1>
                <p className="max-w-md text-sm opacity-80">Die App konnte keine Verbindung zu Firebase herstellen. Bitte setzen Sie VITE_FIREBASE_CONFIG, VITE_APP_ID und starten Sie das Deployment neu.</p>
            </div>
        );
    }

    const showToast = useCallback((msg, type='success') => { setToast({message: String(msg), type}); setTimeout(() => setToast(null), 4000); }, []);
    const getActiveApiKey = () => userApiKey || apiKey || getEnv('VITE_GEMINI_API_KEY');

    const handleImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (index === 'custom') {
                setCustomImage(url);
            } else {
                setGeneratedImages(prev => ({ ...prev, [index]: url }));
            }
        }
    };

    const generateBasePrompts = useCallback(async (inputTopic) => {
        setGeneratingState(prev => ({...prev, type: 'text'}));
        const fallbackData = [{ trend: "AI Revolution", prompt: "A futuristic city with flying cars and neon lights, cinematic 4k" }];
        try {
            const activeKey = userApiKey || apiKey || getEnv('VITE_GEMINI_API_KEY');
            if (!activeKey) {
                if (db && userId) {
                    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/prompts`, `batch_${Date.now()}`), { prompts: fallbackData, timestamp: new Date().toISOString(), source: 'fallback-no-api-key' });
                }
                setGeneratedImages({});
                showToast("Kein API-Key – Standardideen genutzt", "error");
                setGeneratingState(prev => ({ ...prev, type: null }));
                return;
            }

            const res = await fetch(getGeminiUrl(activeKey), {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ contents: [{ parts: [{ text: `Analysiere Trend "${inputTopic || 'Viral'}". Erstelle 4 TikTok/Shorts Konzepte. JSON: [{"trend": "Titel", "prompt": "Visual description"}]` }] }] })
            });
            const data = await res.json();
            const newData = parseJsonSafe(data?.candidates?.[0]?.content?.parts?.[0]?.text);
            if (db && userId) await setDoc(doc(db, `artifacts/${appId}/users/${userId}/prompts`, `batch_${Date.now()}`), { prompts: (newData.length ? newData : fallbackData), timestamp: new Date().toISOString() });
            setGeneratedImages({}); showToast("Konzepte erstellt!", "success");
        } catch (e) { console.error(e); showToast("Fehler oder Offline", 'error'); }
        setGeneratingState(prev => ({...prev, type: null}));
    }, [userId, userApiKey, showToast, db, appId]);

    // OPTIMIZED IMAGE GENERATION WITH TIMEOUT
    const generateImage = useCallback(async (prompt, index) => {
        setGeneratingState(p => ({ ...p, index, type: 'image' }));
        let success = false;
        try {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent((prompt || '').substring(0, 250))}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;

            await new Promise((resolve, reject) => {
                const img = new Image();
                const timeout = setTimeout(() => {
                    img.src = '';
                    reject(new Error('Timeout'));
                }, 15000); // 15s Timeout
                img.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Load Error'));
                };
                img.src = url;
            });

            if (index === 'custom') {
                setCustomImage(url);
            } else {
                setGeneratedImages(p => ({ ...p, [index]: url }));
            }
            showToast('Bild erstellt!', 'success');
            success = true;
        } catch (e) {
            console.error('Bildgenerierung fehlgeschlagen', e);
            showToast('Bildfehler / Timeout', 'error');
        } finally {
            setGeneratingState(p => ({ ...p, index: null, type: null }));
        }
        return success;
    }, [showToast]);

    const saveUpload = async (platformString, status = 'DRAFT') => {
        if(!db || !userId || !selectedPromptForAction) return;
        try {
                    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/uploads`), {
                        prompt: selectedPromptForAction.prompt,
                        imageUrl: selectedPromptForAction.image,
                        videoUrl: (selectedPromptForAction.videoUrl || null),
                        platform: platformString,
                        status: status,
                        uploadDate: serverTimestamp(),
                        caption: selectedPromptForAction.prompt.substring(0, 20) + "...",
                        performanceHistory: { initial: { views: 0, likes: 0, date: new Date().toISOString() } }
                    });
            showToast(status === 'DRAFT' ? "Als Idee gespeichert" : "Gespeichert!", 'success'); setShowVideoModal(false); setCurrentTab('planer');
        } catch(e) { showToast("Speicherfehler", 'error'); }
    };

    // Update status of an upload (used by ContentPlaner)
    const handleUpdateStatus = async (uploadId, newStatus) => {
        if (!db || !userId || !uploadId) return;
        try {
            await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/uploads`, uploadId), { status: newStatus });
            showToast('Status aktualisiert', 'success');
        } catch (e) { console.error('UpdateStatus Error', e); showToast('Update fehlgeschlagen', 'error'); }
    };

    // Delete an upload by id
    const handleDelete = async (uploadId) => {
        if (!db || !userId || !uploadId) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/uploads`, uploadId));
            showToast('Gelöscht', 'success');
        } catch (e) { console.error('Delete Error', e); showToast('Löschen fehlgeschlagen', 'error'); }
    };

    // Auto-Pilot
    useEffect(() => {
        if (!autoPilotMode || !db || !userId) {
            if (!autoPilotMode && autoPilotState !== 'idle') {
                setAutoPilotState('idle');
            }
            return;
        }

        if (!promptsData.length) {
            return;
        }

        let cancelled = false;

        const runAutoPilot = async () => {
            if (autoPilotState === 'generating' || autoPilotState === 'publishing') {
                return;
            }

            const target = promptsData[0];

            if (autoPilotState === 'idle') {
                if (!generatedImages[0]) {
                    setAutoPilotState('generating');
                    const success = await generateImage(target?.prompt, 0);
                    if (cancelled) {
                        return;
                    }
                    setAutoPilotState(success ? 'ready' : 'idle');
                    return;
                }
                setAutoPilotState('ready');
                return;
            }

            if (autoPilotState === 'ready') {
                setAutoPilotState('publishing');
                try {
                    const automationOk = await triggerAutomation({ prompt: target?.prompt, imageUrl: generatedImages[0], platform: 'TIKTOK' });
                    if (!automationOk) {
                        throw new Error('Automation webhook failed');
                    }
                    await addDoc(collection(db, `artifacts/${appId}/users/${userId}/uploads`), {
                        prompt: target?.prompt,
                        imageUrl: generatedImages[0],
                        platform: 'TIKTOK',
                        status: 'AUTO_PUBLISH',
                        uploadDate: serverTimestamp()
                    });
                    if (!cancelled) {
                        showToast('Published!', 'success');
                        setAutoPilotMode(false);
                        setAutoPilotState('idle');
                    }
                } catch (error) {
                    console.error('Auto-Pilot publish failed', error);
                    if (!cancelled) {
                        showToast('Auto-Pilot fehlgeschlagen', 'error');
                        setAutoPilotMode(false);
                        setAutoPilotState('idle');
                    }
                }
            }
        };

        const timer = setTimeout(() => {
            runAutoPilot().catch((error) => {
                console.error('Auto-Pilot unexpected error', error);
                if (!cancelled) {
                    showToast('Auto-Pilot Fehlfunktion', 'error');
                    setAutoPilotMode(false);
                    setAutoPilotState('idle');
                }
            });
        }, 1000);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [autoPilotMode, promptsData, generatedImages, autoPilotState, db, userId, generateImage, showToast, triggerAutomation]);

    // VIDEO GENERATION: generische Methode, die entweder einen realen Video-API-Endpunkt benutzt (VITE_VIDEO_API_URL)
    // oder simuliert, falls keine URL gesetzt ist. Gibt { success, url } zurück.
    const generateVideo = useCallback(async (prompt, imageUrl, apiUrlOverride) => {
        const envUrl = apiUrlOverride || getEnv('VITE_VIDEO_API_URL');
        const videoApi = envUrl || null;
        if (!videoApi) {
            // Simulierter Ablauf: warte kurz und gib die Bild-URL als Platzhalter zurück
            try { await new Promise(r => setTimeout(r, 1200)); } catch(e){}
            showToast('Video-Generierung simuliert (kein API-URL gesetzt)', 'success');
            return { success: true, url: imageUrl };
        }
        try {
            const resp = await fetch(videoApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, imageUrl }) });
            const data = await resp.json();
            if (data?.videoUrl) { showToast('Video bereit', 'success'); return { success: true, url: data.videoUrl }; }
            showToast('Video-API: keine Video-URL zurückgegeben', 'error');
            return { success: false };
        } catch (e) { console.error('Video-Error', e); showToast('Video-Generierung fehlgeschlagen', 'error'); return { success: false }; }
    }, [showToast]);

    if (!isAuthReady) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin w-10 h-10 text-indigo-600"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
            <header className="bg-white border-b sticky top-0 z-20 px-4 py-3 flex justify-between items-center shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-2 font-black text-xl text-indigo-700 tracking-tight"><Zap className="fill-current"/> BrutusAi</div>
                <div className="flex items-center gap-3">
                    <button onClick={() => { setAutoPilotMode(!autoPilotMode); if(!autoPilotMode) showToast("Auto-Pilot Started"); }} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${autoPilotMode ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-50 text-gray-500'}`}>
                        {autoPilotMode ? <Loader className="w-3 h-3 animate-spin"/> : <Play className="w-3 h-3"/>} {autoPilotMode ? 'Auto' : 'Start'}
                    </button>
                    <div className={`w-2.5 h-2.5 rounded-full ${getActiveApiKey() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><Settings size={20}/></button>
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm" onClick={() => setCurrentTab('profile')}><img src={userProfile.avatar} className="w-full h-full object-cover"/></div>
                </div>
            </header>

            {showSettings && (
                <div className="bg-gray-900 text-white p-6 fixed top-[60px] inset-x-0 z-30 shadow-xl border-b border-gray-700">
                    <h3 className="font-bold mb-4 flex items-center"><Lock size={16} className="mr-2"/> API Config</h3>
                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-green-400" type="password" value={userApiKey} onChange={e => { setUserApiKey(e.target.value); localStorage.setItem('brutus_api_key', e.target.value); }} placeholder="Gemini API Key..." />
                    <button onClick={() => setShowSettings(false)} className="w-full bg-white text-black py-2 rounded font-bold mt-4">Speichern</button>
                </div>
            )}

            <div className="max-w-6xl mx-auto mt-6 px-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border mb-6 gap-1">
                    {['ki-prompts', 'planer', 'uploads', 'profile'].map(id => (
                        <button key={id} onClick={() => setCurrentTab(id)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${currentTab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}>{id.toUpperCase()}</button>
                    ))}
                </div>

                {currentTab === 'ki-prompts' && (
                    <div className="space-y-6">
                        <div className="flex justify-center mb-2">
                            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                <button onClick={() => setStudioMode('auto')} className={`px-4 py-1 rounded-md text-sm font-bold ${studioMode === 'auto' ? 'bg-white shadow' : 'text-gray-400'}`}>Auto</button>
                                <button onClick={() => setStudioMode('manual')} className={`px-4 py-1 rounded-md text-sm font-bold ${studioMode === 'manual' ? 'bg-white shadow' : 'text-gray-400'}`}>Custom</button>
                            </div>
                        </div>
                        {studioMode === 'auto' ? (
                            <>
                                <TrendSpy isAnalyzing={generatingState.type === 'text'} onAnalyze={(t) => { setTrendInputTrigger(t); setTimeout(() => generateBasePrompts(t), 100); }} autoPilotMode={autoPilotMode} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1"><StrategyInput initialValue={trendInputTrigger} isGenerating={generatingState.type === 'text'} onGenerate={generateBasePrompts} /></div>
                                    <div className="md:col-span-2 space-y-4">
                                        {promptsData.map((item, i) => (
                                            <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 items-start">
                                                <div className="w-24 flex-shrink-0">
                                                    {generatedImages[i] ? <img src={generatedImages[i]} className="w-full rounded-lg shadow-sm cursor-pointer" onClick={() => {setSelectedPromptForAction({prompt: item.prompt, image: generatedImages[i]}); setShowVideoModal(true);}}/> : 
                                                    <button onClick={() => generateImage(item.prompt, i)} disabled={generatingState.index === i} className="w-full aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs border">{generatingState.index === i ? <Loader className="animate-spin"/> : 'BILD'}</button>}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded">{String(item.trend || 'Trend')}</span>
                                                    <p className="text-xs text-gray-600 mt-2 font-mono line-clamp-3">{String(item.prompt || '...')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border p-6">
                                <textarea className="w-full p-4 border rounded-xl bg-gray-50 text-sm h-32 mb-4" placeholder="Dein Prompt..." value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}/>
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => generateImage(customPrompt, 'custom')} disabled={!customPrompt} className="flex-1 bg-black text-white py-3 rounded-xl font-bold shadow">Generieren</button>
                                    <label className="px-4 border rounded-xl flex items-center justify-center cursor-pointer"><UploadCloud size={20}/><input type="file" hidden onChange={(e) => handleImageUpload(e, 'custom')}/></label>
                                </div>
                                {customImage && <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden max-w-xs mx-auto"><img src={customImage} className="w-full h-full object-contain"/><button onClick={() => { setSelectedPromptForAction({prompt: customPrompt, image: customImage}); setShowVideoModal(true); }} className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded shadow font-bold text-sm">Video</button></div>}
                            </div>
                        )}
                    </div>
                )}

                {currentTab === 'planer' && <ContentPlaner uploads={uploads} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />}
                {currentTab === 'uploads' && <div className="space-y-4">{uploads.filter(u => u.status !== 'DRAFT').map(u => <UploadItem key={u.id} upload={u} onUpdateStats={up => { setSelectedUpload(up); setShowStatsModal(true); }} />)}</div>}
                {currentTab === 'profile' && <div className="bg-white p-8 rounded-2xl border text-center shadow-sm max-w-md mx-auto mt-10"><img src={userProfile.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-100 shadow-inner"/><h2 className="font-black text-xl text-gray-800">{userProfile.name}</h2>{!isProSubscriber && <button onClick={() => setShowCryptoModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg mt-4">Upgrade</button>}</div>}
            </div>

            {showStatsModal && selectedUpload && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl space-y-4">
                        <h3 className="font-bold text-xl">Stats Update</h3>
                        <button onClick={async () => {
                            const h = selectedUpload.performanceHistory || {}; const l = Object.values(h).pop() || {views:0, likes:0};
                            await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/uploads`, selectedUpload.id), {
                                performanceHistory: {...h, [new Date().toISOString()]: {views: l.views + Math.floor(Math.random()*100), likes: l.likes + Math.floor(Math.random()*10), date: new Date().toISOString()}}
                            }); setShowStatsModal(false); showToast("Aktualisiert");
                        }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Simulieren</button>
                        <button onClick={() => setShowStatsModal(false)} className="w-full bg-gray-200 py-2 rounded-xl font-bold">Schließen</button>
                    </div>
                </div>
            )}

            {showVideoModal && selectedPromptForAction && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 relative">
                        <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4"><X size={20}/></button>
                        <h3 className="text-xl font-black flex items-center"><Video className="mr-2"/> Produktion</h3>
                        <div className="space-y-3">
                            <div className="border-2 border-indigo-100 p-4 rounded-xl hover:border-indigo-500 cursor-pointer" onClick={async () => { const ok = await triggerAutomation({ prompt: selectedPromptForAction.prompt, imageUrl: selectedPromptForAction.image, platform: "TIKTOK" }); if(ok) saveUpload('TIKTOK', 'AUTO_PUBLISH'); else showToast("Webhook Fehler", "error"); }}>
                                <h4 className="font-bold text-indigo-900 flex items-center"><Zap size={16} className="mr-2"/> Auto-Pilot</h4>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => saveUpload('TIKTOK', 'DRAFT')}>
                                <h4 className="font-bold text-gray-800">Als Idee speichern</h4>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={async () => {
                                // Video generieren: nutzt VITE_VIDEO_API_URL oder simuliert Ergebnis
                                                            // Prefer Vercel serverless proxy when available
                                                            const clientVideoUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VIDEO_API_URL) ? import.meta.env.VITE_VIDEO_API_URL : '/api/generate-video';
                                                            const res = await generateVideo(selectedPromptForAction.prompt, selectedPromptForAction.image, clientVideoUrl);
                                if (res.success) {
                                    // Speichere Upload mit videoUrl
                                    setSelectedPromptForAction(prev => ({ ...prev, videoUrl: res.url }));
                                    await saveUpload('TIKTOK', 'COMPLETED');
                                    setShowVideoModal(false);
                                }
                            }}>
                                <h4 className="font-bold text-gray-800">Video generieren</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCryptoModal && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"><div className="bg-white p-6 rounded-2xl text-center"><h3 className="font-bold mb-4">Pro Features</h3><button onClick={() => setShowCryptoModal(false)} className="bg-gray-200 px-4 py-2 rounded">Close</button></div></div>}
        </div>
    );
};

export default App;
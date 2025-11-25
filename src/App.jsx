import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TrendScout from "./pages/TrendScout";
import ContentEngine from "./pages/ContentEngine";
import Planner from "./pages/Planner";
import StatusMonitor from "./pages/StatusMonitor";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import BrutusAiPilotDashboard from "./BrutusAiPilotDashboard";
import NotFound from "./pages/NotFound";

// Firebase setup
let firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
} catch (error) {
  console.error('Firebase config parse error:', error);
}

let app, auth, db;
if (firebaseConfig?.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase init error:', error);
  }
}

export { auth, db };

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (auth) {
      signInAnonymously(auth).catch((error) => {
        console.error('Anonymous sign in error:', error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BrutusAiPilotDashboard />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trends" element={<TrendScout />} />
              <Route path="/content" element={<ContentEngine />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/status" element={<StatusMonitor />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

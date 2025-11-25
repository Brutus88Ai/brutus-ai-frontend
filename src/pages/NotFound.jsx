import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-cyan-400">404</h1>
        <p className="text-xl text-slate-300">Seite nicht gefunden</p>
        <p className="text-sm text-slate-400">Die angeforderte Seite existiert nicht.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition mt-4"
        >
          <Home size={18} />
          Zurück zum Dashboard
        </button>
      </div>
    </div>
  );
}

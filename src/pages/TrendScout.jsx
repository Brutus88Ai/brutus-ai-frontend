import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Search } from 'lucide-react';

const MOCK_TRENDS = [
  { id: 1, title: 'AI Tools 2024', volume: 500000, growth: 45, category: 'Technology', region: 'DE' },
  { id: 2, title: 'Social Media Marketing', volume: 320000, growth: 32, category: 'Marketing', region: 'DE' },
  { id: 3, title: 'Content Creation', volume: 280000, growth: 28, category: 'Creator Economy', region: 'DE' },
  { id: 4, title: 'Video Editing Apps', volume: 190000, growth: 25, category: 'Software', region: 'DE' },
  { id: 5, title: 'Instagram Growth', volume: 150000, growth: 22, category: 'Social Media', region: 'DE' },
  { id: 6, title: 'TikTok Strategies', volume: 140000, growth: 20, category: 'Social Media', region: 'DE' }
];

export default function TrendScout() {
  const [trends, setTrends] = useState(MOCK_TRENDS);
  const [selectedTrend, setSelectedTrend] = useState(null);

  const refreshTrends = () => {
    console.log('Refreshing trends...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Trend Scout</h2>
          <p className="text-sm text-slate-400">Entdecke aktuelle Trends und virale Themen für deinen Content.</p>
        </div>
        <button
          onClick={refreshTrends}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-sm"
        >
          <RefreshCw size={16} /> Trends aktualisieren
        </button>
      </div>

      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          placeholder="Trends suchen..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trends.map(trend => (
          <TrendCard
            key={trend.id}
            trend={trend}
            active={selectedTrend?.id === trend.id}
            onSelect={() => setSelectedTrend(trend)}
          />
        ))}
      </div>
    </div>
  );
}

function TrendCard({ trend, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`text-left bg-slate-950/60 border rounded-2xl p-5 transition space-y-3 ${
        active ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">{trend.title}</p>
          <p className="text-xs text-slate-400">{trend.category}</p>
        </div>
        <TrendingUp size={18} className="text-emerald-300" />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Suchvolumen: {(trend.volume / 1000).toFixed(0)}k+</span>
        <span className="text-emerald-300 font-semibold">+{trend.growth}%</span>
      </div>
      <button className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl text-sm py-2 text-cyan-200 hover:bg-slate-800 transition">
        Content erstellen
      </button>
    </button>
  );
}

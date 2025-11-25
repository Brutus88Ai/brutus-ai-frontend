import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Search, Sparkles, ArrowUpRight, Globe, Filter } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

  const refreshTrends = () => {
    setIsLoading(true);
    console.log('Refreshing trends...');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Trend Scout</h2>
              <p className="text-sm text-slate-400">Entdecke virale Themen in Echtzeit</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all duration-300">
            <Filter size={16} /> Filter
          </button>
          <button
            onClick={refreshTrends}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm font-medium text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Aktualisieren
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 group-hover:border-blue-500/50 rounded-xl px-4 py-3 transition-all duration-300">
          <Search size={18} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
          <input
            placeholder="Trends durchsuchen..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <Globe size={16} className="text-slate-500" />
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trends.map((trend, index) => (
          <TrendCard
            key={trend.id}
            trend={trend}
            active={selectedTrend?.id === trend.id}
            onSelect={() => setSelectedTrend(trend)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function TrendCard({ trend, active, onSelect, index }) {
  const getGrowthColor = (growth) => {
    if (growth >= 40) return 'from-green-500 to-emerald-500';
    if (growth >= 25) return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer bg-slate-800/30 border rounded-2xl p-6 transition-all duration-300 hover:scale-105 animate-fadeIn space-y-4 ${
        active ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-slate-700/50 hover:border-slate-600/50'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGrowthColor(trend.growth)} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">{trend.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{trend.category}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getGrowthColor(trend.growth)} flex items-center justify-center shadow-lg`}>
            <TrendingUp size={18} className="text-white" />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Suchvolumen</span>
            <span className="font-semibold text-slate-200">{(trend.volume / 1000).toFixed(0)}k+</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Wachstum</span>
            <span className={`font-bold bg-gradient-to-r ${getGrowthColor(trend.growth)} bg-clip-text text-transparent flex items-center gap-1`}>
              <ArrowUpRight size={12} />
              +{trend.growth}%
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-green-500 hover:to-emerald-600 border border-slate-600/50 hover:border-green-500/50 rounded-xl text-sm py-2.5 text-slate-300 hover:text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group/btn">
          <Sparkles size={14} className="group-hover/btn:animate-pulse" />
          Content erstellen
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Key, Zap, Shield, Mail } from 'lucide-react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');
  const [autoSettings, setAutoSettings] = useState({
    autoPosting: true,
    trendMonitoring: true,
    notifications: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/30">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Einstellungen</h1>
          <p className="text-slate-400 mt-1">
            Verwalte deine App-Konfiguration
          </p>
        </div>
      </div>

      {/* API Key Card */}
      <Card>
        <CardHeader title="API Schlüssel" icon={Key} gradient="from-cyan-500 to-blue-600" />
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-2 flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all duration-300"
                placeholder="AIza..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Aktuell verbunden mit Gemini 2.5-flash</p>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 transition-all duration-300">
            Speichern
          </button>
        </div>
      </Card>

      {/* Social Media Card */}
      <Card>
        <CardHeader title="Social Media Verbindungen" icon={User} gradient="from-purple-500 to-pink-600" />
        <div className="space-y-3">
          {[
            { platform: 'TikTok', color: 'from-pink-500 to-red-500', connected: false },
            { platform: 'Instagram', color: 'from-purple-500 to-pink-500', connected: false },
            { platform: 'Facebook', color: 'from-blue-500 to-cyan-500', connected: false }
          ].map(({ platform, color, connected }) => (
            <div key={platform} className="bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{platform}</p>
                  <p className="text-xs text-slate-400">{connected ? 'Verbunden' : 'Nicht verbunden'}</p>
                </div>
              </div>
              <button className={`text-xs px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                connected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-purple-500/50 hover:text-purple-400'
              }`}>
                {connected ? 'Trennen' : 'Verbinden'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Automation Card */}
      <Card>
        <CardHeader title="Automatisierungs-Einstellungen" icon={Zap} gradient="from-yellow-500 to-orange-600" />
        <div className="space-y-3">
          {[
            { key: 'autoPosting', label: 'Auto-Posting aktivieren', description: 'Posts automatisch veröffentlichen', icon: Zap },
            { key: 'trendMonitoring', label: 'Trend Monitoring', description: 'Automatische Trend-Erkennung', icon: Bell },
            { key: 'notifications', label: 'Benachrichtigungen', description: 'Bei wichtigen Events benachrichtigen', icon: Mail }
          ].map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{label}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`h-7 w-14 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${
                  autoSettings[key] 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  autoSettings[key] ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Support Card */}
      <Card>
        <CardHeader title="Support & Hilfe" icon={Shield} gradient="from-green-500 to-emerald-600" />
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <p className="text-sm text-slate-200 font-semibold mb-2">Brauchst du Hilfe oder hast Fragen?</p>
            <p className="text-xs text-slate-400 mb-4">Unser Support-Team ist für dich da und antwortet innerhalb von 24 Stunden!</p>
            <a 
              href="mailto:brutusaiswebapp@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-green-500/30 transition-all duration-300"
            >
              <Mail size={16} />
              brutusaiswebapp@gmail.com
            </a>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs text-slate-400">💡 Durchschnittliche Antwortzeit: 24 Stunden</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:border-slate-600/50 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, gradient = "from-slate-500 to-slate-600" }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        {Icon && <Icon size={20} className="text-white" />}
      </div>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
    </div>
  );
}

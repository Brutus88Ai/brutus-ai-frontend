import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell } from 'lucide-react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="API Schlüssel" icon={SettingsIcon} />
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Google Gemini API Key</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              placeholder="AIza..."
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition">
            Speichern
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Social Media Verbindungen" icon={User} />
        <div className="space-y-3">
          {['TikTok', 'Instagram', 'Facebook'].map(platform => (
            <div key={platform} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{platform}</p>
                <p className="text-xs text-slate-400">Nicht verbunden</p>
              </div>
              <button className="text-xs px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                Verbinden
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Automatisierungs-Einstellungen" icon={Bell} />
        <div className="space-y-3">
          {[
            { label: 'Auto-Posting aktivieren', description: 'Posts automatisch veröffentlichen' },
            { label: 'Trend Monitoring', description: 'Automatische Trend-Erkennung' },
            { label: 'Benachrichtigungen', description: 'Bei wichtigen Events benachrichtigen' }
          ].map(toggle => (
            <div key={toggle.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{toggle.label}</p>
                <p className="text-xs text-slate-400">{toggle.description}</p>
              </div>
              <div className="h-6 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center p-1 cursor-pointer">
                <div className="h-4 w-4 rounded-full bg-cyan-500 translate-x-6 transition" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Support & Hilfe" icon={User} />
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-2">Brauchst du Hilfe oder hast Fragen?</p>
            <p className="text-xs text-slate-400 mb-4">Unser Support-Team ist für dich da!</p>
            <a 
              href="mailto:brutusaiswebapp@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition"
            >
              <Bell size={16} />
              brutusaiswebapp@gmail.com
            </a>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">💡 Durchschnittliche Antwortzeit: 24 Stunden</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-950/60 border border-slate-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={18} className="text-cyan-300" />}
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

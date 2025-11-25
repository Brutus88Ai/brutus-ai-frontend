import React from 'react';
import { RefreshCw, Upload, TrendingUp } from 'lucide-react';

export default function StatusMonitor() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatusStat title="Aktive Prozesse" value="2" accent="text-cyan-300" />
        <StatusStat title="Abgeschlossen" value="1" accent="text-emerald-300" />
        <StatusStat title="Wartend" value="1" accent="text-amber-300" />
        <StatusStat title="Fehler" value="0" accent="text-rose-300" />
      </div>

      <Card>
        <CardHeader title="Prozess-Übersicht" icon={RefreshCw} />
        <p className="text-sm text-slate-400">Keine laufenden Prozesse.</p>
      </Card>

      <Card>
        <CardHeader title="Upload Status" icon={Upload} />
        <p className="text-sm text-slate-400">Noch keine veröffentlichten Videos.</p>
      </Card>
    </div>
  );
}

function StatusStat({ title, value, accent }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
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

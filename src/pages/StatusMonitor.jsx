import React from 'react';
import { RefreshCw, Upload, TrendingUp, Activity, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';

export default function StatusMonitor() {
  const processes = [
    { id: 1, name: "Video Generierung", status: "running", progress: 75, time: "2 Min verbleibend" },
    { id: 2, name: "Trend Analyse", status: "completed", progress: 100, time: "Abgeschlossen" },
    { id: 3, name: "Content Upload", status: "waiting", progress: 0, time: "In Warteschlange" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Status Monitor</h1>
          <p className="text-slate-400 mt-1">
            Echtzeit-Überwachung aller Prozesse
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatusStat title="Aktive Prozesse" value="2" accent="from-cyan-500 to-blue-600" icon={RefreshCw} />
        <StatusStat title="Abgeschlossen" value="1" accent="from-green-500 to-emerald-600" icon={CheckCircle} />
        <StatusStat title="Wartend" value="1" accent="from-yellow-500 to-orange-600" icon={Clock} />
        <StatusStat title="Fehler" value="0" accent="from-red-500 to-rose-600" icon={AlertCircle} />
      </div>

      {/* Process Overview Card */}
      <Card>
        <CardHeader title="Prozess-Übersicht" icon={RefreshCw} />
        <div className="space-y-3">
          {processes.map((process) => (
            <ProcessItem key={process.id} process={process} />
          ))}
        </div>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Status */}
        <Card>
          <CardHeader title="Upload Status" icon={Upload} />
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-100">Heute hochgeladen</span>
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <div className="text-xs text-slate-400">Videos erfolgreich veröffentlicht</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-100">Geplante Uploads</span>
                <span className="text-2xl font-bold text-blue-400">5</span>
              </div>
              <div className="text-xs text-slate-400">Warten auf Veröffentlichung</div>
            </div>
          </div>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader title="Performance" icon={BarChart3} />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Generierungsgeschwindigkeit</span>
                <span className="font-semibold text-cyan-400">+25%</span>
              </div>
              <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 w-3/4 transition-all duration-1000" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Erfolgsquote</span>
                <span className="font-semibold text-green-400">98%</span>
              </div>
              <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 w-[98%] transition-all duration-1000" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">API Auslastung</span>
                <span className="font-semibold text-purple-400">62%</span>
              </div>
              <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 w-[62%] transition-all duration-1000" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProcessItem({ process }) {
  const getStatusColor = (status) => {
    if (status === 'running') return 'from-cyan-500 to-blue-600';
    if (status === 'completed') return 'from-green-500 to-emerald-600';
    if (status === 'waiting') return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'running') return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'waiting') return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getStatusColor(process.status)} flex items-center justify-center text-white`}>
            {getStatusIcon(process.status)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{process.name}</h3>
            <p className="text-xs text-slate-400">{process.time}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-cyan-400">{process.progress}%</span>
      </div>
      <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`h-full bg-gradient-to-r ${getStatusColor(process.status)} transition-all duration-500`}
          style={{ width: `${process.progress}%` }}
        />
      </div>
    </div>
  );
}

function StatusStat({ title, value, accent, icon: Icon }) {
  return (
    <div className="group relative bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{title}</p>
          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className={`text-4xl font-bold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>{value}</p>
      </div>
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

function CardHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
        {Icon && <Icon size={20} className="text-cyan-400" />}
      </div>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
    </div>
  );
}

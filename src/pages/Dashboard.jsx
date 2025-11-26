import { Card } from "@/components/ui/card";
import { TrendingUp, Video, Upload, CheckCircle, Sparkles, Calendar, BarChart3, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const stats = [
    {
      title: "Trends gescannt",
      value: "24",
      change: "+12%",
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: "up"
    },
    {
      title: "Videos erstellt",
      value: "8",
      change: "+4",
      icon: Video,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      trend: "up"
    },
    {
      title: "Posts geplant",
      value: "15",
      change: "+3",
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      trend: "up"
    },
    {
      title: "Erfolgreich gepostet",
      value: "12",
      change: "100%",
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      trend: "up"
    },
  ];

  const quickActions = [
    {
      title: "Trend Analysieren",
      description: "Finde virale Themen",
      icon: Sparkles,
      color: "from-blue-500 to-cyan-500",
      link: "/trends"
    },
    {
      title: "Content Erstellen",
      description: "AI-gestützter Content",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      link: "/content"
    },
    {
      title: "Post Planen",
      description: "Schedule deine Posts",
      icon: Calendar,
      color: "from-orange-500 to-red-500",
      link: "/planner"
    },
    {
      title: "Analytics",
      description: "Performance tracken",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      link: "/status"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Willkommen zurück! Hier ist deine Übersicht.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 via-slate-800/50 to-slate-900/80"></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.bgColor} ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={action.title}
              href={action.link}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-sm text-slate-400">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Letzte Aktivitäten
            </h2>
            <div className="space-y-3">
              {[
                { action: "Trend analysiert", item: "AI-Tools 2024", time: "vor 2h", color: "text-blue-400" },
                { action: "Video erstellt", item: "TikTok Marketing", time: "vor 4h", color: "text-purple-400" },
                { action: "Post geplant", item: "Instagram Reel", time: "vor 6h", color: "text-green-400" },
                { action: "Analytics gecheckt", item: "Performance Report", time: "vor 8h", color: "text-orange-400" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                    <div>
                      <p className="font-medium text-white">{activity.action}</p>
                      <p className="text-sm text-slate-400">{activity.item}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Nächste geplante Posts
            </h2>
            <div className="space-y-3">
              {[
                { platform: "TikTok", content: "Tutorial: AI Video Tools", time: "Heute, 18:00", color: "text-pink-400" },
                { platform: "Instagram", content: "Reel: Produktivitäts-Hacks", time: "Morgen, 12:00", color: "text-purple-400" },
                { platform: "Facebook", content: "Post: Social Media Trends", time: "Morgen, 15:00", color: "text-blue-400" },
                { platform: "YouTube", content: "Video: AI Content Creation", time: "Übermorgen, 10:00", color: "text-red-400" },
              ].map((post, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{post.platform}</p>
                      <p className="text-sm text-slate-400">{post.content}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-pink-400">{post.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

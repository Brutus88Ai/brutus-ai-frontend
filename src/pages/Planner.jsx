import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, TrendingUp, Target, CalendarCheck } from "lucide-react";

export default function Planner() {
  const scheduledPosts = [
    { day: "Montag", posts: [{ time: "12:00", platform: "TikTok", content: "Tutorial Video" }] },
    { day: "Dienstag", posts: [{ time: "18:00", platform: "Instagram", content: "Reel" }] },
    { day: "Mittwoch", posts: [{ time: "15:00", platform: "Facebook", content: "Story" }] },
    { day: "Donnerstag", posts: [{ time: "12:00", platform: "TikTok", content: "Trend Video" }] },
    { day: "Freitag", posts: [{ time: "10:00", platform: "Instagram", content: "Post" }] },
  ];

  const getPlatformColor = (platform) => {
    const colors = {
      TikTok: 'from-pink-500 to-red-500',
      Instagram: 'from-purple-500 to-pink-500',
      Facebook: 'from-blue-500 to-cyan-500'
    };
    return colors[platform] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Planer</h1>
            <p className="text-slate-400 mt-1">
              Verwalte deine Content-Strategie
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 rounded-xl transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Neuer Post
        </Button>
      </div>

      {/* Calendar Card */}
      <Card className="p-6 bg-slate-800/30 border-slate-700/50 shadow-xl hover:border-orange-500/30 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
            <CalendarCheck className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Wochenübersicht</h2>
            <p className="text-sm text-slate-400">KW 47 | Nov 2024</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scheduledPosts.map((day, i) => (
            <div
              key={i}
              className="group p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-orange-500/30 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-slate-100 mb-3 group-hover:text-orange-400 transition-colors">{day.day}</h3>
              <div className="space-y-2">
                {day.posts.map((post, j) => (
                  <div
                    key={j}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400 font-semibold">{post.time}</span>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-md bg-gradient-to-r ${getPlatformColor(post.platform)} text-white text-xs font-medium mb-2`}>
                      {post.platform}
                    </div>
                    <p className="text-xs text-slate-300">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Times */}
        <Card className="p-6 bg-slate-800/30 border-slate-700/50 shadow-xl hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Beste Posting-Zeiten</h2>
          </div>
          <div className="space-y-3">
            {[
              { platform: "TikTok", time: "12:00 - 15:00", engagement: "Hoch", color: "pink" },
              { platform: "Instagram", time: "18:00 - 21:00", engagement: "Sehr hoch", color: "purple" },
              { platform: "Facebook", time: "10:00 - 14:00", engagement: "Mittel", color: "blue" },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              >
                <div>
                  <p className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">{item.platform}</p>
                  <p className="text-sm text-slate-400">{item.time}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                    item.engagement === "Sehr hoch"
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400"
                      : item.engagement === "Hoch"
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400"
                      : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400"
                  }`}
                >
                  {item.engagement}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Posting Frequency */}
        <Card className="p-6 bg-slate-800/30 border-slate-700/50 shadow-xl hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Posting-Frequenz</h2>
          </div>
          <div className="space-y-4">
            {[
              { platform: "TikTok", posts: "2-3x täglich", status: "Optimal", percentage: 100 },
              { platform: "Instagram", posts: "1-2x täglich", status: "Gut", percentage: 75 },
              { platform: "Facebook", posts: "1x täglich", status: "Ausreichend", percentage: 50 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">{item.platform}</span>
                  <span className="text-xs text-slate-400 font-medium">{item.posts}</span>
                </div>
                <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      item.status === "Optimal"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : item.status === "Gut"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                        : "bg-gradient-to-r from-yellow-500 to-orange-600"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

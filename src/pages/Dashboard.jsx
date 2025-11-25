import { Card } from "@/components/ui/card";
import { TrendingUp, Video, Upload, CheckCircle } from "lucide-react";

const GEMINI_API_KEY = "AIzaSyAkjhVi57D95fNTT6PdLGKhE0S2eOZU7w0";

export default function Dashboard() {
  const stats = [
    {
      title: "Trends gescannt",
      value: "24",
      change: "+12%",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Videos erstellt",
      value: "8",
      change: "+4",
      icon: Video,
      color: "text-success",
    },
    {
      title: "Posts geplant",
      value: "15",
      change: "+3",
      icon: Upload,
      color: "text-warning",
    },
    {
      title: "Erfolgreich gepostet",
      value: "12",
      change: "100%",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen zurück! Hier ist deine Übersicht.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="p-6 bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Letzte Aktivitäten
          </h2>
          <div className="space-y-4">
            {[
              { action: "Trend analysiert", item: "AI-Tools 2024", time: "vor 2h" },
              { action: "Video erstellt", item: "TikTok Marketing", time: "vor 4h" },
              { action: "Post geplant", item: "Instagram Reel", time: "vor 6h" },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300"
              >
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Nächste geplante Posts
          </h2>
          <div className="space-y-4">
            {[
              { platform: "TikTok", content: "Tutorial: AI Video Tools", time: "Heute, 18:00" },
              { platform: "Instagram", content: "Reel: Produktivitäts-Hacks", time: "Morgen, 12:00" },
              { platform: "Facebook", content: "Post: Social Media Trends", time: "Morgen, 15:00" },
            ].map((post, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300"
              >
                <div>
                  <p className="font-medium text-foreground">{post.platform}</p>
                  <p className="text-sm text-muted-foreground">{post.content}</p>
                </div>
                <span className="text-xs text-primary">{post.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

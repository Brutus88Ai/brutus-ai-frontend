import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock } from "lucide-react";

const GEMINI_API_KEY = "AIzaSyAkjhVi57D95fNTT6PdLGKhE0S2eOZU7w0";

export default function Planner() {
  const scheduledPosts = [
    { day: "Montag", posts: [{ time: "12:00", platform: "TikTok", content: "Tutorial Video" }] },
    { day: "Dienstag", posts: [{ time: "18:00", platform: "Instagram", content: "Reel" }] },
    { day: "Mittwoch", posts: [{ time: "15:00", platform: "Facebook", content: "Story" }] },
    { day: "Donnerstag", posts: [{ time: "12:00", platform: "TikTok", content: "Trend Video" }] },
    { day: "Freitag", posts: [{ time: "10:00", platform: "Instagram", content: "Post" }] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Planer</h1>
          <p className="text-muted-foreground">
            Verwalte deine geplanten Posts und Posting-Zeiten.
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Neuer Post
        </Button>
      </div>

      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Wochenübersicht</h2>
            <p className="text-sm text-muted-foreground">KW 47 | Nov 2024</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scheduledPosts.map((day, i) => (
            <Card
              key={i}
              className="p-4 bg-secondary/50 border-border hover:shadow-glow transition-all duration-300"
            >
              <h3 className="font-semibold text-foreground mb-3">{day.day}</h3>
              <div className="space-y-2">
                {day.posts.map((post, j) => (
                  <div
                    key={j}
                    className="p-3 rounded-lg bg-card border border-border hover:border-primary transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary font-medium">{post.time}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{post.platform}</p>
                    <p className="text-xs text-muted-foreground mt-1">{post.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Beste Posting-Zeiten
          </h2>
          <div className="space-y-3">
            {[
              { platform: "TikTok", time: "12:00 - 15:00", engagement: "Hoch" },
              { platform: "Instagram", time: "18:00 - 21:00", engagement: "Sehr hoch" },
              { platform: "Facebook", time: "10:00 - 14:00", engagement: "Mittel" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium text-foreground">{item.platform}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.engagement === "Sehr hoch"
                      ? "bg-success/20 text-success"
                      : item.engagement === "Hoch"
                      ? "bg-primary/20 text-primary"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {item.engagement}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Posting-Frequenz
          </h2>
          <div className="space-y-4">
            {[
              { platform: "TikTok", posts: "2-3x täglich", status: "Optimal" },
              { platform: "Instagram", posts: "1-2x täglich", status: "Gut" },
              { platform: "Facebook", posts: "1x täglich", status: "Ausreichend" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.platform}</span>
                  <span className="text-xs text-muted-foreground">{item.posts}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.status === "Optimal"
                        ? "bg-gradient-success"
                        : item.status === "Gut"
                        ? "bg-gradient-primary"
                        : "bg-warning"
                    }`}
                    style={{
                      width: item.status === "Optimal" ? "100%" : item.status === "Gut" ? "75%" : "50%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

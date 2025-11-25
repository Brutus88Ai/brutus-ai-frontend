import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Sparkles, Copy } from "lucide-react";
import { useState } from "react";

const GEMINI_API_KEY = "AIzaSyAkjhVi57D95fNTT6PdLGKhE0S2eOZU7w0";

export default function ContentEngine() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Engine</h1>
        <p className="text-muted-foreground">
          Generiere virale Skripte und Video-Prompts basierend auf aktuellen Trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Input
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="trend" className="text-foreground">Trend / Keyword</Label>
              <Textarea
                id="trend"
                placeholder="z.B. 'AI Video Tools für TikTok'"
                className="mt-2 bg-secondary border-border focus:border-primary transition-all duration-300 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="style" className="text-foreground">Content-Stil</Label>
              <select
                id="style"
                className="w-full mt-2 p-2 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              >
                <option>Professional Marketing</option>
                <option>Casual & Friendly</option>
                <option>Educational</option>
                <option>Entertainment</option>
              </select>
            </div>

            <div>
              <Label htmlFor="platform" className="text-foreground">Ziel-Plattform</Label>
              <div className="flex gap-2 mt-2">
                {["TikTok", "Instagram", "Facebook"].map((platform) => (
                  <Button
                    key={platform}
                    variant="outline"
                    size="sm"
                    className="border-border hover:border-primary hover:text-primary transition-all duration-300"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {generating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generiere...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Content generieren
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generierter Content
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Video-Skript</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hook: "Du nutzt noch immer alte Video-Tools? Das ändert sich JETZT!"
                <br /><br />
                Main: Die besten AI-Tools für TikTok Creator in 2024. Schneller produzieren, 
                mehr Reichweite, weniger Aufwand. Diese 3 Tools brauchst du...
                <br /><br />
                CTA: "Speicher dieses Video für später und folge für mehr Tipps!"
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Video-Prompt</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modern content creator workspace, laptop showing AI video editing tools, 
                vibrant TikTok interface in background, professional lighting, 16:9 aspect ratio, 
                high-energy tech aesthetic
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {["#AITools", "#TikTokTips", "#ContentCreator", "#VideoMarketing"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Verbinde deine OpenAI API, um KI-generierten Content zu erstellen.
          </p>
          <Button variant="outline" className="border-border hover:border-primary transition-all duration-300">
            API-Schlüssel hinzufügen
          </Button>
        </div>
      </Card>
    </div>
  );
}

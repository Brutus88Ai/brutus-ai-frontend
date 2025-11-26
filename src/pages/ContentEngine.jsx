import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Sparkles, Copy, Zap, TrendingUp, Hash, Video } from "lucide-react";
import { useState } from "react";

export default function ContentEngine() {
  const [generating, setGenerating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("TikTok");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Content Engine</h1>
          <p className="text-slate-400 mt-1">Generiere virale Skripte mit KI in Sekunden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/30 border-slate-700/50 shadow-xl hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Input</h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="trend" className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-green-400" />
                Trend / Keyword
              </Label>
              <Textarea
                id="trend"
                placeholder="z.B. 'AI Video Tools für TikTok'"
                className="bg-slate-900/50 border-slate-700/50 focus:border-purple-500/50 text-slate-100 placeholder:text-slate-500 transition-all duration-300 min-h-[100px] rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="style" className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-yellow-400" />
                Content-Stil
              </Label>
              <select
                id="style"
                className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-100 focus:border-purple-500/50 focus:outline-none transition-all duration-300"
              >
                <option>Professional Marketing</option>
                <option>Casual & Friendly</option>
                <option>Educational</option>
                <option>Entertainment</option>
              </select>
            </div>

            <div>
              <Label className="text-slate-300 font-medium flex items-center gap-2 mb-3">
                <Video size={14} className="text-blue-400" />
                Ziel-Plattform
              </Label>
              <div className="flex gap-2">
                {["TikTok", "Instagram", "Facebook"].map((platform) => (
                  <Button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    variant="outline"
                    size="sm"
                    className={`border rounded-xl transition-all duration-300 ${
                      selectedPlatform === platform
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'border-slate-700/50 text-slate-400 hover:border-purple-500/30 hover:text-purple-400'
                    }`}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
            >
              {generating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generiere...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Content generieren
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50 shadow-xl hover:border-pink-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Generierter Content</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Video size={16} className="text-purple-400" />
                <h3 className="font-bold text-slate-100">Video-Skript</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="font-semibold text-pink-400">Hook:</span> "Du nutzt noch immer alte Video-Tools? Das ändert sich JETZT!"
                <br /><br />
                <span className="font-semibold text-purple-400">Main:</span> Die besten AI-Tools für TikTok Creator in 2024. Schneller produzieren, 
                mehr Reichweite, weniger Aufwand. Diese 3 Tools brauchst du...
                <br /><br />
                <span className="font-semibold text-blue-400">CTA:</span> "Speicher dieses Video für später und folge für mehr Tipps!"
              </p>
            </div>

            <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-400" />
                <h3 className="font-bold text-slate-100">Video-Prompt</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Modern content creator workspace, laptop showing AI video editing tools, 
                vibrant TikTok interface in background, professional lighting, 16:9 aspect ratio, 
                high-energy tech aesthetic
              </p>
            </div>

            <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Hash size={16} className="text-green-400" />
                <h3 className="font-bold text-slate-100">Hashtags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["#AITools", "#TikTokTips", "#ContentCreator", "#VideoMarketing"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-slate-300 font-medium mb-2">Gemini API verbunden</p>
            <p className="text-sm text-slate-500">Nutze die Kraft von Google Gemini 2.5-flash für Content-Generierung</p>
          </div>
          <Button variant="outline" className="border-slate-700/50 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 rounded-xl transition-all duration-300">
            API-Schlüssel aktualisieren
          </Button>
        </div>
      </Card>
    </div>
  );
}

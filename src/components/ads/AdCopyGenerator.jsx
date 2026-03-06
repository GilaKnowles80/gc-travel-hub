import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, Check, Loader2, RefreshCw } from "lucide-react";

const PLATFORMS = [
  { value: "facebook", label: "Facebook", emoji: "📘", maxChars: 125, headlineMax: 40 },
  { value: "instagram", label: "Instagram", emoji: "📸", maxChars: 150, headlineMax: 0 },
  { value: "tiktok", label: "TikTok", emoji: "🎵", maxChars: 150, headlineMax: 0 },
  { value: "x_twitter", label: "X (Twitter)", emoji: "🐦", maxChars: 280, headlineMax: 0 },
  { value: "google", label: "Google Ads", emoji: "🔍", maxChars: 90, headlineMax: 30 },
  { value: "pinterest", label: "Pinterest", emoji: "📌", maxChars: 500, headlineMax: 100 },
  { value: "reddit", label: "Reddit", emoji: "🤖", maxChars: 300, headlineMax: 300 },
  { value: "microsoft_bing", label: "Microsoft/Bing", emoji: "🪟", maxChars: 90, headlineMax: 30 },
  { value: "yahoo", label: "Yahoo", emoji: "🟣", maxChars: 90, headlineMax: 30 },
  { value: "discord", label: "Discord", emoji: "💬", maxChars: 200, headlineMax: 0 },
  { value: "opera", label: "Opera", emoji: "🔴", maxChars: 150, headlineMax: 50 },
  { value: "tumblr", label: "Tumblr", emoji: "📝", maxChars: 250, headlineMax: 0 },
  { value: "youtube", label: "YouTube", emoji: "▶️", maxChars: 200, headlineMax: 100 },
];

const AD_TYPES = ["Flight Deals", "Hotel Packages", "Tour Packages", "Visa Services", "Ferry/Bus Booking", "Car Rentals", "Cruise Packages", "General Travel"];
const TONES = ["Exciting & Urgent", "Professional & Trustworthy", "Fun & Casual", "Luxury & Exclusive", "Budget-Friendly & Value"];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-slate-400 hover:text-purple-600 transition-colors">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function AdCopyGenerator() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(["facebook", "instagram", "tiktok"]);
  const [adType, setAdType] = useState("Flight Deals");
  const [tone, setTone] = useState("Exciting & Urgent");
  const [promo, setPromo] = useState("");
  const [destination, setDestination] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);

  const togglePlatform = (val) => {
    setSelectedPlatforms(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
  };

  const generate = async () => {
    if (!selectedPlatforms.length) return;
    setGenerating(true);
    setResults(null);
    try {
      const platformNames = selectedPlatforms.map(v => PLATFORMS.find(p => p.value === v)?.label).join(", ");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert travel advertising copywriter for GC Travel and Tours Agency, a Philippine-based travel agency.

Generate compelling ad copy for the following:
- Ad Type: ${adType}
- Destination: ${destination || "Philippines and international destinations"}
- Tone: ${tone}
- Special Promo/Offer: ${promo || "Best deals available"}
- Platforms: ${platformNames}

For EACH platform listed, create optimized ad copy that fits the platform's character limits and style.
Return a JSON with a key for each platform value: ${selectedPlatforms.join(", ")}

Each platform entry should have:
- headline: short catchy headline (if applicable)
- body: main ad copy text
- cta: call to action text
- hashtags: array of relevant hashtags (for social platforms)
- emojis: suggested emojis to use

Make it feel authentic, Filipino-friendly, and tailored to each platform's unique audience and format.`,
        response_json_schema: {
          type: "object",
          properties: Object.fromEntries(selectedPlatforms.map(p => [p, {
            type: "object",
            properties: {
              headline: { type: "string" },
              body: { type: "string" },
              cta: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              emojis: { type: "string" }
            }
          }]))
        }
      });
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-500" /> AI Ad Copy Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p.value} onClick={() => togglePlatform(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all flex items-center gap-1.5 ${selectedPlatforms.includes(p.value) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Ad Type</Label>
              <Select value={adType} onValueChange={setAdType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Destination (optional)</Label>
              <Input placeholder="e.g. Boracay, Tokyo, Dubai" value={destination} onChange={e => setDestination(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Special Promo / Offer (optional)</Label>
              <Input placeholder="e.g. 20% off, Book now pay later" value={promo} onChange={e => setPromo(e.target.value)} />
            </div>
          </div>

          <Button onClick={generate} disabled={generating || !selectedPlatforms.length} className="bg-purple-600 hover:bg-purple-700 gap-2">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Ad Copy</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Generated Ad Copy</h3>
            <Button variant="outline" size="sm" onClick={generate} className="gap-2"><RefreshCw className="w-3.5 h-3.5" /> Regenerate</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPlatforms.map(pval => {
              const pl = PLATFORMS.find(p => p.value === pval);
              const copy = results[pval];
              if (!copy) return null;
              return (
                <Card key={pval} className="border-2 border-slate-100 hover:border-purple-200 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-lg">{pl.emoji}</span> {pl.label}
                      {pl.maxChars > 0 && <Badge variant="outline" className="text-xs ml-auto">{pl.maxChars} char limit</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {copy.headline && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-purple-500 font-medium mb-1">HEADLINE</p>
                            <p className="font-bold text-slate-800">{copy.emojis} {copy.headline}</p>
                          </div>
                          <CopyButton text={`${copy.emojis} ${copy.headline}`} />
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 font-medium mb-1">AD COPY</p>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{copy.body}</p>
                        </div>
                        <CopyButton text={copy.body} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-xs text-green-600 font-medium">CTA</p>
                        <p className="font-semibold text-green-700">{copy.cta}</p>
                      </div>
                      <CopyButton text={copy.cta} />
                    </div>
                    {copy.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {copy.hashtags.map((h, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-blue-600 border-blue-200">#{h}</Badge>
                        ))}
                        <CopyButton text={copy.hashtags.map(h => `#${h}`).join(" ")} />
                      </div>
                    )}
                    <Button size="sm" variant="outline" className="w-full gap-2 text-xs"
                      onClick={() => { const full = [copy.headline && `${copy.emojis} ${copy.headline}`, copy.body, copy.cta, copy.hashtags?.map(h => `#${h}`).join(" ")].filter(Boolean).join("\n\n"); navigator.clipboard.writeText(full); }}>
                      <Copy className="w-3 h-3" /> Copy Full Ad
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
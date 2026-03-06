import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink, Info, CheckCircle2, Circle } from "lucide-react";

const PIXELS = [
  {
    id: "meta",
    name: "Meta Pixel",
    platforms: "Facebook & Instagram",
    emoji: "📘",
    color: "bg-blue-600",
    dashboardUrl: "https://business.facebook.com/events_manager",
    docsUrl: "https://developers.facebook.com/docs/meta-pixel",
    placeholder: "Enter your Meta Pixel ID (e.g. 1234567890123456)",
    codeTemplate: (id) => `<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){...};
n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
</script>`,
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    platforms: "TikTok",
    emoji: "🎵",
    color: "bg-black",
    dashboardUrl: "https://ads.tiktok.com/i18n/events_manager",
    docsUrl: "https://ads.tiktok.com/help/article/tiktok-pixel",
    placeholder: "Enter your TikTok Pixel ID",
    codeTemplate: (id) => `<!-- TikTok Pixel -->
<script>
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.push=ttq;ttq.loaded=1;ttq.version='1.0';ttq.queue=[];
var ta=d.createElement("script");ta.async=!0;
ta.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}';
d.getElementsByTagName("head")[0].appendChild(ta);
}(window,document,'ttq');
ttq.load('${id}');
ttq.page();
</script>`,
  },
  {
    id: "google",
    name: "Google Ads Tag",
    platforms: "Google & YouTube",
    emoji: "🔍",
    color: "bg-red-500",
    dashboardUrl: "https://ads.google.com",
    docsUrl: "https://support.google.com/google-ads/answer/6095821",
    placeholder: "Enter your Google Ads Conversion ID (e.g. AW-123456789)",
    codeTemplate: (id) => `<!-- Google Ads Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
</script>`,
  },
  {
    id: "pinterest",
    name: "Pinterest Tag",
    platforms: "Pinterest",
    emoji: "📌",
    color: "bg-red-600",
    dashboardUrl: "https://analytics.pinterest.com",
    docsUrl: "https://help.pinterest.com/en/business/article/track-conversions-with-the-pinterest-tag",
    placeholder: "Enter your Pinterest Tag ID",
    codeTemplate: (id) => `<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk=function(){
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
var n=window.pintrk;n.queue=[],n.version="3.0";
var t=document.createElement("script");t.async=!0;
t.src=e;var r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load','${id}');
pintrk('page');
</script>`,
  },
  {
    id: "twitter",
    name: "X (Twitter) Pixel",
    platforms: "X (Twitter)",
    emoji: "🐦",
    color: "bg-slate-900",
    dashboardUrl: "https://ads.twitter.com",
    docsUrl: "https://business.twitter.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites.html",
    placeholder: "Enter your Twitter Pixel ID",
    codeTemplate: (id) => `<!-- X (Twitter) Pixel -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){
s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},
s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,
u.src='//static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],
a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('init','${id}');
twq('track','PageView');
</script>`,
  },
  {
    id: "reddit",
    name: "Reddit Pixel",
    platforms: "Reddit",
    emoji: "🤖",
    color: "bg-orange-500",
    dashboardUrl: "https://ads.reddit.com",
    docsUrl: "https://business.reddithelp.com/helpcenter/s/article/Reddit-Pixel",
    placeholder: "Enter your Reddit Pixel ID",
    codeTemplate: (id) => `<!-- Reddit Pixel -->
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){
p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};
p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/v2.js",
t.async=!0;var s=d.getElementsByTagName("script")[0];
s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init','${id}');
rdt('track', 'PageVisit');
</script>`,
  },
  {
    id: "microsoft",
    name: "Microsoft Clarity / UET",
    platforms: "Microsoft/Bing",
    emoji: "🪟",
    color: "bg-blue-500",
    dashboardUrl: "https://ads.microsoft.com",
    docsUrl: "https://help.ads.microsoft.com/apex/index/3/en/56683",
    placeholder: "Enter your Microsoft UET Tag ID",
    codeTemplate: (id) => `<!-- Microsoft UET Tag -->
<script>
(function(w,d,t,r,u){var f,n,i;
w[u]=w[u]||[];f=function(){var o={ti:"${id}"};
o.q=w[u];w[u]=new UET(o);w[u].push("pageLoad")};
n=d.createElement(t);n.src=r;n.async=1;n.onload=n.onreadystatechange=function(){
var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)};
i=d.getElementsByTagName(t)[0];i.parentNode.insertBefore(n,i)
})(window,document,"script","//bat.bing.com/bat.js","uetq");
</script>`,
  },
];

function PixelCard({ pixel }) {
  const [pixelId, setPixelId] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = pixelId ? pixel.codeTemplate(pixelId) : "";

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${pixel.color} rounded-lg flex items-center justify-center text-sm`}>{pixel.emoji}</div>
            <div>
              <p className="font-bold text-slate-800">{pixel.name}</p>
              <p className="text-xs text-slate-400 font-normal">{pixel.platforms}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {pixelId ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
            <Badge variant="outline" className={`text-xs ${pixelId ? "border-green-300 text-green-600" : "text-slate-400"}`}>
              {pixelId ? "Configured" : "Not set"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Pixel / Tag ID</Label>
          <Input className="text-sm" placeholder={pixel.placeholder} value={pixelId} onChange={e => setPixelId(e.target.value)} />
        </div>

        {pixelId && (
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={() => setShowCode(!showCode)}>
              <Info className="w-3 h-3" /> {showCode ? "Hide" : "Show"} Tracking Code
            </Button>
            {showCode && (
              <div className="relative bg-slate-900 rounded-lg p-3 overflow-auto max-h-48">
                <pre className="text-xs text-green-400 whitespace-pre-wrap">{code}</pre>
                <button onClick={copyCode} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white rounded p-1 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <a href={pixel.dashboardUrl} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1">
              <ExternalLink className="w-3 h-3" /> Dashboard
            </Button>
          </a>
          <a href={pixel.docsUrl} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1">
              <Info className="w-3 h-3" /> Docs
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdPixelManager() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">How to use Pixel Tracking</p>
          <ol className="list-decimal ml-4 space-y-1 text-xs">
            <li>Get your Pixel/Tag ID from each platform's Ads Manager</li>
            <li>Enter the ID below to generate your tracking code</li>
            <li>Add the generated code to your website's <code className="bg-amber-100 px-1 rounded">&lt;head&gt;</code> section (ask your developer or add via Google Tag Manager)</li>
            <li>Verify the pixel is firing using the platform's test tool</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PIXELS.map(pixel => <PixelCard key={pixel.id} pixel={pixel} />)}
      </div>

      <Card className="bg-slate-50">
        <CardContent className="p-5">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span>💡</span> Pro Tip: Use Google Tag Manager
          </h3>
          <p className="text-sm text-slate-600">
            Instead of adding each pixel code manually, use <strong>Google Tag Manager</strong> to manage all your tracking pixels in one place.
            Just add one GTM snippet to your site, then add all other pixels through the GTM interface.
          </p>
          <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="mt-3 gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Open Google Tag Manager
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, RefreshCw, AlertTriangle, Globe, Copy, Check, LogIn, Monitor, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BIYAHEKO_URL = "https://biyaheko.ph";
const CREDENTIALS = {
  terminal_id: "PHBXU029091100",
  user_id: "GCTRVLTRRS",
  password: "CathyGilaArda2011",
};

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5">
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="font-mono font-bold text-slate-800">{value}</p>
      </div>
      <button onClick={copy} className="text-slate-400 hover:text-red-600 transition-colors ml-3">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function BiyahekoPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [activeView, setActiveView] = useState("embed"); // "embed" | "credentials"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openPortal = () => {
    // Open with credentials pre-filled via URL if supported, else open directly
    window.open(BIYAHEKO_URL, "_blank");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
    </div>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p className="text-slate-500">Admin/staff only.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shadow-sm z-10 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <span className="font-bold text-slate-800">Biyaheko Portal</span>
            <p className="text-xs text-slate-400">biyaheko.ph</p>
          </div>
          <Badge className="bg-green-500 text-white text-xs">Connected</Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggles */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              onClick={() => setActiveView("embed")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${activeView === "embed" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Embedded
            </button>
            <button
              onClick={() => setActiveView("credentials")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${activeView === "credentials" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <Key className="w-3.5 h-3.5" /> Credentials
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIframeKey(k => k + 1); setIframeBlocked(false); }}
            className="gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </Button>
          <Button
            size="sm"
            onClick={openPortal}
            className="gap-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <LogIn className="w-3.5 h-3.5" /> Open & Login
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">

        {/* CREDENTIALS VIEW */}
        {activeView === "credentials" && (
          <div className="max-w-lg mx-auto p-6 space-y-4">
            <Card className="border-2 border-red-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <Key className="w-4 h-4" /> Biyaheko Login Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CopyField label="Terminal ID" value={CREDENTIALS.terminal_id} />
                <CopyField label="User ID" value={CREDENTIALS.user_id} />
                <CopyField label="Password" value={CREDENTIALS.password} />
                <Button
                  onClick={openPortal}
                  className="w-full bg-red-600 hover:bg-red-700 gap-2 mt-2"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Biyaheko Portal in New Tab
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Copy credentials above, then log in using the button.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Quick Login Steps:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Copy your Terminal ID, User ID, and Password above</li>
                  <li>Click "Open Biyaheko Portal in New Tab"</li>
                  <li>Paste credentials into the login form</li>
                  <li>Start searching and booking!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {/* EMBEDDED VIEW */}
        {activeView === "embed" && (
          <>
            {iframeBlocked ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center min-h-[60vh]">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Biyaheko blocked embedded display</h3>
                  <p className="text-slate-500 max-w-md">
                    Their website prevents embedding for security reasons. Use the button below to open it in a new tab.
                  </p>
                </div>
                <Button size="lg" onClick={openPortal} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <ExternalLink className="w-5 h-5" /> Open Biyaheko in New Tab
                </Button>
                <button
                  className="text-sm text-slate-400 underline"
                  onClick={() => setActiveView("credentials")}
                >
                  View login credentials
                </button>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={BIYAHEKO_URL}
                className="w-full h-full border-0"
                style={{ minHeight: "calc(100vh - 60px)" }}
                title="Biyaheko Portal"
                onError={() => setIframeBlocked(true)}
                onLoad={(e) => {
                  try {
                    const doc = e.target.contentDocument;
                    if (!doc || doc.body?.innerHTML === '') setIframeBlocked(true);
                  } catch { /* cross-origin - expected */ }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
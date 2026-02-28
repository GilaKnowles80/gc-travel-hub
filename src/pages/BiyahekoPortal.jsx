import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, AlertTriangle, Globe } from "lucide-react";

const BIYAHEKO_URL = "https://biyaheko.ph";
const TERMINAL_ID = "PHBXU029091100";
const USER_ID = "GCTRVLTRRS";

export default function BiyahekoPortal() {
  const [user, setUser] = useState(null);
  const [frameError, setFrameError] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-slate-500 mt-2">Admin or staff access required.</p>
        </div>
      </div>
    );
  }

  const openInNewTab = () => {
    window.open(BIYAHEKO_URL, "_blank");
  };

  const handleReload = () => {
    setFrameError(false);
    setFrameKey(k => k + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-3 border-b border-slate-700">
        <img
          src="https://biyaheko.ph/Content/Images/Biyaheko.png"
          alt="Biyaheko"
          className="h-7"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="flex-1">
          <span className="text-white font-semibold text-sm">Biyaheko Portal</span>
          <span className="text-slate-400 text-xs ml-3">
            Terminal: <b className="text-amber-400">{TERMINAL_ID}</b> &nbsp;|&nbsp; User: <b className="text-amber-400">{USER_ID}</b>
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:text-white hover:bg-slate-700"
          onClick={handleReload}
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Reload
        </Button>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={openInNewTab}
        >
          <ExternalLink className="w-4 h-4 mr-1" /> Open in New Tab
        </Button>
      </div>

      {/* Credentials hint bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>
          Use these credentials to log in: &nbsp;
          <b>Terminal:</b> {TERMINAL_ID} &nbsp;|&nbsp;
          <b>User ID:</b> {USER_ID} &nbsp;|&nbsp;
          <b>Password:</b> ••••••••••
          &nbsp;— If the portal doesn't load below, click <b>"Open in New Tab"</b>.
        </span>
      </div>

      {/* iFrame or Error */}
      <div className="flex-1 relative">
        {frameError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 gap-4">
            <Globe className="w-16 h-16 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-700">Biyaheko cannot be embedded</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              Biyaheko blocks embedding for security reasons (X-Frame-Options). 
              Please use the button below to open it in a new tab.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4 mr-2" /> Open Biyaheko in New Tab
            </Button>
          </div>
        ) : (
          <iframe
            key={frameKey}
            src={BIYAHEKO_URL}
            className="w-full h-full border-0"
            title="Biyaheko Portal"
            onError={() => setFrameError(true)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        )}
      </div>
    </div>
  );
}
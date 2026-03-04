import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, RefreshCw, AlertTriangle, Globe, Bus, Ship, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TwelveGoPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500">This page is for admin and staff only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-green-600" />
          <span className="font-bold text-slate-800">12Go Asia Portal</span>
          <span className="text-xs text-slate-400 hidden sm:inline">reseller.12go.asia</span>
          <Badge variant="outline" className="text-xs text-green-700 border-green-300 hidden sm:flex gap-1">
            <Bus className="w-3 h-3" /> <Ship className="w-3 h-3" /> <Train className="w-3 h-3" />
            Buses · Ferries · Trains
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setKey(k => k + 1); setIframeError(false); }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('https://12go.asia/?z=15166459', '_blank')}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Customer Site
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('https://reseller.12go.asia/dashboard_p?module=dashboard_p', '_blank')}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Reseller Portal
          </Button>
        </div>
      </div>

      {/* iframe or fallback */}
      <div className="flex-1 relative">
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500" />
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                12Go Asia blocked embedded display
              </h3>
              <p className="text-slate-500 max-w-md">
                12Go Asia's portal prevents being embedded in other sites for security reasons.
                Use the button below to open it directly in a new tab.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                size="lg"
                onClick={() => window.open('https://12go.asia/?z=15166459', '_blank')}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <ExternalLink className="w-5 h-5" />
                Open 12Go Asia (Affiliate)
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open('https://reseller.12go.asia/dashboard_p?module=dashboard_p', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Reseller Dashboard
              </Button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-sm w-full">
              <p className="text-sm font-semibold text-slate-700 mb-3">What you can do on 12Go Asia:</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Bus className="w-4 h-4 text-green-600" /> Book buses across Asia</li>
                <li className="flex items-center gap-2"><Ship className="w-4 h-4 text-blue-600" /> Book ferries & speedboats</li>
                <li className="flex items-center gap-2"><Train className="w-4 h-4 text-purple-600" /> Book trains across Asia</li>
              </ul>
              <p className="text-xs text-slate-400 mt-3">Register at reseller.12go.asia to get your partner credentials.</p>
            </div>
          </div>
        ) : (
          <iframe
            key={key}
            src="https://12go.asia/?z=15166459"
            className="w-full h-full border-0"
            title="12Go Asia Reseller Portal"
            onError={() => setIframeError(true)}
            onLoad={(e) => {
              try {
                const doc = e.target.contentDocument;
                if (!doc || doc.body.innerHTML === '') setIframeError(true);
              } catch {
                // Cross-origin - expected
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
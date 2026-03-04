/**
 * Embeds the 12Go Asia booking site via affiliate link in an iframe.
 * Falls back to an "Open in New Tab" button if the iframe is blocked.
 */
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const AFFILIATE_URL = "https://12go.asia/?z=15166459";

export default function TwelveGoEmbed({ height = "600px" }) {
  const [blocked, setBlocked] = useState(false);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {blocked ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 bg-slate-50 text-center">
          <p className="text-slate-600 text-sm">12Go Asia cannot be embedded here.</p>
          <Button
            onClick={() => window.open(AFFILIATE_URL, "_blank")}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Open 12Go Asia
          </Button>
        </div>
      ) : (
        <iframe
          src={AFFILIATE_URL}
          style={{ width: "100%", height, border: "none" }}
          title="12Go Asia Booking"
          onError={() => setBlocked(true)}
          onLoad={(e) => {
            try {
              const doc = e.target.contentDocument;
              if (!doc || doc.body.innerHTML === "") setBlocked(true);
            } catch {
              // cross-origin — likely loaded fine
            }
          }}
        />
      )}
    </div>
  );
}
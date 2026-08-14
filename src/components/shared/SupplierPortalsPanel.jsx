import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Globe, Monitor } from "lucide-react";

// Secondary fallback options shown when Duffel returns no products.
// Biyaheko, Wanderlinx, Tripzynx + internal Admin Portals.
const PORTALS = [
  { name: "Biyaheko", url: "https://biyaheko.com", bg: "bg-amber-500 hover:bg-amber-600" },
  { name: "Wanderlinx", url: "https://wanderlinx.com", bg: "bg-blue-600 hover:bg-blue-700" },
  { name: "Tripzynx", url: "https://tripzynx.com", bg: "bg-green-600 hover:bg-green-700" },
];

export default function SupplierPortalsPanel({ withIntro = true }) {
  return (
    <div className="space-y-4">
      {withIntro && (
        <p className="text-sm text-slate-500">
          Duffel returned no products for this search. Book directly through one of our supplier portals:
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {PORTALS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${p.bg} text-white font-semibold rounded-xl transition-colors text-sm`}
          >
            <Globe className="w-4 h-4" /> {p.name}
          </a>
        ))}
        <Link
          to={createPageUrl("BiyahekoPortal")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Monitor className="w-4 h-4" /> Admin Portals
        </Link>
      </div>
    </div>
  );
}
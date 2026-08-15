import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ExternalLink, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_COLORS = {
  klook: "#e63946", agoda: "#e91e63", booking_com: "#003580", airbnb: "#ff5a5f",
  expedia: "#f5a623", viator: "#39c1b3", tripadvisor: "#00af87", "12go": "#1e88e5",
  traveloka: "#0064d2", other: "#94a3b8",
};

const pretty = (p) => (p || "").replace(/_/g, " ");

/**
 * Affiliate click-out section — the core passive-income surface (Expedia /
 * Traveloka model). Shows active partner offers for a category; each click
 * is tracked via trackAffiliateClick and redirects to the partner affiliate
 * URL, earning a referral commission with zero fulfillment on our side.
 *
 * Props:
 *  - category: "flights" | "hotels" | "tours" | "activities" | "transport" | undefined (all)
 *  - destination: optional string to filter offers by destination
 *  - title: optional heading override
 */
export default function AffiliateOffersSection({ category, destination, title }) {
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["affiliate-offers", category || "all", destination || ""],
    queryFn: async () => {
      const filter = { is_active: true };
      if (category) filter.category = category;
      const all = await base44.entities.AffiliateLink.filter(filter, "-total_clicks", 12);
      if (!destination) return all.slice(0, 6);
      const d = destination.toLowerCase();
      return all
        .filter(
          (l) =>
            !l.destination ||
            l.destination.toLowerCase().includes(d) ||
            d.includes(l.destination.toLowerCase())
        )
        .slice(0, 6);
    },
  });

  const handleClick = async (link) => {
    try {
      const res = await base44.functions.invoke("trackAffiliateClick", {
        affiliate_link_id: link.id,
        referring_page: window.location.pathname,
      });
      const url = res?.redirect_url || link.base_url;
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Opening ${pretty(link.platform)}…`);
    } catch {
      window.open(link.base_url, "_blank", "noopener,noreferrer");
    }
  };

  if (!isLoading && links.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {title || "Compare on partner sites"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hand-picked deals from trusted booking platforms — you book, we earn a small referral.
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" /> Sponsored
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {links.map((link) => {
            const color = PLATFORM_COLORS[link.platform] || "#94a3b8";
            return (
              <button
                key={link.id}
                onClick={() => handleClick(link)}
                className="group text-left bg-white rounded-xl border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {link.image_url ? (
                  <div className="h-20 bg-slate-100 overflow-hidden">
                    <img
                      src={link.image_url}
                      alt={link.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center" style={{ background: color + "15" }}>
                    <span className="text-sm font-bold capitalize" style={{ color }}>
                      {pretty(link.platform)}
                    </span>
                  </div>
                )}
                <div className="p-2.5 flex-1 flex flex-col">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                    style={{ color }}
                  >
                    {pretty(link.platform)}
                  </span>
                  <p className="text-xs font-medium text-slate-700 line-clamp-2 flex-1">{link.name}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 group-hover:text-amber-700">
                    Book now <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
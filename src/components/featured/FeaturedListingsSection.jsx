import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/pages/utils";
import { Star, Loader2, MapPin } from "lucide-react";
import { useCurrency } from "@/components/currency/CurrencyContext";

/**
 * Paid featured listings — tours/hotels a supplier has paid to surface at the
 * top of the homepage (FeaturedListing entity, placement homepage_top /
 * category_top, status active, within the paid date window). The display
 * itself is the value the supplier paid for; impressions are counted by the
 * admin manager. Renders nothing if no active featured placements exist.
 */
export default function FeaturedListingsSection() {
  const { formatPrice } = useCurrency();

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["featured-listings-home"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const all = await base44.entities.FeaturedListing.filter({
        status: "active",
        entity_type: "tour",
        placement: "homepage_top",
      });
      return all.filter(
        (f) => (!f.start_date || f.start_date <= now) && (!f.end_date || f.end_date >= now)
      );
    },
  });

  const tourIds = featured.map((f) => f.entity_id).filter(Boolean);

  const { data: tours = [] } = useQuery({
    queryKey: ["featured-tours-by-id", tourIds.join(",")],
    queryFn: async () => {
      if (tourIds.length === 0) return [];
      const results = await Promise.all(
        tourIds.map((id) => base44.entities.Tour.get(id).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: tourIds.length > 0,
  });

  if (!isLoading && tours.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              Featured Tours
            </h2>
            <p className="text-sm text-slate-500 mt-1">Top-rated experiences, hand-picked for you.</p>
          </div>
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Sponsored
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.slice(0, 3).map((tour) => (
              <Link
                key={tour.id}
                to={`${createPageUrl("TourDetail")}?id=${tour.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-white"
              >
                <div className="h-40 bg-slate-100 overflow-hidden relative">
                  {tour.image_url ? (
                    <img
                      src={tour.image_url}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full uppercase">
                    Featured
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800 line-clamp-1">{tour.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {tour.destination}
                  </p>
                  <p className="mt-2 text-sm font-bold text-amber-600">
                    {formatPrice ? formatPrice(tour.price_per_person) : `₱${tour.price_per_person}`}
                    <span className="text-xs font-normal text-slate-400"> /person</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
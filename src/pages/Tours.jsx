import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import TourFilters from "../components/tours/TourFilters";

export default function Tours() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "all";
  const initialSearch = urlParams.get("search") || "";

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    price: "all",
    duration: "all",
  });

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["all-tours"],
    queryFn: () => base44.entities.Tour.filter({ status: "active" }, "-created_date", 100),
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "all", price: "all", duration: "all" });
  };

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (
          !tour.title?.toLowerCase().includes(s) &&
          !tour.destination?.toLowerCase().includes(s) &&
          !tour.description?.toLowerCase().includes(s)
        )
          return false;
      }
      if (filters.category !== "all" && tour.category !== filters.category) return false;
      if (filters.price !== "all") {
        const [min, max] = filters.price.split("-").map(Number);
        if (tour.price_per_person < min || tour.price_per_person > max) return false;
      }
      if (filters.duration !== "all") {
        const [min, max] = filters.duration.split("-").map(Number);
        if (tour.duration_days < min || tour.duration_days > max) return false;
      }
      return true;
    });
  }, [tours, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Explore Our Tours
          </h1>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Browse through our curated collection of travel experiences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <TourFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse">
                <div className="h-56 bg-slate-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No tours found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
              <AnimatePresence>
                {filteredTours.map((tour, i) => (
                  <motion.div
                    key={tour.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={createPageUrl("TourDetail") + `?id=${tour.id}`}>
                      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-white">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={
                              tour.image_url ||
                              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"
                            }
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          {tour.category && (
                            <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white border-white/30 text-xs capitalize">
                              {tour.category.replace(/_/g, " ")}
                            </Badge>
                          )}
                          {tour.status === "sold_out" && (
                            <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 text-xs">
                              Sold Out
                            </Badge>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-1 text-amber-400 mb-2">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                className={`w-3.5 h-3.5 ${
                                  j < Math.round(tour.rating || 4)
                                    ? "fill-current"
                                    : "opacity-30"
                                }`}
                              />
                            ))}
                            <span className="text-slate-400 text-xs ml-1">
                              ({tour.reviews_count || 0})
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {tour.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            {tour.destination}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                              <Clock className="w-4 h-4" />
                              {tour.duration_days} days
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">from</p>
                              <p className="text-lg font-bold text-slate-900">
                                ${tour.price_per_person?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
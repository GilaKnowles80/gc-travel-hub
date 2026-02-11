import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

export default function Hotels() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => base44.entities.Hotel.filter({ status: "active" }, "-created_date", 100),
  });

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          hotel.name?.toLowerCase().includes(s) ||
          hotel.location?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [hotels, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Find Your Perfect Stay</h1>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Browse our selection of quality hotels
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <Input
            placeholder="Search hotels or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse" />
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No hotels found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
              <AnimatePresence>
                {filteredHotels.map((hotel, i) => {
                  const lowestPrice = Math.min(...(hotel.room_types?.map((r) => r.price_per_night) || [0]));
                  return (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={createPageUrl("HotelDetail") + `?id=${hotel.id}`}>
                        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-white">
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"}
                              alt={hotel.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                              {Array.from({ length: hotel.star_rating || 3 }).map((_, j) => (
                                <Star key={j} className="w-3 h-3 text-amber-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                              <MapPin className="w-3.5 h-3.5" />
                              {hotel.location}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <div className="text-xs text-slate-400">
                                {hotel.room_types?.length || 0} room types
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400">from</p>
                                <p className="text-lg font-bold text-slate-900">
                                  ${lowestPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-400">per night</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
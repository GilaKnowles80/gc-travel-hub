import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, PackageOpen, Search, Calendar, Users, Hotel as HotelIcon, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

export default function Hotels() {
  const [searchTerm, setSearchTerm] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState("1");
  const [guests, setGuests] = useState("1");
  const [starCategory, setStarCategory] = useState("all");
  const [nationality, setNationality] = useState("");

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => base44.entities.Hotel.filter({ status: "active" }, "-created_date", 100),
  });

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !hotel.name?.toLowerCase().includes(s) &&
          !hotel.location?.toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      if (starCategory !== "all" && hotel.star_rating !== parseInt(starCategory)) {
        return false;
      }
      return true;
    });
  }, [hotels, searchTerm, starCategory]);

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
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <HotelIcon className="w-3.5 h-3.5" />
                Hotel Name / City / Landmarks
              </label>
              <Input
                placeholder="Search hotels, cities, landmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Check-In Date
              </label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Check-Out Date
              </label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Rooms & Guests
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} Room{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Star Category
              </label>
              <Select value={starCategory} onValueChange={setStarCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="5">5 Star</SelectItem>
                  <SelectItem value="4">4 Star</SelectItem>
                  <SelectItem value="3">3 Star</SelectItem>
                  <SelectItem value="2">2 Star</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Nationality
              </label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ph">Philippines</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="sg">Singapore</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                  <SelectItem value="kr">South Korea</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                  <SelectItem value="ae">UAE</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl h-10">
                <Search className="w-4 h-4 mr-2" />
                Search Hotels
              </Button>
            </div>
          </div>
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
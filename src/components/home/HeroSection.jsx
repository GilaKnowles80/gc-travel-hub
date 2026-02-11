import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import TravelersSelector from "./TravelersSelector";

const heroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [tripType, setTripType] = useState("round_trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [onwardDate, setOnwardDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0, seniors: 0, pwd: 0 });

  const cities = [
    "Manila", "Cebu", "Davao", "Singapore", "Hong Kong", "Tokyo", "Seoul", 
    "Bangkok", "Kuala Lumpur", "Dubai", "Sydney", "Los Angeles", "New York"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-amber-300 font-medium tracking-[0.3em] uppercase text-sm mb-4">
            GC Travel & Tours
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl">
            Discover the World's
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              Hidden Wonders
            </span>
          </h1>
          <p className="mt-6 text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Curated travel experiences that transform ordinary trips into
            extraordinary memories
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 w-full max-w-3xl"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
              <div className="bg-white rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500">Trip Type</span>
                </div>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger className="border-0 p-0 h-auto text-sm font-medium text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_trip">Round Trip</SelectItem>
                    <SelectItem value="one_way">One Way</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-white rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500">Origin</span>
                </div>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="border-0 p-0 h-auto text-sm font-medium text-slate-800">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-white rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500">Destination</span>
                </div>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="border-0 p-0 h-auto text-sm font-medium text-slate-800">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-white rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500">Onward Date</span>
                </div>
                <input
                  type="date"
                  value={onwardDate}
                  onChange={(e) => setOnwardDate(e.target.value)}
                  className="w-full bg-transparent text-slate-800 outline-none text-sm font-medium"
                />
              </div>
              {tripType === "round_trip" && (
                <div className="bg-white rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-slate-500">Return Date</span>
                  </div>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-slate-800 outline-none text-sm font-medium"
                  />
                </div>
              )}
              <div className="bg-white rounded-xl px-4 py-3">
                <TravelersSelector value={travelers} onChange={setTravelers} />
              </div>
              <Link to={createPageUrl("Flights")} className={tripType === "one_way" ? "lg:col-span-2" : ""}>
                <Button className="w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold text-sm py-3">
                  <Search className="w-4 h-4 mr-2" />
                  Search Flights
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex items-center gap-8 text-white/70 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            500+ Tours
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            50+ Countries
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            10K+ Happy Travelers
          </div>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentImage ? "w-8 bg-amber-400" : "w-4 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
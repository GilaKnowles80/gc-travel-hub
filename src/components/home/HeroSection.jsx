import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ArrowLeftRight, Plane, Hotel, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import TravelersSelector from "./TravelersSelector";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const heroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [searchType, setSearchType] = useState("flights");
  const [tripType, setTripType] = useState("round_trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [onwardDate, setOnwardDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0, seniors: 0, pwd: 0 });
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const cities = [
    "Manila", "Cebu", "Davao", "Singapore", "Hong Kong", "Tokyo", "Seoul", 
    "Bangkok", "Kuala Lumpur", "Dubai", "Sydney", "Los Angeles", "New York"
  ];

  const filteredOriginCities = cities.filter(city => 
    city.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestCities = cities.filter(city => 
    city.toLowerCase().includes(destinationSearch.toLowerCase())
  );

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
          className="mt-10 w-full max-w-5xl"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setSearchType("flights")}
                variant={searchType === "flights" ? "default" : "ghost"}
                className={`flex-1 rounded-xl ${searchType === "flights" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
              >
                <Plane className="w-4 h-4 mr-2" />
                Flights
              </Button>
              <Button
                onClick={() => setSearchType("tours")}
                variant={searchType === "tours" ? "default" : "ghost"}
                className={`flex-1 rounded-xl ${searchType === "tours" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
              >
                <Compass className="w-4 h-4 mr-2" />
                Tours
              </Button>
              <Button
                onClick={() => setSearchType("hotels")}
                variant={searchType === "hotels" ? "default" : "ghost"}
                className={`flex-1 rounded-xl ${searchType === "hotels" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
              >
                <Hotel className="w-4 h-4 mr-2" />
                Hotels
              </Button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
            {searchType === "flights" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3" />
                    Trip Type
                  </label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_trip">Round Trip</SelectItem>
                      <SelectItem value="one_way">One Way</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    From
                  </label>
                  <Input
                    value={originSearch}
                    onChange={(e) => {
                      setOriginSearch(e.target.value);
                      setShowOriginSuggestions(true);
                    }}
                    onFocus={() => setShowOriginSuggestions(true)}
                    placeholder="City or airport"
                    className="rounded-xl"
                  />
                  {showOriginSuggestions && filteredOriginCities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                      {filteredOriginCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setOrigin(city);
                            setOriginSearch(city);
                            setShowOriginSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-amber-50 text-sm"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    To
                  </label>
                  <Input
                    value={destinationSearch}
                    onChange={(e) => {
                      setDestinationSearch(e.target.value);
                      setShowDestSuggestions(true);
                    }}
                    onFocus={() => setShowDestSuggestions(true)}
                    placeholder="City or airport"
                    className="rounded-xl"
                  />
                  {showDestSuggestions && filteredDestCities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                      {filteredDestCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setDestination(city);
                            setDestinationSearch(city);
                            setShowDestSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-amber-50 text-sm"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Dates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={onwardDate}
                      onChange={(e) => setOnwardDate(e.target.value)}
                      className="rounded-xl"
                    />
                    {tripType === "round_trip" && (
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="rounded-xl"
                      />
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <Link to={createPageUrl("Flights")}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                      <Search className="w-4 h-4 mr-2" />
                      Search Flights
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "tours" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Destination
                  </label>
                  <Input placeholder="Where do you want to go?" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    When
                  </label>
                  <Input type="date" className="rounded-xl" />
                </div>
                <div className="md:col-span-3">
                  <Link to={createPageUrl("Tours")}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                      <Search className="w-4 h-4 mr-2" />
                      Explore Tours
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "hotels" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </label>
                  <Input placeholder="City, hotel, or landmark" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Check-in
                  </label>
                  <Input type="date" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Check-out
                  </label>
                  <Input type="date" className="rounded-xl" />
                </div>
                <div className="md:col-span-3">
                  <Link to={createPageUrl("Hotels")}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                      <Search className="w-4 h-4 mr-2" />
                      Find Hotels
                    </Button>
                  </Link>
                </div>
              </div>
            )}
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
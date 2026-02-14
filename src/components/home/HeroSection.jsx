import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ArrowLeftRight, Plane, Hotel, Compass, Ship, Bus, Umbrella, Zap, Car } from "lucide-react";
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-orange-900/40" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 font-bold tracking-[0.15em] uppercase text-[11px] mb-4">
            GC Travel & Tours
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
            Discover the Hidden Wonders
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mb-8"
        >
          <p className="text-amber-100 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Curated travel experiences that transform ordinary trips into extraordinary memories
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-5xl"
        >

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-8 gap-2 mb-6">
              {[
                { type: "flights", label: "Flights", icon: Plane },
                { type: "tours", label: "Tours", icon: Compass },
                { type: "hotels", label: "Hotels", icon: Hotel },
                { type: "ferry", label: "Ferry", icon: Ship },
                { type: "bus", label: "Bus", icon: Bus },
                { type: "insurance", label: "Insurance", icon: Umbrella },
                { type: "visa", label: "Visa", icon: Zap },
                { type: "carRental", label: "Car Rental", icon: Car },
              ].map(({ type, label, icon: Icon }) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setSearchType(type)}
                    variant={searchType === type ? "default" : "ghost"}
                    className={`rounded-xl w-full transition-all font-semibold ${
                      searchType === type ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg text-white" : "text-slate-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </motion.div>
              ))}
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
                       placeholder="mm/dd/yyyy"
                       className="rounded-xl cursor-pointer"
                     />
                     {tripType === "round_trip" && (
                       <Input
                         type="date"
                         value={returnDate}
                         onChange={(e) => setReturnDate(e.target.value)}
                         placeholder="mm/dd/yyyy"
                         className="rounded-xl cursor-pointer"
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
                   <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
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
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Check-out
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
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

            {searchType === "ferry" && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     From
                   </label>
                   <Input placeholder="Departure port" className="rounded-xl" />
                 </div>
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     To
                   </label>
                   <Input placeholder="Destination port" className="rounded-xl" />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                 <div className="md:col-span-3">
                   <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                     <Search className="w-4 h-4 mr-2" />
                     Search Ferries
                   </Button>
                 </div>
               </div>
             )}

            {searchType === "bus" && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     From
                   </label>
                   <Input placeholder="Departure city" className="rounded-xl" />
                 </div>
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     To
                   </label>
                   <Input placeholder="Destination city" className="rounded-xl" />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                 <div className="md:col-span-3">
                   <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                     <Search className="w-4 h-4 mr-2" />
                     Search Buses
                   </Button>
                 </div>
               </div>
             )}

            {searchType === "insurance" && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <Calendar className="w-3 h-3" />
                     Trip Start
                   </label>
                   <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Trip End
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                 <div className="md:col-span-2">
                   <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                     <Search className="w-4 h-4 mr-2" />
                     Get Insurance Quotes
                   </Button>
                 </div>
               </div>
             )}

            {searchType === "visa" && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     Destination Country
                   </label>
                   <Input placeholder="Which country?" className="rounded-xl" />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Travel Date
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                      <Search className="w-4 h-4 mr-2" />
                      Check Visa Requirements
                    </Button>
                  </div>
                </div>
              )}

            {searchType === "carRental" && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     Pickup Location
                   </label>
                   <Input placeholder="City or airport" className="rounded-xl" />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Pickup Date
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Dropoff Date
                    </label>
                    <Input type="date" placeholder="mm/dd/yyyy" className="rounded-xl cursor-pointer" />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl h-12 font-semibold">
                      <Search className="w-4 h-4 mr-2" />
                      Search Car Rentals
                    </Button>
                  </div>
                </div>
              )}
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
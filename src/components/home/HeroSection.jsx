import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ArrowLeftRight, Plane, Hotel, Compass, Ship, Bus, Umbrella, Zap, Car, Train } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import TravelersSelector from "./TravelersSelector";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PriceCalendar from "@/components/shared/PriceCalendar";

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
  const [showFlightCalendar, setShowFlightCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [showHotelCheckin, setShowHotelCheckin] = useState(false);
  const [showHotelCheckout, setShowHotelCheckout] = useState(false);
  const [geoDetecting, setGeoDetecting] = useState(false);
  const flightCalRef = useRef(null);
  const returnCalRef = useRef(null);
  const checkinCalRef = useRef(null);
  const checkoutCalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (flightCalRef.current && !flightCalRef.current.contains(e.target)) setShowFlightCalendar(false);
      if (returnCalRef.current && !returnCalRef.current.contains(e.target)) setShowReturnCalendar(false);
      if (checkinCalRef.current && !checkinCalRef.current.contains(e.target)) setShowHotelCheckin(false);
      if (checkoutCalRef.current && !checkoutCalRef.current.contains(e.target)) setShowHotelCheckout(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const airports = [
    { city: "Manila", iata: "MNL" },
    { city: "Cebu", iata: "CEB" },
    { city: "Davao", iata: "DVO" },
    { city: "Singapore", iata: "SIN" },
    { city: "Hong Kong", iata: "HKG" },
    { city: "Tokyo", iata: "NRT" },
    { city: "Seoul", iata: "ICN" },
    { city: "Bangkok", iata: "BKK" },
    { city: "Kuala Lumpur", iata: "KUL" },
    { city: "Dubai", iata: "DXB" },
    { city: "Sydney", iata: "SYD" },
    { city: "Los Angeles", iata: "LAX" },
    { city: "New York", iata: "JFK" },
    { city: "Amsterdam", iata: "AMS" },
    { city: "London Heathrow", iata: "LHR" },
    { city: "London Gatwick", iata: "LGW" },
    { city: "Paris", iata: "CDG" },
    { city: "Frankfurt", iata: "FRA" },
    { city: "Doha", iata: "DOH" },
    { city: "Taipei", iata: "TPE" },
    { city: "Osaka", iata: "KIX" },
    { city: "Melbourne", iata: "MEL" },
  ];

  const filteredOriginCities = airports.filter(a =>
    a.city.toLowerCase().includes(originSearch.toLowerCase()) ||
    a.iata.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestCities = airports.filter(a =>
    a.city.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    a.iata.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Geo-detect nearest airport for the "From" field
  useEffect(() => {
    setGeoDetecting(true);
    // origin airport + popular destination from that country
    const countryAirportMap = {
      'PH': { origin: 'MNL', originLabel: 'Manila (MNL)', dest: 'SIN', destLabel: 'Singapore (SIN)' },
      'SG': { origin: 'SIN', originLabel: 'Singapore (SIN)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'JP': { origin: 'NRT', originLabel: 'Tokyo (NRT)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'KR': { origin: 'ICN', originLabel: 'Seoul (ICN)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'HK': { origin: 'HKG', originLabel: 'Hong Kong (HKG)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'TW': { origin: 'TPE', originLabel: 'Taipei (TPE)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'MY': { origin: 'KUL', originLabel: 'Kuala Lumpur (KUL)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'TH': { origin: 'BKK', originLabel: 'Bangkok (BKK)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'AU': { origin: 'SYD', originLabel: 'Sydney (SYD)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'NZ': { origin: 'AKL', originLabel: 'Auckland (AKL)', dest: 'SYD', destLabel: 'Sydney (SYD)' },
      'US': { origin: 'LAX', originLabel: 'Los Angeles (LAX)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'CA': { origin: 'YVR', originLabel: 'Vancouver (YVR)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'GB': { origin: 'LHR', originLabel: 'London Heathrow (LHR)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'DE': { origin: 'FRA', originLabel: 'Frankfurt (FRA)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'FR': { origin: 'CDG', originLabel: 'Paris (CDG)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'NL': { origin: 'AMS', originLabel: 'Amsterdam (AMS)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'BE': { origin: 'BRU', originLabel: 'Brussels (BRU)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'ES': { origin: 'MAD', originLabel: 'Madrid (MAD)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'IT': { origin: 'FCO', originLabel: 'Rome (FCO)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'PT': { origin: 'LIS', originLabel: 'Lisbon (LIS)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'AT': { origin: 'VIE', originLabel: 'Vienna (VIE)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'CH': { origin: 'ZRH', originLabel: 'Zurich (ZRH)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'AE': { origin: 'DXB', originLabel: 'Dubai (DXB)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'SA': { origin: 'RUH', originLabel: 'Riyadh (RUH)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'QA': { origin: 'DOH', originLabel: 'Doha (DOH)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'KW': { origin: 'KWI', originLabel: 'Kuwait City (KWI)', dest: 'MNL', destLabel: 'Manila (MNL)' },
      'IN': { origin: 'BOM', originLabel: 'Mumbai (BOM)', dest: 'SIN', destLabel: 'Singapore (SIN)' },
      'CN': { origin: 'PEK', originLabel: 'Beijing (PEK)', dest: 'MNL', destLabel: 'Manila (MNL)' },
    };
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const mapped = countryAirportMap[data.country_code];
        if (mapped) {
          setOrigin(mapped.origin);
          setOriginSearch(mapped.originLabel);
          setDestination(mapped.dest);
          setDestinationSearch(mapped.destLabel);
        } else {
          setOrigin('MNL');
          setOriginSearch('Manila (MNL)');
          setDestination('SIN');
          setDestinationSearch('Singapore (SIN)');
        }
      })
      .catch(() => {
        setOrigin('MNL');
        setOriginSearch('Manila (MNL)');
        setDestination('SIN');
        setDestinationSearch('Singapore (SIN)');
      })
      .finally(() => setGeoDetecting(false));
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

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-4"
        >
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 font-bold tracking-[0.15em] uppercase text-[11px] mb-3">
            GC Travel & Tours
          </p>
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight"
            style={{
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)"
            }}
          >
            Find Your Perfect Trip
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mb-6"
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

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl max-h-[60vh] overflow-y-auto overflow-x-visible">
            <div className="overflow-x-auto mb-6 -mx-6 px-6">
              <div className="flex gap-2 min-w-max">
                {[
                  { type: "flights", label: "Flights", icon: Plane },
                  { type: "hotels", label: "Hotels", icon: Hotel },
                  { type: "tours", label: "Tours", icon: Compass },
                  { type: "bus", label: "Bus", icon: Bus },
                  { type: "ferry", label: "Ferry", icon: Ship },
                  { type: "cruise", label: "Cruise", icon: Ship },
                  { type: "visa", label: "Visa", icon: Umbrella },
                  { type: "car", label: "Car Rental", icon: Car },
                  { type: "train", label: "Train", icon: Train },
                ].map(({ type, label, icon: Icon }) => (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setSearchType(type)}
                      variant={searchType === type ? "default" : "ghost"}
                      className={`rounded-xl whitespace-nowrap transition-all font-semibold ${
                        searchType === type ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg text-white" : "text-slate-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
            {searchType === "flights" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible">
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
                    {geoDetecting && <span className="ml-1 text-amber-500 text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-amber-500 border-t-transparent animate-spin inline-block" />detecting...</span>}
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
                   <div className="absolute z-[60] w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                     {filteredOriginCities.map((a) => (
                       <button
                         key={a.iata}
                         onClick={() => {
                           setOrigin(a.iata);
                           setOriginSearch(`${a.city} (${a.iata})`);
                           setShowOriginSuggestions(false);
                         }}
                         className="w-full px-4 py-2 text-left hover:bg-amber-50 text-sm flex items-center gap-2"
                       >
                         <span className="font-mono font-bold text-amber-600 text-xs">{a.iata}</span>
                         <span>{a.city}</span>
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
                   <div className="absolute z-[60] w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                     {filteredDestCities.map((a) => (
                       <button
                         key={a.iata}
                         onClick={() => {
                           setDestination(a.iata);
                           setDestinationSearch(`${a.city} (${a.iata})`);
                           setShowDestSuggestions(false);
                         }}
                         className="w-full px-4 py-2 text-left hover:bg-amber-50 text-sm flex items-center gap-2"
                       >
                         <span className="font-mono font-bold text-amber-600 text-xs">{a.iata}</span>
                         <span>{a.city}</span>
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
                     {/* Depart date with price calendar */}
                     <div className="relative" ref={flightCalRef}>
                       <button
                         type="button"
                         onClick={() => { setShowFlightCalendar(!showFlightCalendar); setShowReturnCalendar(false); }}
                         className="w-full h-11 md:h-9 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                       >
                         <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                         <span className={onwardDate ? "text-slate-800" : "text-slate-400"}>
                           {onwardDate || "Depart"}
                         </span>
                       </button>
                       {showFlightCalendar && (
                           <div className="absolute top-full left-0 mt-1 z-[200]">
                           <PriceCalendar
                             type="flight"
                             origin={origin}
                             destination={destination}
                             selectedDate={onwardDate}
                             onSelectDate={(d) => { setOnwardDate(d); setShowFlightCalendar(false); if (returnDate && d > returnDate) setReturnDate(d); }}
                           />
                         </div>
                       )}
                     </div>
                     {tripType === "round_trip" && (
                       <div className="relative" ref={returnCalRef}>
                         <button
                           type="button"
                           onClick={() => { setShowReturnCalendar(!showReturnCalendar); setShowFlightCalendar(false); }}
                           className="w-full h-11 md:h-9 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                         >
                           <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                           <span className={returnDate ? "text-slate-800" : "text-slate-400"}>
                             {returnDate || "Return"}
                           </span>
                         </button>
                         {showReturnCalendar && (
                           <div className="absolute top-full right-0 mt-1 z-[200]">
                             <PriceCalendar
                               type="flight"
                               origin={destination}
                               destination={origin}
                               selectedDate={returnDate}
                               minDate={onwardDate}
                               onSelectDate={(d) => { setReturnDate(d); setShowReturnCalendar(false); }}
                             />
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>

                <div className="lg:col-span-4">
                  <Link to={`${createPageUrl("Flights")}?origin=${origin}&destination=${destination}&departDate=${onwardDate}&returnDate=${returnDate}&tripType=${tripType}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />
                      Search Flights
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
                   <Input 
                     placeholder="City, hotel, or landmark" 
                     className="rounded-xl"
                     value={destination}
                     onChange={(e) => setDestination(e.target.value)}
                   />
                 </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Check-in
                    </label>
                    <div className="relative" ref={checkinCalRef}>
                      <button
                        type="button"
                        onClick={() => { setShowHotelCheckin(!showHotelCheckin); setShowHotelCheckout(false); }}
                        className="w-full h-11 md:h-9 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={onwardDate ? "text-slate-800" : "text-slate-400"}>
                          {onwardDate || "Check-in date"}
                        </span>
                      </button>
                      {showHotelCheckin && (
                        <div className="absolute top-full left-0 mt-1 z-[100]">
                          <PriceCalendar
                            type="hotel"
                            destination={destination}
                            selectedDate={onwardDate}
                            onSelectDate={(d) => { setOnwardDate(d); setShowHotelCheckin(false); if (returnDate && d >= returnDate) setReturnDate(""); }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Check-out
                    </label>
                    <div className="relative" ref={checkoutCalRef}>
                      <button
                        type="button"
                        onClick={() => { setShowHotelCheckout(!showHotelCheckout); setShowHotelCheckin(false); }}
                        className="w-full h-11 md:h-9 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={returnDate ? "text-slate-800" : "text-slate-400"}>
                          {returnDate || "Check-out date"}
                        </span>
                      </button>
                      {showHotelCheckout && (
                        <div className="absolute top-full left-0 mt-1 z-[100]">
                          <PriceCalendar
                            type="hotel"
                            destination={destination}
                            selectedDate={returnDate}
                            minDate={onwardDate || undefined}
                            onSelectDate={(d) => { setReturnDate(d); setShowHotelCheckout(false); }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                 <div className="md:col-span-3">
                   <Link to={`${createPageUrl("HotelSearch")}?location=${destination}&checkIn=${onwardDate}&checkOut=${returnDate}`}>
                     <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                       <Search className="w-4 h-4 mr-2" />
                       Find Hotels
                     </Button>
                   </Link>
                 </div>
               </div>
             )}

            {searchType === "tours" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Destination</label>
                  <Input placeholder="e.g. Palawan, Bali, Paris" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Travel Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Compass className="w-3 h-3" />Category</label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Any category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="wildlife">Wildlife</SelectItem>
                      <SelectItem value="city_tour">City Tour</SelectItem>
                      <SelectItem value="honeymoon">Honeymoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Link to={`${createPageUrl("Tours")}?destination=${destination}&category=${tripType}&date=${onwardDate}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Search Tour Packages
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "bus" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />From</label>
                  <Input placeholder="e.g. Manila, New York" className="rounded-xl" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />To</label>
                  <Input placeholder="e.g. Baguio, Boston" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Link to={`${createPageUrl("BusSearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Search Buses
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "ferry" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />From Port</label>
                  <Input placeholder="e.g. Manila, Batangas" className="rounded-xl" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />To Port</label>
                  <Input placeholder="e.g. Cebu, Coron" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Link to={`${createPageUrl("FerrySearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Search Ferries
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "cruise" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Destination</label>
                  <Input placeholder="e.g. Caribbean, Mediterranean" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Departure Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Ship className="w-3 h-3" />Duration</label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Any duration" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (2-5 nights)</SelectItem>
                      <SelectItem value="medium">Medium (6-9 nights)</SelectItem>
                      <SelectItem value="long">Long (10+ nights)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Link to={`${createPageUrl("CruiseSearch")}?destination=${destination}&date=${onwardDate}&duration=${tripType}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Search Cruises
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "visa" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Destination Country</label>
                  <Input placeholder="e.g. Japan, USA, Schengen" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Umbrella className="w-3 h-3" />Visa Type</label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourism">Tourist Visa</SelectItem>
                      <SelectItem value="business">Business Visa</SelectItem>
                      <SelectItem value="study">Student Visa</SelectItem>
                      <SelectItem value="work">Work Visa</SelectItem>
                      <SelectItem value="transit">Transit Visa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Travel Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <Link to={`${createPageUrl("Visas")}?country=${destination}&type=${tripType}&date=${onwardDate}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Apply for Visa
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "car" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Pick-up Location</label>
                  <Input placeholder="e.g. Manila, New York, London" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Pick-up Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Return Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={onwardDate} />
                </div>
                <div className="flex items-end">
                  <Link to={`${createPageUrl("CarRentalSearch")}?location=${destination}&pickupDate=${onwardDate}&returnDate=${returnDate}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Find Cars
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {searchType === "train" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />From Station</label>
                  <Input placeholder="e.g. Paris Gare du Nord, Tokyo" className="rounded-xl" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />To Station</label>
                  <Input placeholder="e.g. London St Pancras, Osaka" className="rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</label>
                  <Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={(e) => setOnwardDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Link to={`${createPageUrl("TrainSearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-12 font-bold shadow-lg">
                      <Search className="w-4 h-4 mr-2" />Search Trains
                    </Button>
                  </Link>
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
            Real-time Flight Prices
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            300+ Airlines
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Verified Hotels
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
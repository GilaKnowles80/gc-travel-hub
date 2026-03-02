import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ArrowLeftRight, Plane, Hotel, Compass, Ship, Bus, Umbrella, Car, Train } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import PriceCalendar from "@/components/shared/PriceCalendar";

const heroImages = [
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
];

const SEARCH_TABS = [
  { type: "flights", label: "Flights", icon: Plane },
  { type: "hotels", label: "Hotels", icon: Hotel },
  { type: "tours", label: "Tours", icon: Compass },
  { type: "bus", label: "Bus", icon: Bus },
  { type: "ferry", label: "Ferry", icon: Ship },
  { type: "cruise", label: "Cruise", icon: Ship },
  { type: "visa", label: "Visa", icon: Umbrella },
  { type: "car", label: "Car Rental", icon: Car },
  { type: "train", label: "Train", icon: Train },
];

const PH_AIRPORTS = [
  { city: "Manila", iata: "MNL" }, { city: "Cebu", iata: "CEB" }, { city: "Davao", iata: "DVO" },
  { city: "Iloilo", iata: "ILO" }, { city: "Bacolod", iata: "BCD" }, { city: "Zamboanga", iata: "ZAM" },
  { city: "General Santos", iata: "GES" }, { city: "Cagayan de Oro", iata: "CGY" }, { city: "Butuan", iata: "BXU" },
  { city: "Bukidnon (Malaybalay)", iata: "MLP" }, { city: "Surigao", iata: "SUG" }, { city: "Dumaguete", iata: "DGT" },
  { city: "Kalibo (Boracay)", iata: "KLO" }, { city: "Puerto Princesa", iata: "PPS" }, { city: "Tacloban", iata: "TAC" },
  { city: "Siargao", iata: "IAO" }, { city: "Caticlan (Boracay)", iata: "MPH" }, { city: "Legazpi", iata: "LGP" },
  { city: "Naga", iata: "WNP" }, { city: "Tuguegarao", iata: "TUG" }, { city: "Laoag", iata: "LAO" },
  { city: "Ozamiz", iata: "OZC" }, { city: "Dipolog", iata: "DPL" }, { city: "Pagadian", iata: "PAG" },
  { city: "Cotabato", iata: "CBO" }, { city: "Masbate", iata: "MBT" }, { city: "Calbayog", iata: "CYP" },
];

const INTL_AIRPORTS = [
  { city: "Singapore", iata: "SIN" }, { city: "Hong Kong", iata: "HKG" }, { city: "Tokyo", iata: "NRT" },
  { city: "Seoul", iata: "ICN" }, { city: "Bangkok", iata: "BKK" }, { city: "Kuala Lumpur", iata: "KUL" },
  { city: "Dubai", iata: "DXB" }, { city: "Sydney", iata: "SYD" }, { city: "Los Angeles", iata: "LAX" },
  { city: "New York", iata: "JFK" }, { city: "Amsterdam", iata: "AMS" }, { city: "London Heathrow", iata: "LHR" },
  { city: "Paris", iata: "CDG" }, { city: "Frankfurt", iata: "FRA" }, { city: "Doha", iata: "DOH" },
  { city: "Taipei", iata: "TPE" }, { city: "Osaka", iata: "KIX" }, { city: "Melbourne", iata: "MEL" },
];

const ALL_AIRPORTS = [
  ...PH_AIRPORTS.map(a => ({ ...a, domestic: true })),
  ...INTL_AIRPORTS,
];

const COUNTRY_MAP = {
  'PH': { origin: 'MNL', originLabel: 'Manila (MNL)', dest: 'SIN', destLabel: 'Singapore (SIN)' },
  'SG': { origin: 'SIN', originLabel: 'Singapore (SIN)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'JP': { origin: 'NRT', originLabel: 'Tokyo (NRT)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'KR': { origin: 'ICN', originLabel: 'Seoul (ICN)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'HK': { origin: 'HKG', originLabel: 'Hong Kong (HKG)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'TW': { origin: 'TPE', originLabel: 'Taipei (TPE)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'MY': { origin: 'KUL', originLabel: 'Kuala Lumpur (KUL)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'TH': { origin: 'BKK', originLabel: 'Bangkok (BKK)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'AU': { origin: 'SYD', originLabel: 'Sydney (SYD)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'US': { origin: 'LAX', originLabel: 'Los Angeles (LAX)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'CA': { origin: 'YVR', originLabel: 'Vancouver (YVR)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'GB': { origin: 'LHR', originLabel: 'London Heathrow (LHR)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'DE': { origin: 'FRA', originLabel: 'Frankfurt (FRA)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'FR': { origin: 'CDG', originLabel: 'Paris (CDG)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'NL': { origin: 'AMS', originLabel: 'Amsterdam (AMS)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'BE': { origin: 'BRU', originLabel: 'Brussels (BRU)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'AE': { origin: 'DXB', originLabel: 'Dubai (DXB)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'SA': { origin: 'RUH', originLabel: 'Riyadh (RUH)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'QA': { origin: 'DOH', originLabel: 'Doha (DOH)', dest: 'MNL', destLabel: 'Manila (MNL)' },
  'KW': { origin: 'KWI', originLabel: 'Kuwait City (KWI)', dest: 'MNL', destLabel: 'Manila (MNL)' },
};

const BTN_SEARCH = "w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white rounded-xl h-10 font-bold shadow-lg";

function FieldLabel({ icon: Icon, text }) {
  return (
    <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
      <Icon className="w-3 h-3" />{text}
    </label>
  );
}

function CalendarPortal({ anchorRef, onClose, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    const handler = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 99999 }}>
      {children}
    </div>
  );
}

function AirportDropdown({ airports, onSelect, userCountry }) {
  const domestic = airports.filter(a => a.domestic);
  const intl = airports.filter(a => !a.domestic);
  const grouped = userCountry === 'PH' ? [...domestic, ...intl] : airports;

  return (
    <div className="absolute z-[999] w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-y-auto">
      {grouped.map((a, i) => {
        const prev = grouped[i - 1];
        const isDomesticHeader = a.domestic && (!prev || !prev.domestic);
        const isIntlHeader = !a.domestic && (!prev || prev.domestic);
        return (
          <React.Fragment key={a.iata}>
            {isDomesticHeader && <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 sticky top-0">🇵🇭 Philippines Domestic</div>}
            {isIntlHeader && <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 sticky top-0">✈️ International</div>}
            <button onClick={() => onSelect(a)} className="w-full px-3 py-2 text-left hover:bg-amber-50 text-sm flex items-center gap-2 transition-colors">
              <span className="font-mono font-bold text-amber-600 text-xs w-9 shrink-0">{a.iata}</span>
              <span className="text-slate-700">{a.city}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [searchType, setSearchType] = useState("flights");
  const [tripType, setTripType] = useState("round_trip");
  const [flightTripType, setFlightTripType] = useState("round_trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [onwardDate, setOnwardDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);
  const [showDepartCal, setShowDepartCal] = useState(false);
  const [showReturnCal, setShowReturnCal] = useState(false);
  const [showCheckinCal, setShowCheckinCal] = useState(false);
  const [showCheckoutCal, setShowCheckoutCal] = useState(false);
  const [geoDetecting, setGeoDetecting] = useState(false);
  const [userCountry, setUserCountry] = useState("PH");

  const departCalRef = useRef(null);
  const returnCalRef = useRef(null);
  const checkinCalRef = useRef(null);
  const checkoutCalRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (departCalRef.current && !departCalRef.current.contains(e.target)) setShowDepartCal(false);
      if (returnCalRef.current && !returnCalRef.current.contains(e.target)) setShowReturnCal(false);
      if (checkinCalRef.current && !checkinCalRef.current.contains(e.target)) setShowCheckinCal(false);
      if (checkoutCalRef.current && !checkoutCalRef.current.contains(e.target)) setShowCheckoutCal(false);
      if (originRef.current && !originRef.current.contains(e.target)) setShowOriginDrop(false);
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Image carousel
  useEffect(() => {
    const t = setInterval(() => setCurrentImage(p => (p + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Geo-detect
  useEffect(() => {
    setGeoDetecting(true);
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.country_code) setUserCountry(data.country_code);
        const mapped = COUNTRY_MAP[data.country_code];
        if (mapped) {
          setOrigin(mapped.origin); setOriginSearch(mapped.originLabel);
          setDestination(mapped.dest); setDestinationSearch(mapped.destLabel);
        } else {
          setOrigin('MNL'); setOriginSearch('Manila (MNL)');
          setDestination('SIN'); setDestinationSearch('Singapore (SIN)');
        }
      })
      .catch(() => {
        setOrigin('MNL'); setOriginSearch('Manila (MNL)');
        setDestination('SIN'); setDestinationSearch('Singapore (SIN)');
      })
      .finally(() => setGeoDetecting(false));
  }, []);

  const filterAirports = (query) =>
    ALL_AIRPORTS.filter(a =>
      a.city.toLowerCase().includes(query.toLowerCase()) ||
      a.iata.toLowerCase().includes(query.toLowerCase())
    );

  const swapAirports = () => {
    setOrigin(destination); setOriginSearch(destinationSearch);
    setDestination(origin); setDestinationSearch(originSearch);
  };

  return (
    <div className="relative min-h-[640px] h-[88vh]">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div key={currentImage} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImages[currentImage]})` }} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 pt-20 pb-6">
        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-center mb-4">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 font-bold tracking-[0.15em] uppercase text-[11px] mb-2">GC Travel & Tours</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>Find Your Perfect Trip</h1>
          <p className="text-amber-100 text-sm md:text-base max-w-xl mx-auto mt-2 font-medium drop-shadow-md">Curated travel experiences that transform ordinary trips into extraordinary memories</p>
        </motion.div>

        {/* Search Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="w-full max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            {/* Tab Bar */}
            <div className="overflow-x-auto">
              <div className="flex gap-0 min-w-max px-3 pt-3">
                {SEARCH_TABS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setSearchType(type)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all rounded-t-xl ${
                      searchType === type
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Forms */}
            <div className="bg-white/95 backdrop-blur-xl px-6 py-5 rounded-b-2xl">

              {/* FLIGHTS */}
              {searchType === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Trip type + Depart + Return — all in one row, close together */}
                  <div className="md:col-span-4 flex items-center gap-2 flex-wrap">
                    {["round_trip", "one_way", "multi_city"].map(t => (
                      <button key={t} onClick={() => setFlightTripType(t)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${flightTripType === t ? "bg-orange-500 text-white border-orange-500" : "text-slate-500 border-slate-200 hover:border-orange-300"}`}>
                        <ArrowLeftRight className="w-3 h-3" />
                        {t === "round_trip" ? "Round Trip" : t === "one_way" ? "One Way" : "Multi City"}
                      </button>
                    ))}

                    {/* Separator */}
                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Depart */}
                    <div className="relative" ref={departCalRef}>
                      <button onClick={() => { setShowDepartCal(v => !v); setShowReturnCal(false); }}
                        className="h-8 border border-input rounded-xl px-3 text-sm bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors w-[140px]">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={`truncate text-xs ${onwardDate ? "text-slate-800" : "text-slate-400"}`}>{onwardDate || "Depart Date"}</span>
                      </button>
                      {showDepartCal && createPortal(
                        <CalendarPortal anchorRef={departCalRef} onClose={() => setShowDepartCal(false)}>
                          <PriceCalendar type="flight" origin={origin} destination={destination} selectedDate={onwardDate}
                            onSelectDate={d => { setOnwardDate(d); setShowDepartCal(false); if (returnDate && d > returnDate) setReturnDate(""); }} />
                        </CalendarPortal>,
                        document.body
                      )}
                    </div>

                    {/* Return — only shown for round_trip */}
                    {flightTripType === "round_trip" && (
                      <div className="relative" ref={returnCalRef}>
                        <button onClick={() => { setShowReturnCal(v => !v); setShowDepartCal(false); }}
                          className="h-8 border border-input rounded-xl px-3 text-sm bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors w-[140px]">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className={`truncate text-xs ${returnDate ? "text-slate-800" : "text-slate-400"}`}>{returnDate || "Return Date"}</span>
                        </button>
                        {showReturnCal && createPortal(
                          <CalendarPortal anchorRef={returnCalRef} onClose={() => setShowReturnCal(false)}>
                            <PriceCalendar type="flight" origin={destination} destination={origin} selectedDate={returnDate} minDate={onwardDate}
                              onSelectDate={d => { setReturnDate(d); setShowReturnCal(false); }} />
                          </CalendarPortal>,
                          document.body
                        )}
                      </div>
                    )}
                  </div>

                  {/* From */}
                  <div className="md:col-span-2 relative" ref={originRef}>
                    <FieldLabel icon={MapPin} text={<>From {geoDetecting && <span className="text-amber-500 text-[9px] ml-1">● detecting</span>}</>} />
                    <div className="relative">
                      <Input value={originSearch} onChange={e => { setOriginSearch(e.target.value); setShowOriginDrop(true); }} onFocus={() => setShowOriginDrop(true)}
                        placeholder="City or airport" className="rounded-xl pr-8 h-11 text-sm" />
                      <button onClick={swapAirports} title="Swap" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                    </div>
                    {showOriginDrop && filterAirports(originSearch).length > 0 && (
                      <AirportDropdown airports={filterAirports(originSearch)} userCountry={userCountry}
                        onSelect={a => { setOrigin(a.iata); setOriginSearch(`${a.city} (${a.iata})`); setShowOriginDrop(false); }} />
                    )}
                  </div>

                  {/* To */}
                  <div className="md:col-span-2 relative" ref={destRef}>
                    <FieldLabel icon={MapPin} text="To" />
                    <Input value={destinationSearch} onChange={e => { setDestinationSearch(e.target.value); setShowDestDrop(true); }} onFocus={() => setShowDestDrop(true)}
                      placeholder="City or airport" className="rounded-xl h-11 text-sm" />
                    {showDestDrop && filterAirports(destinationSearch).length > 0 && (
                      <AirportDropdown airports={filterAirports(destinationSearch)} userCountry={userCountry}
                        onSelect={a => { setDestination(a.iata); setDestinationSearch(`${a.city} (${a.iata})`); setShowDestDrop(false); }} />
                    )}
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("Flights")}?origin=${origin}&destination=${destination}&departDate=${onwardDate}&returnDate=${returnDate}&tripType=${flightTripType}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Flights</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* HOTELS */}
              {searchType === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <FieldLabel icon={MapPin} text="Location" />
                    <Input placeholder="City, hotel, or landmark" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} />
                  </div>
                  <div className="relative" ref={checkinCalRef}>
                    <FieldLabel icon={Calendar} text="Check-in" />
                    <button onClick={() => { setShowCheckinCal(v => !v); setShowCheckoutCal(false); }}
                      className="w-full h-10 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 flex items-center gap-2 transition-colors">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className={onwardDate ? "text-slate-800" : "text-slate-400"}>{onwardDate || "Select"}</span>
                    </button>
                    {showCheckinCal && (
                      <div className="absolute top-full left-0 mt-1 z-[200]">
                        <PriceCalendar type="hotel" destination={destination} selectedDate={onwardDate}
                          onSelectDate={d => { setOnwardDate(d); setShowCheckinCal(false); if (returnDate && d >= returnDate) setReturnDate(""); }} />
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={checkoutCalRef}>
                    <FieldLabel icon={Calendar} text="Check-out" />
                    <button onClick={() => { setShowCheckoutCal(v => !v); setShowCheckinCal(false); }}
                      className="w-full h-10 border border-input rounded-xl px-3 text-sm text-left bg-white hover:bg-slate-50 flex items-center gap-2 transition-colors">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className={returnDate ? "text-slate-800" : "text-slate-400"}>{returnDate || "Select"}</span>
                    </button>
                    {showCheckoutCal && (
                      <div className="absolute top-full right-0 mt-1 z-[200]">
                        <PriceCalendar type="hotel" destination={destination} selectedDate={returnDate} minDate={onwardDate}
                          onSelectDate={d => { setReturnDate(d); setShowCheckoutCal(false); }} />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("HotelSearch")}?location=${destination}&checkIn=${onwardDate}&checkOut=${returnDate}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Find Hotels</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* TOURS */}
              {searchType === "tours" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="Destination" /><Input placeholder="e.g. Palawan, Bali, Paris" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div><FieldLabel icon={Calendar} text="Travel Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div>
                    <FieldLabel icon={Compass} text="Category" />
                    <Select value={tripType} onValueChange={setTripType}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Any" /></SelectTrigger>
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
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("Tours")}?destination=${destination}&category=${tripType}&date=${onwardDate}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Tour Packages</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* BUS */}
              {searchType === "bus" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div><FieldLabel icon={MapPin} text="From" /><Input placeholder="e.g. Manila" className="rounded-xl" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
                  <div><FieldLabel icon={MapPin} text="To" /><Input placeholder="e.g. Baguio" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div><FieldLabel icon={Calendar} text="Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div className="flex items-end">
                    <Link to={`${createPageUrl("BusSearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Buses</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* FERRY */}
              {searchType === "ferry" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div><FieldLabel icon={MapPin} text="From Port" /><Input placeholder="e.g. Manila, Batangas" className="rounded-xl" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
                  <div><FieldLabel icon={MapPin} text="To Port" /><Input placeholder="e.g. Cebu, Coron" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div><FieldLabel icon={Calendar} text="Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div className="flex items-end">
                    <Link to={`${createPageUrl("FerrySearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Ferries</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* CRUISE */}
              {searchType === "cruise" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="Destination" /><Input placeholder="e.g. Caribbean, Mediterranean" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div><FieldLabel icon={Calendar} text="Departure" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div>
                    <FieldLabel icon={Ship} text="Duration" />
                    <Select value={tripType} onValueChange={setTripType}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (2-5 nights)</SelectItem>
                        <SelectItem value="medium">Medium (6-9 nights)</SelectItem>
                        <SelectItem value="long">Long (10+ nights)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("CruiseSearch")}?destination=${destination}&date=${onwardDate}&duration=${tripType}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Cruises</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* VISA */}
              {searchType === "visa" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="Destination Country" /><Input placeholder="e.g. Japan, USA, Schengen" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div>
                    <FieldLabel icon={Umbrella} text="Visa Type" />
                    <Select value={tripType} onValueChange={setTripType}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourism">Tourist</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="study">Student</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="transit">Transit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><FieldLabel icon={Calendar} text="Travel Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("Visas")}?country=${destination}&type=${tripType}&date=${onwardDate}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Apply for Visa</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* CAR RENTAL */}
              {searchType === "car" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="Pick-up Location" /><Input placeholder="e.g. Manila, Cebu" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel icon={Calendar} text="Pick-up Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel icon={Calendar} text="Return Date" /><Input type="date" className="rounded-xl cursor-pointer" value={returnDate} onChange={e => setReturnDate(e.target.value)} min={onwardDate} /></div>
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("CarRentalSearch")}?location=${destination}&pickupDate=${onwardDate}&returnDate=${returnDate}`}>
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Find Cars</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* TRAIN */}
              {searchType === "train" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="From Station" /><Input placeholder="e.g. Paris, Tokyo" className="rounded-xl" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
                  <div className="md:col-span-2"><FieldLabel icon={MapPin} text="To Station" /><Input placeholder="e.g. London, Osaka" className="rounded-xl" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div className="md:col-span-4"><FieldLabel icon={Calendar} text="Date" /><Input type="date" className="rounded-xl cursor-pointer" value={onwardDate} onChange={e => setOnwardDate(e.target.value)} /></div>
                  <div className="md:col-span-4">
                    <Link to={`${createPageUrl("TrainSearch")}?origin=${origin}&destination=${destination}&date=${onwardDate}`} className="w-full">
                      <Button className={BTN_SEARCH}><Search className="w-4 h-4 mr-2" />Search Trains</Button>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-4 flex items-center gap-6 text-white/70 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Real-time Prices</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />300+ Airlines</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Verified Hotels</span>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, i) => (
          <button key={i} onClick={() => setCurrentImage(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImage ? "w-8 bg-amber-400" : "w-4 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
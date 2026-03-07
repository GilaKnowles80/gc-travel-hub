import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Search, Calendar, ChevronLeft, ChevronRight, Sparkles, Tag, Star, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import AirportInput from "@/components/flights/AirportInput";
import FeaturedDealCard from "@/components/flights/FeaturedDealCard";
import FeaturedDealBookingModal from "@/components/flights/FeaturedDealBookingModal";
import moment from "moment";

const POPULAR_ROUTES = [
  { from: "MNL", fromCity: "Manila", to: "SIN", toCity: "Singapore" },
  { from: "MNL", fromCity: "Manila", to: "HKG", toCity: "Hong Kong" },
  { from: "MNL", fromCity: "Manila", to: "DXB", toCity: "Dubai" },
  { from: "MNL", fromCity: "Manila", to: "LAX", toCity: "Los Angeles" },
  { from: "MNL", fromCity: "Manila", to: "NRT", toCity: "Tokyo" },
  { from: "MNL", fromCity: "Manila", to: "SYD", toCity: "Sydney" },
];

export default function BookFlights() {
  const [user, setUser] = useState(null);
  const [tripType, setTripType] = useState("roundtrip");
  const [origin, setOrigin] = useState("MNL");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(moment().add(14, "days").format("YYYY-MM-DD"));
  const [returnDate, setReturnDate] = useState(moment().add(21, "days").format("YYYY-MM-DD"));
  const [adults, setAdults] = useState("1");
  const [cabin, setCabin] = useState("economy");
  const [showDepartCal, setShowDepartCal] = useState(false);
  const [showReturnCal, setShowReturnCal] = useState(false);
  const [departMonth, setDepartMonth] = useState(moment().add(14, "days"));
  const [returnMonth, setReturnMonth] = useState(moment().add(21, "days"));
  const [activeTab, setActiveTab] = useState("deals"); // "deals" | "search"
  const [searchProvider, setSearchProvider] = useState("duffel"); // "duffel" | "amadeus" | "wanderlinx" | "tripzynx"
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loginRequired, setLoginRequired] = useState(false);

  const departCalRef = useRef(null);
  const returnCalRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    const handler = (e) => {
      if (departCalRef.current && !departCalRef.current.contains(e.target)) setShowDepartCal(false);
      if (returnCalRef.current && !returnCalRef.current.contains(e.target)) setShowReturnCal(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch featured deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["featured-flight-deals"],
    queryFn: () => base44.entities.FeaturedFlightDeal.filter({ status: "active" }, "-created_date"),
  });

  const renderCalendarDays = (month) => {
    const daysInMonth = month.daysInMonth();
    const firstDay = moment(month).startOf("month").day();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(moment(month).date(day));
    return days;
  };

  const handleBookDeal = (deal) => {
    if (!user) {
      setLoginRequired(true);
      setSelectedDeal(deal);
      return;
    }
    setSelectedDeal(deal);
  };

  const PROVIDER_PAGES = {
    duffel: "Flights",
    amadeus: "FlightSearch",
    wanderlinx: "WanderlinxPortal",
    tripzynx: "TripzynxPortal",
  };

  const handleSearchRedirect = () => {
    if (searchProvider === "wanderlinx") {
      window.location.href = createPageUrl("WanderlinxPortal");
      return;
    }
    if (searchProvider === "tripzynx") {
      window.location.href = createPageUrl("TripzynxPortal");
      return;
    }
    const params = new URLSearchParams({
      origin,
      destination,
      departDate: departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : "",
      adults,
      cabin,
      tripType,
    });
    const targetPage = searchProvider === "amadeus" ? "FlightSearch" : "Flights";
    window.location.href = createPageUrl(targetPage) + "?" + params.toString();
  };

  const featuredDeals = deals.filter(d => d.is_featured);
  const allDeals = deals;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <Plane key={i} className="absolute text-white" style={{ top: `${10 + i * 15}%`, left: `${5 + i * 17}%`, width: 40 + i * 8, height: 40 + i * 8, transform: `rotate(${i * 30}deg)` }} />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
              GC Travel & Tours — Official Booking
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Book Your Flight<br />
              <span className="text-amber-400">Directly With Us</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              Best prices guaranteed. GCash, credit card accepted. Trusted by thousands of Filipino travelers.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab("deals")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "deals" ? "bg-amber-500 text-white shadow-lg" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            >
              <Tag className="w-4 h-4" /> Featured Deals
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "search" ? "bg-amber-500 text-white shadow-lg" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            >
              <Search className="w-4 h-4" /> Search All Flights
            </button>
          </div>

          {/* Search Form */}
          {activeTab === "search" && (
            <Card className="p-5 bg-white/95 backdrop-blur rounded-2xl max-w-4xl mx-auto">
              <div className="space-y-3">
                {/* Provider Selector */}
                <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium self-center">Search via:</span>
                  {[
                    { id: "duffel", label: "Duffel", emoji: "🌐" },
                    { id: "amadeus", label: "Amadeus", emoji: "✈️" },
                    { id: "wanderlinx", label: "Wanderlinx", emoji: "🧳" },
                    { id: "tripzynx", label: "Tripzynx", emoji: "🗺️" },
                  ].map(p => (
                    <button key={p.id} onClick={() => setSearchProvider(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${searchProvider === p.id ? "bg-amber-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      <span>{p.emoji}</span>{p.label}
                    </button>
                  ))}
                </div>

                {(searchProvider === "wanderlinx" || searchProvider === "tripzynx") ? (
                  <div className="text-center py-6">
                    <p className="text-slate-600 text-sm mb-4">
                      {searchProvider === "wanderlinx"
                        ? "Search flights directly on the Wanderlinx portal with your agency credentials."
                        : "Search flights directly on the Tripzynx portal with your agency credentials."}
                    </p>
                    <Button onClick={handleSearchRedirect} className="bg-amber-500 hover:bg-amber-600 text-white px-8">
                      Open {searchProvider === "wanderlinx" ? "Wanderlinx" : "Tripzynx"} Portal →
                    </Button>
                  </div>
                ) : (
                <>
                <div className="flex gap-2">
                  {["oneway", "roundtrip"].map(t => (
                    <button key={t} onClick={() => setTripType(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tripType === t ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {t === "oneway" ? "One Way" : "Round Trip"}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-slate-600 mb-1 block">From</Label>
                    <AirportInput value={origin} onChange={setOrigin} placeholder="Manila (MNL)" />
                  </div>
                  <button onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp); }} className="px-2 py-2 border rounded-lg hover:bg-slate-50 self-end h-10">
                    <span className="text-base">⇄</span>
                  </button>
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-slate-600 mb-1 block">To</Label>
                    <AirportInput value={destination} onChange={setDestination} placeholder="Singapore (SIN)" />
                  </div>

                  {/* Depart */}
                  <div className="w-36 relative" ref={departCalRef}>
                    <Label className="text-xs font-semibold text-slate-600 mb-1 block">Depart</Label>
                    <button onClick={() => { setShowDepartCal(v => !v); setShowReturnCal(false); }} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs text-left flex items-center gap-2 hover:shadow-md">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {moment(departureDate).format("MMM DD")}
                    </button>
                    {showDepartCal && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border p-3 w-64 z-50">
                        <div className="flex justify-between items-center mb-2">
                          <button onClick={() => setDepartMonth(m => moment(m).subtract(1, "month"))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-sm font-bold">{departMonth.format("MMMM YYYY")}</span>
                          <button onClick={() => setDepartMonth(m => moment(m).add(1, "month"))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-xs text-slate-500 text-center mb-1">
                          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {renderCalendarDays(departMonth).map((day, i) => (
                            <button key={i} disabled={!day || day.isBefore(moment(), "day")} onClick={() => { if (day && !day.isBefore(moment(), "day")) { setDepartureDate(day.format("YYYY-MM-DD")); setShowDepartCal(false); } }}
                              className={`h-7 text-xs rounded ${!day ? "" : day.format("YYYY-MM-DD") === departureDate ? "bg-amber-500 text-white font-bold" : day.isBefore(moment(), "day") ? "text-slate-300" : "hover:bg-amber-100 text-slate-700"}`}>
                              {day?.date()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Return */}
                  {tripType === "roundtrip" && (
                    <div className="w-36 relative" ref={returnCalRef}>
                      <Label className="text-xs font-semibold text-slate-600 mb-1 block">Return</Label>
                      <button onClick={() => { setShowReturnCal(v => !v); setShowDepartCal(false); }} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs text-left flex items-center gap-2 hover:shadow-md">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {returnDate ? moment(returnDate).format("MMM DD") : "Select"}
                      </button>
                      {showReturnCal && (
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border p-3 w-64 z-50">
                          <div className="flex justify-between items-center mb-2">
                            <button onClick={() => setReturnMonth(m => moment(m).subtract(1, "month"))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-sm font-bold">{returnMonth.format("MMMM YYYY")}</span>
                            <button onClick={() => setReturnMonth(m => moment(m).add(1, "month"))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-7 gap-0.5 text-xs text-slate-500 text-center mb-1">
                            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
                          </div>
                          <div className="grid grid-cols-7 gap-0.5">
                            {renderCalendarDays(returnMonth).map((day, i) => (
                              <button key={i} disabled={!day || day.isBefore(moment(departureDate), "day")} onClick={() => { if (day && !day.isBefore(moment(departureDate), "day")) { setReturnDate(day.format("YYYY-MM-DD")); setShowReturnCal(false); } }}
                                className={`h-7 text-xs rounded ${!day ? "" : day.format("YYYY-MM-DD") === returnDate ? "bg-amber-500 text-white font-bold" : day.isBefore(moment(departureDate), "day") ? "text-slate-300" : "hover:bg-amber-100 text-slate-700"}`}>
                                {day?.date()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Adults + Class */}
                  <div className="w-20">
                    <Label className="text-xs font-semibold text-slate-600 mb-1 block">Pax</Label>
                    <Select value={adults} onValueChange={setAdults}>
                      <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Label className="text-xs font-semibold text-slate-600 mb-1 block">Class</Label>
                    <Select value={cabin} onValueChange={setCabin}>
                      <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">Premium</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSearchRedirect} disabled={!origin || !destination} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11">
                  <Search className="w-4 h-4 mr-2" /> Search via {searchProvider === "amadeus" ? "Amadeus" : "Duffel"}
                </Button>
                </>
                )}
              </div>
            </Card>
          )}
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Popular Routes */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Popular Routes</h2>
          <div className="flex gap-2 flex-wrap">
            {POPULAR_ROUTES.map((r, i) => (
              <button key={i} onClick={() => { setOrigin(r.from); setDestination(r.to); setActiveTab("search"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm">
                <span className="font-semibold text-slate-700">{r.fromCity}</span>
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span className="font-semibold text-slate-700">{r.toCity}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Deals */}
        {activeTab === "deals" && (
          <>
            {/* Login notice for guests */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Login to Book</p>
                  <p className="text-xs text-amber-700">Browse deals freely. Login or create an account to complete your booking.</p>
                </div>
                <Button size="sm" onClick={() => base44.auth.redirectToLogin(window.location.href)} className="ml-auto bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                  Login / Sign Up
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                Our Featured Flight Deals
              </h2>
              <Badge className="bg-green-100 text-green-700 border-0">{allDeals.length} deals available</Badge>
            </div>

            {dealsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : allDeals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <Plane className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Featured Deals Yet</h3>
                <p className="text-slate-400 text-sm mb-4">Check back soon — we add new deals regularly!</p>
                <Button onClick={() => setActiveTab("search")} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Search Live Flights Instead
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {allDeals.map((deal, i) => (
                    <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <FeaturedDealCard deal={deal} onBook={handleBookDeal} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Trust Signals */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-center font-bold text-slate-700 mb-5">Why Book with GC Travel?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🔒", title: "Secure Payments", desc: "GCash, Stripe & more" },
              { icon: "✈️", title: "Best Price Guarantee", desc: "We match any lower price" },
              { icon: "📱", title: "Instant Confirmation", desc: "E-ticket sent immediately" },
              { icon: "🤝", title: "24/7 Support", desc: "Always here to help" },
            ].map((item, i) => (
              <div key={i} className="text-center p-3">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {loginRequired && !user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Login to Book</h3>
            <p className="text-slate-600 text-sm mb-4">Please log in or create an account to complete your flight booking.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setLoginRequired(false); setSelectedDeal(null); }} className="flex-1">Cancel</Button>
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">Login / Sign Up</Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDeal && user && (
        <FeaturedDealBookingModal
          deal={selectedDeal}
          user={user}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
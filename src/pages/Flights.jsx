import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Clock, Calendar, PackageOpen, Sparkles, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import FlightFilters from "../components/flights/FlightFilters";
import PriceTrackingBadge from "../components/shared/PriceTrackingBadge";
import DiscoverFlights from "../components/flights/DiscoverFlights";
import AdBanner from "../components/ads/AdBanner";
import PriceDisplay from "../components/currency/PriceDisplay";
import moment from "moment";

export default function Flights() {
  const queryClient = useQueryClient();
  const [showAIDiscovery, setShowAIDiscovery] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const [searchParams, setSearchParams] = useState({
    origin: urlParams.get('origin') || "MNL",
    destination: urlParams.get('destination') || "SIN",
    departureDate: urlParams.get('departDate') || moment().add(7, 'days').format('YYYY-MM-DD'),
    returnDate: urlParams.get('returnDate') || "",
    adults: Number(urlParams.get('adults')) || 1,
    children: 0,
    infants: 0,
    cabin: urlParams.get('cabin') || "economy"
  });
  const [filters, setFilters] = useState({
    search: "",
    cabin_class: "all",
    is_direct: "all",
    airline: "all",
    departure_time: "all",
    price_max: 5000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["realtime-flights"] });
  };

  // Fetch real-time flights from Duffel
  const { data: flightData, isLoading, error } = useQuery({
    queryKey: ["realtime-flights", searchParams],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('searchFlightsDuffel', searchParams);
        
        // Transform Duffel offers to app format
        const flights = response.data.offers?.map((offer, idx) => ({
          id: `duffel_${idx}`,
          duffel_id: offer.id,
          airline_name: offer.owner.name,
          flight_number: offer.slices[0]?.segments[0]?.operating_carrier_flight_number || 'N/A',
          origin: offer.slices[0]?.origin.iata_code,
          destination: offer.slices[0]?.destination.iata_code,
          departure_time: offer.slices[0]?.segments[0]?.departing_at,
          arrival_time: offer.slices[0]?.segments[offer.slices[0].segments.length - 1]?.arriving_at,
          duration_hours: (new Date(offer.slices[0]?.segments[offer.slices[0].segments.length - 1]?.arriving_at) - new Date(offer.slices[0]?.segments[0]?.departing_at)) / (1000 * 60 * 60),
          is_direct: offer.slices[0]?.segments?.length === 1,
          stops: offer.slices[0]?.segments?.length - 1 || 0,
          price: parseFloat(offer.total_amount),
          currency: offer.total_currency,
          cabin_classes: [{ class: searchParams.cabin, price: parseFloat(offer.total_amount), seats_available: 9 }],
          baggage_allowance: '1 checked bag, 1 carry-on',
          amenities: ['Seat selection', 'Online check-in'],
          status: 'active'
        })) || [];

        return { flights };
      } catch (err) {
        console.error("Duffel search failed:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const flights = flightData?.flights || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ 
      search: "", 
      cabin_class: "all", 
      is_direct: "all",
      airline: "all",
      departure_time: "all",
      price_max: 5000,
    });
  };

  const airlines = useMemo(() => {
    const uniqueAirlines = [...new Set(flights.map(f => f.airline_name).filter(Boolean))];
    return uniqueAirlines.sort();
  }, [flights]);

  const maxPrice = useMemo(() => {
    const prices = flights.flatMap(f => f.cabin_classes?.map(c => c.price) || []);
    return prices.length > 0 ? Math.max(...prices) : 5000;
  }, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (
          !flight.origin?.toLowerCase().includes(s) &&
          !flight.destination?.toLowerCase().includes(s) &&
          !flight.airline_name?.toLowerCase().includes(s)
        )
          return false;
      }
      if (filters.airline !== "all" && flight.airline_name !== filters.airline) {
        return false;
      }
      if (filters.cabin_class !== "all") {
        if (!flight.cabin_classes?.some((c) => c.class === filters.cabin_class)) return false;
      }
      if (filters.is_direct !== "all") {
        if (filters.is_direct === "true" && !flight.is_direct) return false;
        if (filters.is_direct === "false" && flight.is_direct) return false;
      }
      if (filters.departure_time !== "all") {
        const hour = new Date(flight.departure_time).getHours();
        if (filters.departure_time === "morning" && (hour < 6 || hour >= 12)) return false;
        if (filters.departure_time === "afternoon" && (hour < 12 || hour >= 18)) return false;
        if (filters.departure_time === "evening" && (hour < 18 || hour >= 24)) return false;
        if (filters.departure_time === "night" && (hour >= 6)) return false;
      }
      const lowestPrice = Math.min(...(flight.cabin_classes?.map((c) => c.price) || [Infinity]));
      if (lowestPrice > filters.price_max) return false;
      
      return true;
    });
  }, [flights, filters]);

  const handleSelectFlight = (flightId) => {
    window.location.href = createPageUrl("FlightDetail") + `?id=${flightId}`;
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <AdBanner placement="top_banner" pageName="Flights" />
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Book Your Flight</h1>
                <p className="text-slate-300">Real-time flight search powered by Duffel - 300+ airlines</p>
              </div>
              <Button
                onClick={() => setShowAIDiscovery(!showAIDiscovery)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showAIDiscovery ? "Hide" : "Discover with AI"}
              </Button>
            </div>

            {/* Search Form */}
            <Card className="p-6 bg-white/95 backdrop-blur">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    value={searchParams.origin}
                    onChange={(e) => setSearchParams({...searchParams, origin: e.target.value.toUpperCase()})}
                    placeholder="MNL"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams({...searchParams, destination: e.target.value.toUpperCase()})}
                    placeholder="SIN"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departure</Label>
                  <Input
                    type="date"
                    value={searchParams.departureDate}
                    onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
                    min={moment().format('YYYY-MM-DD')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return (Optional)</Label>
                  <Input
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                    min={searchParams.departureDate}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Select value={String(searchParams.adults)} onValueChange={(v) => setSearchParams({...searchParams, adults: Number(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Children</Label>
                  <Select value={String(searchParams.children)} onValueChange={(v) => setSearchParams({...searchParams, children: Number(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Infants</Label>
                  <Select value={String(searchParams.infants)} onValueChange={(v) => setSearchParams({...searchParams, infants: Number(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={searchParams.cabin} onValueChange={(v) => setSearchParams({...searchParams, cabin: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium_economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["realtime-flights"] })} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="mb-6">
          <AdBanner placement="in_content" pageName="Flights" />
        </div>
        
        {showAIDiscovery && (
          <div className="mb-6">
            <DiscoverFlights onSelectFlight={handleSelectFlight} />
          </div>
        )}

        <FlightFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClear={clearFilters}
          airlines={airlines}
          maxPrice={maxPrice} />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-600 mt-4">Searching real-time flights...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Search Error</h3>
            <p className="text-red-600 text-sm">{error.message || "Failed to search flights. Please try again."}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["realtime-flights"] })} variant="outline" className="mt-4 rounded-xl">
              Retry Search
            </Button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No flights found</h3>
            <p className="text-slate-400 mt-2">Try different dates or destinations, or adjust your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {filteredFlights.length} flight{filteredFlights.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-4 pb-16">
              <div className="mb-6">
                <AdBanner placement="sidebar" pageName="Flights" />
              </div>
              <AnimatePresence>
                {filteredFlights.map((flight, i) => {
                  const lowestPrice = Math.min(...(flight.cabin_classes?.map((c) => c.price) || [0]));
                  return (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={createPageUrl("FlightDetail") + `?id=${flight.id}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className="bg-slate-100 text-slate-700 border-0">
                                    {flight.airline_name}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {flight.flight_number}
                                  </Badge>
                                  {flight.is_direct && (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                      Direct
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-6">
                                  <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                      {moment(flight.departure_time).format("HH:mm")}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{flight.origin}</p>
                                  </div>

                                  <div className="flex-1 flex flex-col items-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                      <Clock className="w-3 h-3" />
                                      {flight.duration_hours}h
                                    </div>
                                    <div className="w-full h-px bg-slate-200 relative">
                                      <Plane className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                                    </div>
                                    {!flight.is_direct && flight.stops?.length > 0 && (
                                      <p className="text-xs text-slate-400 mt-1">
                                        {flight.stops.length} stop{flight.stops.length > 1 ? "s" : ""}
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">
                                      {moment(flight.arrival_time).format("HH:mm")}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{flight.destination}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  {moment(flight.departure_time).format("MMM DD, YYYY")}
                                </div>

                                <div className="mt-3">
                                  <PriceTrackingBadge 
                                    priceTracking={flight.price_tracking} 
                                    listingPrice={lowestPrice}
                                  />
                                </div>
                              </div>

                              <div className="md:border-l md:pl-6 md:ml-6 text-center md:text-right">
                                <p className="text-xs text-slate-400 mb-1">from</p>
                                <p className="text-3xl font-bold text-slate-900"><PriceDisplay amount={lowestPrice} fromCurrency="USD" /></p>
                                <p className="text-xs text-slate-400 mt-1">per person</p>
                                <div className="text-xs text-slate-500 mt-2">
                                  {flight.cabin_classes?.length || 0} cabin options
                                </div>
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
    </PullToRefresh>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Search, Loader2, Clock, ArrowRight, RefreshCw, Calendar, DollarSign, MapPin } from "lucide-react";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { toast } from "sonner";

export default function LiveItineraries() {
  const { convert, formatPrice, currency } = useCurrency();
  const [form, setForm] = useState({
    origin: "MNL",
    destination: "CEB",
    departureDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    returnDate: "",
    adults: 1,
    cabin: "economy",
  });
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [lastSearched, setLastSearched] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const searchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("searchFlightsDuffel", {
        origin: form.origin,
        destination: form.destination,
        departureDate: form.departureDate,
        returnDate: form.returnDate || undefined,
        adults: form.adults,
        cabin: form.cabin,
      });
      if (response.data?.offers?.length > 0) {
        setOffers(response.data.offers);
        setLastSearched(new Date().toLocaleTimeString());
        toast.success(`Found ${response.data.offers.length} live flight offers`);
      } else if (response.data?.error) {
        toast.error(response.data.error);
        setOffers([]);
      } else {
        setOffers([]);
        toast.info("No flights found for this route and date");
      }
    } catch (err) {
      toast.error("Flight search failed. Please try again.");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [form]);

  // Auto-refresh every 60 seconds when enabled
  useEffect(() => {
    if (!autoRefresh || offers.length === 0) return;
    const interval = setInterval(() => {
      searchFlights();
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, offers.length, searchFlights]);

  const formatDuration = (hours) => {
    if (!hours) return "—";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">LIVE · Real-Time Duffel API</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Live Flight Itineraries
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search and book real-time flight itineraries powered by Duffel. Prices update live.
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-600" />
              Search Live Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="origin">From (IATA)</Label>
                <Input id="origin" name="origin" value={form.origin} onChange={handleChange}
                  placeholder="MNL" maxLength={3} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">To (IATA)</Label>
                <Input id="destination" name="destination" value={form.destination} onChange={handleChange}
                  placeholder="CEB" maxLength={3} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="departureDate">Departure</Label>
                <Input id="departureDate" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="returnDate">Return (optional)</Label>
                <Input id="returnDate" name="returnDate" type="date" value={form.returnDate} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adults">Passengers</Label>
                <Input id="adults" name="adults" type="number" min="1" max="9" value={form.adults} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cabin">Cabin</Label>
                <select id="cabin" name="cabin" value={form.cabin} onChange={handleChange}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={searchFlights} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</> : <><Search className="w-4 h-4 mr-2" /> Search Flights</>}
              </Button>
              {offers.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
                  Auto-refresh every 60s
                </label>
              )}
              {lastSearched && (
                <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last updated: {lastSearched}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            <p className="text-slate-600 dark:text-slate-400">Fetching live flight offers from Duffel...</p>
          </div>
        ) : offers.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {offers.length} Live {offers.length === 1 ? "Offer" : "Offers"}
              </h2>
              <Button variant="outline" size="sm" onClick={searchFlights} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
            {offers.map((offer, idx) => {
              const slices = offer.slices || [];
              const outbound = slices[0];
              const returnSlice = slices[1];
              const segments = outbound?.segments || [];
              const firstSeg = segments[0];
              const lastSeg = segments[segments.length - 1];
              const convertedPrice = convert(offer.price, offer.currency || "USD");

              return (
                <Card key={offer.id || idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Airline + Route */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                          <Plane className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{offer.airline_name || "Airline"}</p>
                          <p className="text-xs text-slate-500">{offer.flight_number} · {offer.is_direct ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}</p>
                        </div>
                      </div>

                      {/* Outbound */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="text-center">
                          <p className="font-bold text-slate-900 dark:text-white">{formatTime(firstSeg?.departing_at)}</p>
                          <p className="text-xs text-slate-500">{outbound?.origin?.iata_code || form.origin}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-2">
                          <Clock className="w-3 h-3 text-slate-400 mb-0.5" />
                          <div className="h-px bg-slate-200 dark:bg-slate-700 w-full relative">
                            <Plane className="w-3 h-3 text-amber-500 absolute -top-1.5 right-0" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{formatDuration(offer.duration_hours)}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-900 dark:text-white">{formatTime(lastSeg?.arriving_at)}</p>
                          <p className="text-xs text-slate-500">{outbound?.destination?.iata_code || form.destination}</p>
                        </div>
                      </div>

                      {/* Return info if roundtrip */}
                      {returnSlice && (
                        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 flex-1">
                          <Calendar className="w-3 h-3" />
                          Return: {formatDate(returnSlice.segments?.[0]?.departing_at)}
                        </div>
                      )}

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">
                          {formatPrice ? formatPrice(convertedPrice) : `$${convertedPrice?.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-slate-500">{currency} · per person</p>
                      </div>
                    </div>

                    {/* Segments detail */}
                    {segments.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        {segments.map((seg, sIdx) => (
                          <span key={sIdx} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {seg.departing_at ? formatTime(seg.departing_at) : ""} {seg.origin?.iata_code || ""} → {seg.destination?.iata_code || ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !loading && (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <Plane className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500">Search for live flight itineraries above</p>
              <p className="text-xs text-slate-400">Enter origin, destination, and departure date to see real-time offers from Duffel</p>
            </CardContent>
          </Card>
        )}

        {/* Info banner */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 flex items-start gap-3 border border-blue-100 dark:border-blue-900">
          <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">Real-Time Booking with Duffel</p>
            <p>Flight offers are fetched live from Duffel's API. Prices and availability update in real time.
            Select a flight on the Flights page to complete your booking with PayPal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
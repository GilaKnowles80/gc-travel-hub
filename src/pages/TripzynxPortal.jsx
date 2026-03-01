import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, RefreshCw, AlertTriangle, Globe, Search, MapPin, Users, Calendar, Star, Tag, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TripzynxPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchParams, setSearchParams] = useState({ destination: "", category: "", departure_date: "", travelers: 1 });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  // Booking state
  const [selectedTour, setSelectedTour] = useState(null);
  const [booking, setBooking] = useState({ contact_name: "", contact_email: "", contact_phone: "", special_requests: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500">This page is for admin and staff only.</p>
      </div>
    );
  }

  const handleSearch = async () => {
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const res = await base44.functions.invoke('tripzynxSearch', searchParams);
      setResults(res.data?.results || []);
      if ((res.data?.results || []).length === 0) setSearchError("No tours found. Try different filters.");
    } catch (e) {
      setSearchError(e.message || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleBook = async () => {
    if (!selectedTour || !booking.contact_name || !booking.contact_email) return;
    setBookingLoading(true);
    setBookingResult(null);
    try {
      const res = await base44.functions.invoke('tripzynxBook', {
        tour_id: selectedTour.id,
        contact_name: booking.contact_name,
        contact_email: booking.contact_email,
        contact_phone: booking.contact_phone,
        special_requests: booking.special_requests,
        departure_date: searchParams.departure_date,
        travelers_list: Array(Number(searchParams.travelers)).fill({ type: "adult" }),
      });
      setBookingResult(res.data);
      setActiveTab("confirmation");
    } catch (e) {
      setSearchError(e.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const CATEGORIES = ["beach", "adventure", "cultural", "cruise", "wildlife", "city_tour", "pilgrimage", "honeymoon"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Tripzynx Portal</h1>
            <p className="text-indigo-200 text-xs">Tour Management & Booking System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 text-white text-xs">Connected</Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 gap-2"
            onClick={() => window.open('https://tripzynx.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Tripzynx.com
          </Button>
        </div>
      </div>

      {/* Credentials Banner */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2 flex items-center gap-6 text-xs text-indigo-700">
        <span className="font-semibold">Logged in as:</span>
        <span>Username: <span className="font-mono font-bold">{import.meta.env?.TRIPZYNX_USERNAME || 'gctraveltours'}</span></span>
        <span>Supplier: <span className="font-mono font-bold">Tripzynx</span></span>
        <span className="ml-auto text-indigo-400">GC Travel & Tours Agency Integration</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-0 z-10 shadow-sm">
        {[
          { id: "search", label: "🔍 Search Tours" },
          { id: "book", label: "📋 Book Tour", disabled: !selectedTour },
          { id: "confirmation", label: "✅ Confirmation", disabled: !bookingResult },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-700"
                : tab.disabled
                  ? "border-transparent text-slate-300 cursor-not-allowed"
                  : "border-transparent text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── SEARCH TAB ── */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600" /> Search Available Tours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <Label>Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        placeholder="e.g. Boracay, Cebu, Palawan"
                        value={searchParams.destination}
                        onChange={e => setSearchParams(p => ({ ...p, destination: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select value={searchParams.category} onValueChange={v => setSearchParams(p => ({ ...p, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All Categories</SelectItem>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Departure Date</Label>
                    <Input
                      type="date"
                      value={searchParams.departure_date}
                      onChange={e => setSearchParams(p => ({ ...p, departure_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Travelers</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        className="pl-9"
                        value={searchParams.travelers}
                        onChange={e => setSearchParams(p => ({ ...p, travelers: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSearch} disabled={searching} className="bg-indigo-600 hover:bg-indigo-700">
                  {searching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching...</> : <><Search className="w-4 h-4 mr-2" />Search Tours</>}
                </Button>
              </CardContent>
            </Card>

            {searchError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{searchError}</div>
            )}

            {results.length > 0 && (
              <div>
                <p className="text-sm text-slate-500 mb-3">{results.length} tours found via Tripzynx</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map(tour => (
                    <Card
                      key={tour.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${selectedTour?.id === tour.id ? 'ring-2 ring-indigo-500' : ''}`}
                      onClick={() => { setSelectedTour(tour); setActiveTab("book"); }}
                    >
                      {tour.image_url && (
                        <img src={tour.image_url} alt={tour.title} className="w-full h-40 object-cover rounded-t-xl" />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">{tour.title}</h3>
                          {tour.rating && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-medium text-slate-600">{tour.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          {tour.destination}
                        </div>
                        {tour.category && (
                          <Badge className="bg-indigo-100 text-indigo-700 text-[10px] mb-2">
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {tour.category.replace('_', ' ')}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-lg font-bold text-indigo-700">₱{tour.price_per_person?.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">per person</p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {tour.duration_days}d
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-xs">
                          Select & Book
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BOOK TAB ── */}
        {activeTab === "book" && selectedTour && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tour Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTour.image_url && (
                  <img src={selectedTour.image_url} alt={selectedTour.title} className="w-full h-48 object-cover rounded-xl" />
                )}
                <h3 className="font-bold text-lg text-slate-800">{selectedTour.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {selectedTour.destination}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {selectedTour.duration_days} days
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Price per person</span>
                    <span className="font-bold">₱{selectedTour.price_per_person?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Travelers</span>
                    <span className="font-bold">{searchParams.travelers}</span>
                  </div>
                  <div className="border-t border-indigo-200 mt-2 pt-2 flex justify-between">
                    <span className="font-bold text-indigo-700">Total</span>
                    <span className="font-bold text-indigo-700 text-lg">
                      ₱{(selectedTour.price_per_person * Number(searchParams.travelers)).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSelectedTour(null); setActiveTab("search"); }} className="w-full mt-2">
                  ← Change Tour
                </Button>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Contact person name"
                    value={booking.contact_name}
                    onChange={e => setBooking(p => ({ ...p, contact_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={booking.contact_email}
                    onChange={e => setBooking(p => ({ ...p, contact_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+63 9XX XXX XXXX"
                    value={booking.contact_phone}
                    onChange={e => setBooking(p => ({ ...p, contact_phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Special Requests</Label>
                  <Input
                    placeholder="Dietary needs, accessibility, etc."
                    value={booking.special_requests}
                    onChange={e => setBooking(p => ({ ...p, special_requests: e.target.value }))}
                  />
                </div>

                {searchError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{searchError}</div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={bookingLoading || !booking.contact_name || !booking.contact_email}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {bookingLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Booking...</>
                    : <>Confirm Booking via Tripzynx</>
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── CONFIRMATION TAB ── */}
        {activeTab === "confirmation" && bookingResult && (
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-green-200">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
                <p className="text-slate-500 text-sm">Your Tripzynx booking has been created successfully.</p>

                <div className="bg-indigo-50 rounded-xl p-5 text-left space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Reference</span>
                    <span className="font-bold font-mono text-indigo-700">{bookingResult.reference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tour</span>
                    <span className="font-semibold text-right max-w-[60%]">{bookingResult.tour_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Destination</span>
                    <span className="font-semibold">{bookingResult.destination}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Travelers</span>
                    <span className="font-semibold">{bookingResult.travelers_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Departure</span>
                    <span className="font-semibold">{bookingResult.departure_date || 'TBD'}</span>
                  </div>
                  <div className="border-t border-indigo-200 pt-3 flex justify-between">
                    <span className="font-bold text-slate-700">Total Price</span>
                    <span className="font-bold text-indigo-700 text-lg">₱{bookingResult.total_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <Badge className="bg-amber-100 text-amber-700">Pending Payment</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Supplier</span>
                    <Badge className="bg-indigo-100 text-indigo-700">Tripzynx</Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setSelectedTour(null); setBookingResult(null); setResults([]); setActiveTab("search"); }}
                  >
                    New Search
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => window.open('https://tripzynx.com', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Tripzynx
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
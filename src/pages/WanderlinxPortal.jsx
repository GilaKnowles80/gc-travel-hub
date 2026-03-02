import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, AlertTriangle, Globe, Search, MapPin, Users, Calendar, Hotel, Plane, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function WanderlinxPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchParams, setSearchParams] = useState({
    search_type: "hotel",
    origin: "",
    destination: "",
    check_in: "",
    check_out: "",
    guests: 1,
  });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  // Booking state
  const [selectedItem, setSelectedItem] = useState(null);
  const [guestDetails, setGuestDetails] = useState({ name: "", email: "", phone: "" });
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
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
      const res = await base44.functions.invoke('wanderlinxSearch', searchParams);
      const data = res.data?.results;
      const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setResults(list);
      if (list.length === 0) setSearchError("No results found. Try different search criteria.");
    } catch (e) {
      setSearchError(e.message || "Search failed. Please check your Wanderlinx credentials and try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleBook = async () => {
    if (!selectedItem || !guestDetails.name || !guestDetails.email) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      const res = await base44.functions.invoke('wanderlinxBook', {
        booking_type: searchParams.search_type,
        item_id: selectedItem.id || selectedItem.hotel_id || selectedItem.flight_id,
        guest_details: guestDetails,
        special_requests: specialRequests,
      });
      setBookingResult(res.data);
      setActiveTab("confirmation");
    } catch (e) {
      setBookingError(e.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const typeIcon = searchParams.search_type === "flight" ? Plane : Hotel;
  const TypeIcon = typeIcon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Wanderlinx Portal</h1>
            <p className="text-teal-200 text-xs">Hotel & Flight Booking Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 text-white text-xs">Connected</Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 gap-2"
            onClick={() => window.open('https://mywanderlinx.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            mywanderlinx.com
          </Button>
        </div>
      </div>

      {/* Credentials Banner */}
      <div className="bg-teal-50 border-b border-teal-100 px-6 py-2 flex items-center gap-6 text-xs text-teal-700">
        <span className="font-semibold">Supplier:</span>
        <span>Wanderlinx (Hotels & Flights)</span>
        <span className="ml-auto text-teal-400">GC Travel & Tours Agency Integration</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-0 z-10 shadow-sm">
        {[
          { id: "search", label: "🔍 Search" },
          { id: "book", label: "📋 Book", disabled: !selectedItem },
          { id: "confirmation", label: "✅ Confirmation", disabled: !bookingResult },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-teal-600 text-teal-700"
                : tab.disabled
                  ? "border-transparent text-slate-300 cursor-not-allowed"
                  : "border-transparent text-slate-600 hover:text-teal-600 hover:border-teal-300"
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
                  <Search className="w-4 h-4 text-teal-600" /> Search via Wanderlinx
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Type Selector */}
                <div className="flex gap-2 mb-5">
                  {["hotel", "flight"].map(type => (
                    <button
                      key={type}
                      onClick={() => setSearchParams(p => ({ ...p, search_type: type }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        searchParams.search_type === type
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                      }`}
                    >
                      {type === "hotel" ? <Hotel className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {searchParams.search_type === "flight" && (
                    <div className="space-y-1">
                      <Label>Origin</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          className="pl-9"
                          placeholder="e.g. MNL, CEB"
                          value={searchParams.origin}
                          onChange={e => setSearchParams(p => ({ ...p, origin: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>{searchParams.search_type === "flight" ? "Destination" : "City / Destination"}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        placeholder={searchParams.search_type === "flight" ? "e.g. SIN, KUL" : "e.g. Cebu, Boracay"}
                        value={searchParams.destination}
                        onChange={e => setSearchParams(p => ({ ...p, destination: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>{searchParams.search_type === "hotel" ? "Check-in Date" : "Departure Date"}</Label>
                    <Input
                      type="date"
                      value={searchParams.check_in}
                      onChange={e => setSearchParams(p => ({ ...p, check_in: e.target.value }))}
                    />
                  </div>
                  {searchParams.search_type === "hotel" && (
                    <div className="space-y-1">
                      <Label>Check-out Date</Label>
                      <Input
                        type="date"
                        value={searchParams.check_out}
                        onChange={e => setSearchParams(p => ({ ...p, check_out: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>Guests / Passengers</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        className="pl-9"
                        value={searchParams.guests}
                        onChange={e => setSearchParams(p => ({ ...p, guests: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSearch} disabled={searching} className="bg-teal-600 hover:bg-teal-700">
                  {searching
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching Wanderlinx...</>
                    : <><Search className="w-4 h-4 mr-2" />Search</>}
                </Button>
              </CardContent>
            </Card>

            {searchError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {searchError}
              </div>
            )}

            {results.length > 0 && (
              <div>
                <p className="text-sm text-slate-500 mb-3">{results.length} result(s) from Wanderlinx</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((item, idx) => (
                    <Card
                      key={item.id || idx}
                      className={`cursor-pointer transition-all hover:shadow-lg ${selectedItem?.id === item.id ? 'ring-2 ring-teal-500' : ''}`}
                      onClick={() => { setSelectedItem(item); setActiveTab("book"); }}
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name || item.title} className="w-full h-40 object-cover rounded-t-xl" />
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">{item.name || item.title || `Result ${idx + 1}`}</h3>
                        {item.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </div>
                        )}
                        {item.price && (
                          <p className="text-lg font-bold text-teal-700">
                            ₱{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                          </p>
                        )}
                        <Button size="sm" className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-xs">
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
        {activeTab === "book" && selectedItem && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Item Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-teal-600" />
                  Selected {searchParams.search_type === "hotel" ? "Hotel" : "Flight"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedItem.image_url && (
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-48 object-cover rounded-xl" />
                )}
                <h3 className="font-bold text-lg text-slate-800">
                  {selectedItem.name || selectedItem.title || "Selected Item"}
                </h3>
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-teal-500" />
                    {selectedItem.location}
                  </div>
                )}
                {searchParams.check_in && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-teal-500" />
                    {searchParams.check_in}
                    {searchParams.check_out && ` → ${searchParams.check_out}`}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-teal-500" />
                  {searchParams.guests} guest(s)
                </div>
                {selectedItem.price && (
                  <div className="bg-teal-50 rounded-xl p-4 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-teal-700">Total Price</span>
                      <span className="font-bold text-teal-700 text-lg">
                        ₱{typeof selectedItem.price === 'number' ? selectedItem.price.toLocaleString() : selectedItem.price}
                      </span>
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedItem(null); setActiveTab("search"); }}>
                  ← Change Selection
                </Button>
              </CardContent>
            </Card>

            {/* Guest Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Guest / Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Primary guest / passenger name"
                    value={guestDetails.name}
                    onChange={e => setGuestDetails(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={guestDetails.email}
                    onChange={e => setGuestDetails(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+63 9XX XXX XXXX"
                    value={guestDetails.phone}
                    onChange={e => setGuestDetails(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Special Requests</Label>
                  <Input
                    placeholder="Dietary needs, room preferences, etc."
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                  />
                </div>

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{bookingError}</div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={bookingLoading || !guestDetails.name || !guestDetails.email}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {bookingLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Booking...</>
                    : <>Confirm Booking via Wanderlinx</>}
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
                <p className="text-slate-500 text-sm">Your Wanderlinx booking has been created successfully.</p>

                <div className="bg-teal-50 rounded-xl p-5 text-left space-y-3">
                  {bookingResult.reference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Reference</span>
                      <span className="font-bold font-mono text-teal-700">{bookingResult.reference || bookingResult.booking?.confirmation_code}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Type</span>
                    <span className="font-semibold capitalize">{searchParams.search_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Guest</span>
                    <span className="font-semibold">{guestDetails.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <Badge className="bg-amber-100 text-amber-700">Pending Payment</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Supplier</span>
                    <Badge className="bg-teal-100 text-teal-700">Wanderlinx</Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setSelectedItem(null); setBookingResult(null); setResults([]); setActiveTab("search"); }}
                  >
                    New Search
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={() => window.open('https://mywanderlinx.com', '_blank')}
                    >
                     <ExternalLink className="w-4 h-4 mr-2" />
                     Open Wanderlinx
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
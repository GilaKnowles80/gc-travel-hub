import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Loader2, MapPin, Star, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import HotelBookingDialog from "@/components/hotels/HotelBookingDialog";
import LocationHotelSearch from "@/components/hotels/LocationHotelSearch";
import SupplierPortalsPanel from "@/components/shared/SupplierPortalsPanel";
import AdBanner from "@/components/ads/AdBanner";
import PriceCalendar from "@/components/shared/PriceCalendar";

export default function HotelSearch() {
    const [searchParams, setSearchParams] = useState({
        cityCode: "",
        checkInDate: "",
        checkOutDate: "",
        adults: 1,
        rooms: 1
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [locationResults, setLocationResults] = useState([]);
    const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
    const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
    const [resultsTab, setResultsTab] = useState("duffel");

    const { data: hotelResults, isLoading, error, refetch } = useQuery({
        queryKey: ['hotel-search-duffel', searchParams],
        queryFn: async () => {
            const response = await base44.functions.invoke('searchHotelsDuffel', searchParams);
            return response.data;
        },
        enabled: false
    });

    const duffelHotels = hotelResults?.hotels || [];

    // Auto-show Supplier Portals when Duffel returns no products (or errors);
    // switch back to Duffel when results are present or a new search is loading.
    useEffect(() => {
        if (!hasSearched) return;
        if (isLoading) { setResultsTab("duffel"); return; }
        if (error || duffelHotels.length === 0) setResultsTab("suppliers");
        else setResultsTab("duffel");
    }, [hasSearched, isLoading, error, duffelHotels.length]);

    const handleSearch = () => {
        if (!searchParams.cityCode || !searchParams.checkInDate || !searchParams.checkOutDate) {
            alert('Please fill in city code, check-in, and check-out dates');
            return;
        }
        setHasSearched(true);
        refetch();
    };

    const handleSelectHotel = (hotel, offer) => {
        setSelectedHotel({ hotel, offer });
        setShowBookingDialog(true);
    };

    const calculateNights = () => {
        if (!searchParams.checkInDate || !searchParams.checkOutDate) return 0;
        return moment(searchParams.checkOutDate).diff(moment(searchParams.checkInDate), 'days');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <AdBanner placement="top_banner" pageName="Hotels" />
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Hotels Worldwide</h1>
                    <p className="text-xl opacity-90">Powered by Duffel — millions of properties worldwide</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5" />
                            Hotel Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="city" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="city">Search by City</TabsTrigger>
                                <TabsTrigger value="location">Search by Location</TabsTrigger>
                            </TabsList>

                            <TabsContent value="city">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label>City Code (IATA)</Label>
                                <Input
                                    placeholder="e.g., MNL, NYC, LON"
                                    value={searchParams.cityCode}
                                    onChange={(e) => setSearchParams({...searchParams, cityCode: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div className="relative">
                                <Label>Check-in Date</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="date"
                                    value={searchParams.checkInDate}
                                    min={moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, checkInDate: e.target.value})}
                                    className="flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => { setShowCheckInCalendar(v => !v); setShowCheckOutCalendar(false); }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs text-blue-600 font-medium whitespace-nowrap"
                                  >
                                    💰 Prices
                                  </button>
                                </div>
                                {showCheckInCalendar && (
                                  <div className="absolute top-full left-0 z-50 mt-2">
                                    <PriceCalendar
                                      type="hotel"
                                      location={searchParams.cityCode}
                                      selectedDate={searchParams.checkInDate}
                                      onSelectDate={(date) => {
                                        setSearchParams(p => ({...p, checkInDate: date}));
                                        setShowCheckInCalendar(false);
                                      }}
                                    />
                                  </div>
                                )}
                            </div>
                            <div className="relative">
                                <Label>Check-out Date</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="date"
                                    value={searchParams.checkOutDate}
                                    min={searchParams.checkInDate || moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, checkOutDate: e.target.value})}
                                    className="flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => { setShowCheckOutCalendar(v => !v); setShowCheckInCalendar(false); }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs text-blue-600 font-medium whitespace-nowrap"
                                  >
                                    💰 Prices
                                  </button>
                                </div>
                                {showCheckOutCalendar && (
                                  <div className="absolute top-full left-0 z-50 mt-2">
                                    <PriceCalendar
                                      type="hotel"
                                      location={searchParams.cityCode}
                                      selectedDate={searchParams.checkOutDate}
                                      onSelectDate={(date) => {
                                        setSearchParams(p => ({...p, checkOutDate: date}));
                                        setShowCheckOutCalendar(false);
                                      }}
                                    />
                                  </div>
                                )}
                            </div>
                            <div>
                                <Label>Rooms</Label>
                                <Select
                                    value={searchParams.rooms.toString()}
                                    onValueChange={(value) => setSearchParams({...searchParams, rooms: parseInt(value)})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4].map(num => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'Room' : 'Rooms'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label>Adults per Room</Label>
                                <Select
                                    value={searchParams.adults.toString()}
                                    onValueChange={(value) => setSearchParams({...searchParams, adults: parseInt(value)})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4].map(num => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'Adult' : 'Adults'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSearch} 
                                    className="w-full bg-blue-500 hover:bg-blue-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Hotel className="w-4 h-4 mr-2" />
                                            Search Hotels
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                            </TabsContent>

                            <TabsContent value="location">
                                <LocationHotelSearch onResults={setLocationResults} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                {/* Results */}
                {locationResults.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {locationResults.length} Hotels Found Nearby
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {locationResults.map((hotel, index) => (
                                <motion.div
                                    key={hotel.hotelId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-bold text-lg text-slate-900 line-clamp-2">{hotel.name}</h3>
                                                {hotel.rating && (
                                                    <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                                                        <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                                                        <span className="text-sm font-semibold text-amber-900">{hotel.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{hotel.address || hotel.cityCode}</span>
                                            </div>
                                            {hotel.amenities && hotel.amenities.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-end justify-between mt-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Price per night</p>
                                                    <p className="text-2xl font-bold text-slate-900">
                                                        {hotel.currency} {hotel.price}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedHotel({ hotel: { hotelId: hotel.hotelId, name: hotel.name }, offer: { price: { total: hotel.price, currency: hotel.currency }, id: hotel.offerId } });
                                                        setShowBookingDialog(true);
                                                    }}
                                                    className="bg-amber-600 hover:bg-amber-700"
                                                >
                                                    Book Now
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Duffel / Supplier Portals tabs */}
                {hasSearched && (
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
                        <button
                            onClick={() => setResultsTab("duffel")}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${resultsTab === "duffel" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            Duffel Hotels {duffelHotels.length > 0 ? `(${duffelHotels.length})` : ""}
                        </button>
                        <button
                            onClick={() => setResultsTab("suppliers")}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${resultsTab === "suppliers" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            Supplier Portals
                        </button>
                    </div>
                )}

                {resultsTab === "suppliers" ? (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">Book via Supplier Portals</h3>
                            <SupplierPortalsPanel />
                        </CardContent>
                    </Card>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-3 text-lg">Searching hotels via Duffel...</span>
                    </div>
                ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center">
                            <p className="text-red-600 mb-3">Error: {error.message}</p>
                            <Button onClick={() => setResultsTab("suppliers")} className="bg-slate-700 hover:bg-slate-800">
                                Browse Supplier Portals
                            </Button>
                        </CardContent>
                    </Card>
                ) : duffelHotels.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Hotel className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg text-slate-600">No hotels found for your search criteria</p>
                            <p className="text-sm text-slate-500 mt-2">Try adjusting your dates or location</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">{duffelHotels.length} Hotels Found</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {duffelHotels.map((hotel, idx) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                        <CardContent className="py-6 flex flex-col flex-1">
                                            <div className="flex-1">
                                                {hotel.photos?.[0] && (
                                                    <img src={hotel.photos[0]} alt={hotel.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                                                )}
                                                <h3 className="text-lg font-bold mb-2 line-clamp-2">{hotel.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="line-clamp-1">{hotel.city_name || hotel.address?.city_name || hotel.address?.line_one}</span>
                                                </div>
                                                {hotel.star_rating ? (
                                                    <div className="flex items-center gap-1 mb-3">
                                                        {[...Array(parseInt(hotel.star_rating))].map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                        ))}
                                                    </div>
                                                ) : hotel.review_score ? (
                                                    <div className="flex items-center gap-1 mb-3 text-sm text-slate-600">
                                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {hotel.review_score}/10 ({hotel.review_count} reviews)
                                                    </div>
                                                ) : null}
                                                {hotel.amenities?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {hotel.amenities.slice(0, 3).map((a, i) => (
                                                            <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{a}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />{searchParams.adults} adults
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="border-t pt-4 mt-4">
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-blue-600">{hotel.currency} {hotel.total_amount}</div>
                                                        <div className="text-xs text-slate-500">total • includes markup</div>
                                                    </div>
                                                    <Button
                                                        className="bg-blue-500 hover:bg-blue-600"
                                                        onClick={() => handleSelectHotel(
                                                            { hotelId: hotel.id, name: hotel.name, address: { cityName: hotel.city_name }, rating: hotel.star_rating },
                                                            { id: hotel.id, price: { total: hotel.total_amount, currency: hotel.currency }, room: { description: { text: hotel.description } } }
                                                        )}
                                                    >
                                                        Book Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking Dialog */}
                {selectedHotel && (
                    <HotelBookingDialog
                        isOpen={showBookingDialog}
                        onClose={() => {
                            setShowBookingDialog(false);
                            setSelectedHotel(null);
                        }}
                        hotel={selectedHotel.hotel}
                        offer={selectedHotel.offer}
                        guests={searchParams.adults}
                    />
                )}
            </div>
        </div>
    );
}
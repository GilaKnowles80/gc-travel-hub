import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plane, Loader2, ArrowRight, Clock, Luggage, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import BookingDialog from "@/components/flights/BookingDialog";
import AirportSelector from "@/components/flights/AirportSelector";
import { useUserLocation } from "@/components/location/LocationCapture";
import AIRecommendationsPanel from "@/components/recommendations/AIRecommendationsPanel";
import PricingComparisonPanel from "@/components/recommendations/PricingComparisonPanel";

export default function FlightSearch() {
    const { location: userLocation, getLocation } = useUserLocation();
    const [searchParams, setSearchParams] = useState({
        origin: "",
        destination: "",
        departureDate: "",
        returnDate: "",
        adults: 1,
        cabinClass: "ECONOMY"
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);

    React.useEffect(() => {
        getLocation();
    }, []);

    const handleSelectFlight = (offer) => {
        setSelectedFlight(offer);
        setShowBookingDialog(true);
    };

    const { data: flightResults, isLoading, error, refetch } = useQuery({
        queryKey: ['flight-search', searchParams],
        queryFn: async () => {
            const response = await base44.functions.invoke('searchFlightsAMADEUS', searchParams);
            return response.data;
        },
        enabled: false
    });

    const handleSearch = () => {
        if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
            alert('Please fill in origin, destination, and departure date');
            return;
        }
        setHasSearched(true);
        refetch();
    };

    const formatDuration = (duration) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Real-Time Flights</h1>
                    <p className="text-xl opacity-90">Powered by Amadeus - 500+ airlines worldwide</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            Flight Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label>Origin Airport</Label>
                                <AirportSelector
                                    value={searchParams.origin}
                                    onChange={(code) => setSearchParams({...searchParams, origin: code})}
                                    placeholder="Select origin airport"
                                    userLocation={userLocation}
                                />
                            </div>
                            <div>
                                <Label>Destination Airport</Label>
                                <AirportSelector
                                    value={searchParams.destination}
                                    onChange={(code) => setSearchParams({...searchParams, destination: code})}
                                    placeholder="Select destination airport"
                                    userLocation={userLocation}
                                />
                            </div>
                            <div>
                                <Label>Departure Date</Label>
                                <Input
                                    type="date"
                                    value={searchParams.departureDate}
                                    min={moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Return Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={searchParams.returnDate}
                                    min={searchParams.departureDate || moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <Label>Passengers</Label>
                                <MobileSelect
                                    value={searchParams.adults.toString()}
                                    onValueChange={(value) => setSearchParams({...searchParams, adults: parseInt(value)})}
                                    placeholder="Select passengers"
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'Adult' : 'Adults'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </MobileSelect>
                            </div>
                            <div>
                                <Label>Cabin Class</Label>
                                <MobileSelect
                                    value={searchParams.cabinClass}
                                    onValueChange={(value) => setSearchParams({...searchParams, cabinClass: value})}
                                    placeholder="Select cabin class"
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ECONOMY">Economy</SelectItem>
                                        <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                                        <SelectItem value="BUSINESS">Business</SelectItem>
                                        <SelectItem value="FIRST">First Class</SelectItem>
                                    </SelectContent>
                                </MobileSelect>
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSearch} 
                                    className="w-full bg-amber-500 hover:bg-amber-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Plane className="w-4 h-4 mr-2" />
                                            Search Flights
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Recommendations */}
                {hasSearched && !isLoading && searchParams.destination && (
                    <AIRecommendationsPanel 
                        searchType="flights"
                        destination={searchParams.destination}
                        onSelectProduct={(productId, product) => {
                            if (product) {
                                handleSelectFlight(product);
                            }
                        }}
                    />
                )}

                {/* Results */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="ml-3 text-lg">Searching flights...</span>
                    </div>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-6">
                            <p className="text-red-600">Error: {error.message}</p>
                        </CardContent>
                    </Card>
                )}

                {hasSearched && !isLoading && !error && flightResults?.flights && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            {flightResults.flights.length} Flights Found
                        </h2>
                        <div className="space-y-4">
                            {flightResults.flights.map((offer, idx) => {
                                const departure = new Date(offer.departure_time);
                                const arrival = new Date(offer.arrival_time);

                                return (
                                    <motion.div
                                        key={offer.amadeus_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="hover:shadow-lg transition-shadow">
                                            <CardContent className="py-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold">
                                                                    {moment(departure).format('HH:mm')}
                                                                </div>
                                                                <div className="text-sm text-slate-600">
                                                                    {offer.origin}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex-1 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-px flex-1 bg-slate-300"></div>
                                                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                                                        <Clock className="w-3 h-3" />
                                                                        {offer.duration_hours}h
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                                                    <div className="h-px flex-1 bg-slate-300"></div>
                                                                </div>
                                                                <div className="text-xs text-center mt-1 text-slate-500">
                                                                    {offer.is_direct ? 'Direct' : `${offer.stops} stop(s)`}
                                                                </div>
                                                            </div>

                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold">
                                                                    {moment(arrival).format('HH:mm')}
                                                                </div>
                                                                <div className="text-sm text-slate-600">
                                                                    {offer.destination}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                            <span className="font-medium">
                                                                {offer.airline_name}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{offer.cabin_classes?.[0]?.class || 'Economy'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right md:border-l md:pl-6">
                                                         <PricingComparisonPanel
                                                             productType="flight"
                                                             productId={offer.amadeus_id}
                                                             basePrice={offer.price}
                                                             date={searchParams.departureDate}
                                                             destination={searchParams.destination}
                                                         />
                                                         <div className="text-xs text-slate-500 mb-3 mt-2">
                                                             per person • includes markup
                                                         </div>
                                                         <Button 
                                                             className="w-full bg-amber-500 hover:bg-amber-600"
                                                             onClick={() => handleSelectFlight(offer)}
                                                         >
                                                             Select Flight
                                                         </Button>
                                                     </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {hasSearched && !isLoading && !error && (!flightResults?.flights || flightResults.flights.length === 0) && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Plane className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg text-slate-600">No flights found for your search criteria</p>
                            <p className="text-sm text-slate-500 mt-2">Try adjusting your dates or destinations</p>
                        </CardContent>
                    </Card>
                )}

                {/* Booking Dialog */}
                {selectedFlight && (
                    <BookingDialog
                        isOpen={showBookingDialog}
                        onClose={() => {
                            setShowBookingDialog(false);
                            setSelectedFlight(null);
                        }}
                        flightOffer={selectedFlight}
                        passengers={searchParams.adults}
                    />
                )}
            </div>
        </div>
    );
}
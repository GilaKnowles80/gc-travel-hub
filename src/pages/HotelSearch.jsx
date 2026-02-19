import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Loader2, MapPin, Star, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import HotelBookingDialog from "@/components/hotels/HotelBookingDialog";
import AdBanner from "@/components/ads/AdBanner";

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

    const { data: hotelResults, isLoading, error, refetch } = useQuery({
        queryKey: ['hotel-search', searchParams],
        queryFn: async () => {
            const response = await base44.functions.invoke('searchHotels', searchParams);
            return response.data;
        },
        enabled: false
    });

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
                    <p className="text-xl opacity-90">Powered by Amadeus - Thousands of hotels</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label>City Code (IATA)</Label>
                                <Input
                                    placeholder="e.g., MNL, NYC, LON"
                                    value={searchParams.cityCode}
                                    onChange={(e) => setSearchParams({...searchParams, cityCode: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div>
                                <Label>Check-in Date</Label>
                                <Input
                                    type="date"
                                    value={searchParams.checkInDate}
                                    min={moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, checkInDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Check-out Date</Label>
                                <Input
                                    type="date"
                                    value={searchParams.checkOutDate}
                                    min={searchParams.checkInDate || moment().format('YYYY-MM-DD')}
                                    onChange={(e) => setSearchParams({...searchParams, checkOutDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Rooms</Label>
                                <MobileSelect
                                    value={searchParams.rooms.toString()}
                                    onValueChange={(value) => setSearchParams({...searchParams, rooms: parseInt(value)})}
                                    placeholder="Select rooms"
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
                                </MobileSelect>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label>Adults per Room</Label>
                                <MobileSelect
                                    value={searchParams.adults.toString()}
                                    onValueChange={(value) => setSearchParams({...searchParams, adults: parseInt(value)})}
                                    placeholder="Select adults"
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
                                </MobileSelect>
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
                    </CardContent>
                </Card>

                {/* Results */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-3 text-lg">Searching hotels...</span>
                    </div>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-6">
                            <p className="text-red-600">Error: {error.message}</p>
                        </CardContent>
                    </Card>
                )}

                {hasSearched && !isLoading && !error && hotelResults?.data && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            {hotelResults.data.length} Hotels Found
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotelResults.data.map((hotel, idx) => {
                                const bestOffer = hotel.offers[0];
                                const nights = calculateNights();
                                
                                return (
                                    <motion.div
                                        key={hotel.hotel.hotelId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                            <CardContent className="py-6 flex flex-col flex-1">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                                                        {hotel.hotel.name}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="line-clamp-1">
                                                            {hotel.hotel.address?.cityName}
                                                        </span>
                                                    </div>

                                                    {hotel.hotel.rating && (
                                                        <div className="flex items-center gap-1 mb-3">
                                                            {[...Array(parseInt(hotel.hotel.rating))].map((_, i) => (
                                                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {bestOffer.room?.description?.text && (
                                                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                            {bestOffer.room.description.text}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {searchParams.adults} adults
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {nights} night{nights !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-4 mt-4">
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                ${bestOffer.price.total}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                total • includes markup
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            className="bg-blue-500 hover:bg-blue-600"
                                                            onClick={() => handleSelectHotel(hotel.hotel, bestOffer)}
                                                        >
                                                            Book Now
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

                {hasSearched && !isLoading && !error && (!hotelResults?.data || hotelResults.data.length === 0) && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Hotel className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg text-slate-600">No hotels found for your search criteria</p>
                            <p className="text-sm text-slate-500 mt-2">Try adjusting your dates or location</p>
                        </CardContent>
                    </Card>
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
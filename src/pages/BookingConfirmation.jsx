import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plane, Calendar, Users, Mail, FileText, Home } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import PriceDisplay from "@/components/currency/PriceDisplay";
import CurrencySelector from "@/components/currency/CurrencySelector";

export default function BookingConfirmation() {
    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        const data = sessionStorage.getItem('bookingConfirmation');
        if (data) {
            setBookingData(JSON.parse(data));
            sessionStorage.removeItem('bookingConfirmation');
        }
    }, []);

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="py-12 text-center">
                        <p className="text-lg text-slate-600">No booking data found</p>
                        <Link to={createPageUrl("FlightSearch")}>
                            <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                                Search Flights
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const firstSegment = bookingData.flightDetails.itineraries[0].segments[0];
    const lastSegment = bookingData.flightDetails.itineraries[0].segments[
        bookingData.flightDetails.itineraries[0].segments.length - 1
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-lg text-slate-600">Your flight has been successfully booked</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span className="font-mono font-bold text-amber-700">
                            {bookingData.amadeusPNR}
                        </span>
                    </div>
                </motion.div>

                {/* Email Confirmation Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6 border-blue-200 bg-blue-50">
                        <CardContent className="py-4 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-blue-900">
                                A confirmation email has been sent to your registered email address with all booking details.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Flight Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plane className="w-5 h-5" />
                                Flight Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {moment(firstSegment.departure.at).format('HH:mm')}
                                        </div>
                                        <div className="text-sm text-slate-600 font-medium">
                                            {firstSegment.departure.iataCode}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {moment(firstSegment.departure.at).format('MMM DD, YYYY')}
                                        </div>
                                    </div>

                                    <div className="flex-1 px-6 text-center">
                                        <Plane className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                                        <div className="text-xs text-slate-600">
                                            Flight {firstSegment.carrierCode}{firstSegment.number}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-slate-900">
                                            {moment(lastSegment.arrival.at).format('HH:mm')}
                                        </div>
                                        <div className="text-sm text-slate-600 font-medium">
                                            {lastSegment.arrival.iataCode}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {moment(lastSegment.arrival.at).format('MMM DD, YYYY')}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-600">Duration:</span>
                                        <span className="ml-2 font-medium">{bookingData.flightDetails.itineraries[0].duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Cabin:</span>
                                        <span className="ml-2 font-medium">
                                            {bookingData.flightDetails.travelerPricings[0].fareDetailsBySegment[0].cabin}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Passengers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Passenger Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bookingData.travelers.map((traveler, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <div className="font-medium text-slate-900">
                                                {traveler.name.firstName} {traveler.name.lastName}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {traveler.dateOfBirth && `DOB: ${moment(traveler.dateOfBirth).format('MMM DD, YYYY')}`}
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 capitalize">
                                            {traveler.travelerType?.toLowerCase() || 'Adult'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Price Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-slate-700">
                                    <span>Base Fare</span>
                                    <span>{bookingData.currency} {bookingData.basePrice}</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>Service Fee</span>
                                    <span>{bookingData.currency} {bookingData.markup}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t">
                                    <span>Total Paid</span>
                                    <span className="text-amber-600">{bookingData.currency} {bookingData.totalPrice}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4 justify-center"
                >
                    <Link to={createPageUrl("Home")}>
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link to={createPageUrl("MyBookings")}>
                        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                            <FileText className="w-4 h-4" />
                            View My Bookings
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
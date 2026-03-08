import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Hotel, Calendar, Users, Mail, FileText, Home, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

export default function HotelBookingConfirmation() {
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for Stripe session
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
            // Payment successful via Stripe
            setLoading(false);
            setBookingData({ paymentSuccessful: true, sessionId });
        } else {
            // Direct booking
            const data = sessionStorage.getItem('hotelBookingConfirmation');
            if (data) {
                setBookingData(JSON.parse(data));
                sessionStorage.removeItem('hotelBookingConfirmation');
            }
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="py-12 text-center">
                        <p className="text-lg text-slate-600">No booking data found</p>
                        <Link to={createPageUrl("HotelSearch")}>
                            <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                                Search Hotels
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If payment was successful via Stripe but no booking details yet
    if (bookingData.paymentSuccessful && !bookingData.hotelName) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
                        <p className="text-lg text-slate-600 mb-8">Your hotel booking is being processed</p>
                        
                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardContent className="py-4 flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <p className="text-sm text-blue-900">
                                    A confirmation email with your booking details will be sent shortly.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 justify-center mt-8">
                            <Link to={createPageUrl("Home")}>
                                <Button variant="outline" className="gap-2">
                                    <Home className="w-4 h-4" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Link to={createPageUrl("MyBookings")}>
                                <Button className="bg-blue-500 hover:bg-blue-600 gap-2">
                                    <FileText className="w-4 h-4" />
                                    View My Bookings
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Reservation Confirmed!</h1>
                    <p className="text-lg text-slate-600">Your hotel booking has been successfully confirmed</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span className="font-mono font-bold text-blue-700">
                            {bookingData.bookingReference}
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

                {/* Hotel Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hotel className="w-5 h-5" />
                                Hotel Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        {bookingData.hotelName}
                                    </h3>
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4 mt-1" />
                                        <div>
                                            {bookingData.hotelAddress?.lines?.map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))}
                                            <div>{bookingData.hotelAddress?.cityName}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-sm text-slate-600 mb-2">Room Type:</div>
                                    <div className="font-medium">{bookingData.roomDescription}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stay Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Stay Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Check-in</div>
                                    <div className="text-xl font-bold text-slate-900">
                                        {moment(bookingData.checkIn).format('MMM DD, YYYY')}
                                    </div>
                                    <div className="text-sm text-slate-500">After 2:00 PM</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-600 mb-1">Check-out</div>
                                    <div className="text-xl font-bold text-slate-900">
                                        {moment(bookingData.checkOut).format('MMM DD, YYYY')}
                                    </div>
                                    <div className="text-sm text-slate-500">Before 12:00 PM</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Guests */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Guest Information ({bookingData.guests.length} Guest{bookingData.guests.length > 1 ? 's' : ''})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bookingData.guests.map((guest, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="font-medium text-slate-900">
                                            {guest.name.title} {guest.name.firstName} {guest.name.lastName}
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
                    transition={{ delay: 0.5 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-slate-700">
                                    <span>Base Rate</span>
                                    <span>{bookingData.currency} {bookingData.basePrice}</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>Service Fee</span>
                                    <span>{bookingData.currency} {bookingData.markup}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t">
                                    <span>Total Paid</span>
                                    <span className="text-blue-600">{bookingData.currency} {bookingData.totalPrice}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 justify-center"
                >
                    <Link to={createPageUrl("Home")}>
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link to={createPageUrl("MyBookings")}>
                        <Button className="bg-blue-500 hover:bg-blue-600 gap-2">
                            <FileText className="w-4 h-4" />
                            View My Bookings
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
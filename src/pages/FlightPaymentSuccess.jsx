import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle, Plane, Home, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import AddToCalendarButton from "@/components/bookings/AddToCalendarButton";
import FlightAssistantWidget from "@/components/agents/FlightAssistantWidget";

// Statuses: loading | confirming | confirmed | failed | notfound
export default function FlightPaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking_id");
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!bookingId) {
      setStatus("notfound");
      return;
    }
    let stopped = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // poll up to ~90s for the airline to confirm

    const poll = async () => {
      try {
        const res = await base44.entities.FlightBooking.filter({ id: bookingId });
        const b = res?.[0];
        if (stopped) return;
        if (b) {
          setBooking(b);
          if (b.status === "confirmed") { setStatus("confirmed"); return; }
          if (b.status === "cancelled") { setStatus("failed"); return; }
          setStatus("confirming");
        }
        attempts++;
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, 3000);
        } else {
          // Timed out waiting — keep last known status (confirming)
          setStatus("confirming");
        }
      } catch (e) {
        if (!stopped) setStatus("notfound");
      }
    };
    poll();
    return () => { stopped = true; };
  }, [bookingId]);

  if (status === "loading" || status === "confirming") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-2xl max-w-md w-full">
          <CardContent className="p-10 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Plane className="w-10 h-10 text-blue-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Received!</h1>
            <p className="text-slate-600 mb-6">
              We're confirming your booking with the airline. This usually takes a few seconds — please keep this page open.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming your flight…
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "confirmed") {
    const pnr = booking?.booking_ref || booking?.supplier_reference || (booking?.id?.slice(-8).toUpperCase());
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <FlightAssistantWidget stepLabel="Confirmation" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Flight Confirmed! ✈️</h1>
              <p className="text-slate-600 mb-6">
                Your booking is confirmed with the airline. A confirmation with your e-ticket has been sent to <strong>{booking?.passenger_email}</strong>.
              </p>

              <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl p-5 mb-6">
                <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase mb-1">Booking Reference</p>
                <p className="font-mono text-2xl font-extrabold text-amber-600 tracking-widest">{pnr}</p>
                {booking?.supplier_reference && (
                  <p className="text-xs text-slate-500 mt-2">Airline Order: {booking.supplier_reference}</p>
                )}
              </div>

              {booking && (
                <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Passenger</span><span className="font-medium">{booking.passenger_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-medium">{booking.route}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Flight</span><span className="font-medium">{booking.flight_number}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Cabin</span><span className="font-medium capitalize">{booking.cabin_class?.replace(/_/g, " ")}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Passengers</span><span className="font-medium">{booking.number_of_passengers}</span></div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => window.location.href = createPageUrl("MyFlightBookings")} className="flex-1 bg-amber-500 hover:bg-amber-600" size="lg">
                  <Plane className="w-5 h-5 mr-2" /> View My Bookings
                </Button>
                <Button onClick={() => window.location.href = createPageUrl("Home")} variant="outline" className="flex-1" size="lg">
                  <Home className="w-5 h-5 mr-2" /> Back to Home
                </Button>
              </div>

              {booking?.departure_time && (
                <div className="mt-4">
                  <AddToCalendarButton
                    title={`Flight ${booking.flight_number || ""} - ${booking.route || ""}`}
                    description={`Booking Ref: ${booking.booking_ref || booking.supplier_reference || ""}\nPassenger: ${booking.passenger_name}\nAirline: ${booking.airline_name || ""}`}
                    location={booking.route}
                    start={booking.departure_time}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <FlightAssistantWidget stepLabel="Confirmation" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Could Not Be Confirmed</h1>
              <p className="text-slate-600 mb-6">
                We received your payment, but the airline was unable to confirm your seat. This can happen if the fare changed or sold out during checkout.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Don't worry — your money is safe.</strong> A full refund will be processed to your original payment method within 3-7 business days. No action is needed from you.
                </p>
              </div>
              <p className="text-xs text-slate-500 mb-6">Booking ID: {bookingId}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => window.location.href = createPageUrl("Flights")} className="flex-1 bg-amber-500 hover:bg-amber-600" size="lg">
                  <RefreshCw className="w-5 h-5 mr-2" /> Search Again
                </Button>
                <Button onClick={() => window.location.href = createPageUrl("Home")} variant="outline" className="flex-1" size="lg">
                  <Home className="w-5 h-5 mr-2" /> Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // notfound
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="border-0 shadow-2xl max-w-md w-full">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">No Booking Found</h1>
          <p className="text-slate-500 mb-6">We couldn't find a booking to confirm. If you just paid, please check your email or your bookings page.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => window.location.href = createPageUrl("MyBookings")} className="flex-1 bg-amber-500 hover:bg-amber-600">View My Bookings</Button>
            <Link to={createPageUrl("Home")} className="flex-1"><Button variant="outline" className="w-full">Back to Home</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
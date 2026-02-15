import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Download, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function BookingConfirmationStep({ booking, onComplete }) {
  const [sending, setSending] = useState(false);

  const handleSendItinerary = async () => {
    setSending(true);
    try {
      await base44.functions.invoke('sendBookingItinerary', {
        bookingId: booking.id,
        email: booking.passenger_email,
        passengerName: booking.passenger_name,
        flightDetails: {
          flightNumber: booking.flight_number,
          route: booking.route,
          departureTime: booking.departure_time,
          cabinClass: booking.cabin_class
        }
      });
      toast.success('Itinerary sent to email!');
    } catch (error) {
      toast.error('Failed to send itinerary: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
              <p className="text-green-800 text-sm">
                Your flight booking has been confirmed. Confirmation details will be sent to your email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Booking Reference</p>
              <p className="font-semibold">{booking.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Passenger</p>
              <p className="font-semibold">{booking.passenger_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Flight</p>
              <p className="font-semibold">{booking.flight_number}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Route</p>
              <p className="font-semibold">{booking.route}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Cabin Class</p>
              <p className="font-semibold">{booking.cabin_class}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Price</p>
              <p className="font-semibold text-amber-600">₱{booking.total_price.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Itinerary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Send detailed booking and itinerary information to {booking.passenger_email}
          </p>
          <Button
            onClick={handleSendItinerary}
            disabled={sending}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Itinerary to Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Button onClick={onComplete} className="w-full bg-amber-500 hover:bg-amber-600">
        Continue to Itinerary Receipt
      </Button>
    </div>
  );
}
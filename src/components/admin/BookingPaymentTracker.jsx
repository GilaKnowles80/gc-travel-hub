import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, TrendingUp } from "lucide-react";

export default function BookingPaymentTracker() {
  const [searchRef, setSearchRef] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings-payment"],
    queryFn: async () => {
      const flights = await base44.entities.FlightBooking.list();
      const ferries = await base44.entities.FerryBooking.list();
      const hotels = await base44.entities.HotelBooking.list();
      const buses = await base44.entities.BusBooking.list();
      const cars = await base44.entities.CarRentalBooking.list();
      const tours = await base44.entities.Booking.list();
      
      return [
        ...flights.map(b => ({ ...b, type: "flight" })),
        ...ferries.map(b => ({ ...b, type: "ferry" })),
        ...hotels.map(b => ({ ...b, type: "hotel" })),
        ...buses.map(b => ({ ...b, type: "bus" })),
        ...cars.map(b => ({ ...b, type: "car" })),
        ...tours.map(b => ({ ...b, type: "tour" })),
      ];
    },
  });

  const filtered = bookings.filter(b => 
    b.booking_ref?.toLowerCase().includes(searchRef.toLowerCase())
  );

  const booking = selectedBooking || filtered[0];
  
  // Get FLIGHT_MARKUP_PERCENTAGE from settings or use default
  const markupPercentage = 15; // Default 15% markup
  const basePrice = booking?.total_price || 0;
  const markupAmount = basePrice * (markupPercentage / 100);
  const customerPrice = basePrice + markupAmount;

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search by booking reference (e.g., FRRQA5)"
          value={searchRef}
          onChange={(e) => setSearchRef(e.target.value)}
          className="flex-1"
        />
        <Button disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {booking && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Booking Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{booking.booking_ref}</div>
              <p className="text-xs text-slate-500 mt-1">
                {booking.type?.toUpperCase()} • {booking.created_date}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ₱{customerPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Status: {booking.payment_status}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Your Markup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">
                ₱{markupAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-amber-600 mt-1">
                {markupPercentage}% on ₱{basePrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 text-slate-600">Supplier Cost</td>
                  <td className="text-right font-semibold">
                    ₱{basePrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">Your Markup ({markupPercentage}%)</td>
                  <td className="text-right font-semibold text-amber-600">
                    +₱{markupAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-3 font-bold">Customer Paid</td>
                  <td className="text-right font-bold text-lg">
                    ₱{customerPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filtered.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.slice(0, 10).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedBooking?.id === b.id
                      ? "bg-amber-50 border-amber-300"
                      : "hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="font-semibold">{b.booking_ref}</div>
                  <div className="text-xs text-slate-500">
                    ₱{b.total_price?.toLocaleString("en-PH", { minimumFractionDigits: 2 })} • {b.type}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
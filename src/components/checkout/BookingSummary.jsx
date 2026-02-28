import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/currency/PriceDisplay";
import { Plane, MapPin, Calendar, Users } from "lucide-react";

export default function BookingSummary({ booking, type, addons = [] }) {
  const getServiceIcon = () => {
    const icons = {
      flight: Plane,
      hotel: MapPin,
      tour: MapPin,
      train: Plane,
      car: MapPin,
      bus: Plane,
      ferry: Plane,
      cruise: Plane,
      visa: MapPin,
    };
    const Icon = icons[type] || Plane;
    return <Icon className="w-5 h-5" />;
  };

  const basePrice = parseFloat(booking.total_price) || 0;
  const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const finalTotal = basePrice + addonsTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getServiceIcon()}
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Details */}
        <div className="space-y-2">
          {type === "flight" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Route</span>
                <span className="font-medium">{booking.route}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Cabin</span>
                <Badge variant="outline">{booking.cabin_class}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Departure</span>
                <span className="font-medium">{booking.departure_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Passengers</span>
                <span className="font-medium">{booking.number_of_passengers}</span>
              </div>
            </>
          )}

          {type === "hotel" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Hotel</span>
                <span className="font-medium">{booking.hotel_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Room Type</span>
                <span className="font-medium">{booking.room_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Check-in</span>
                <span className="font-medium">{booking.check_in_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Check-out</span>
                <span className="font-medium">{booking.check_out_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Rooms</span>
                <span className="font-medium">{booking.number_of_rooms}</span>
              </div>
            </>
          )}

          {type === "tour" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tour</span>
                <span className="font-medium">{booking.tour_title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Departure</span>
                <span className="font-medium">{booking.departure_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Participants</span>
                <span className="font-medium">{booking.number_of_participants}</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Add-ons */}
        {addons.length > 0 && (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Add-ons</h4>
              {addons.map((addon, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600">{addon.name}</span>
                  <PriceDisplay amount={addon.price} fromCurrency="PHP" />
                </div>
              ))}
            </div>
            <Separator />
          </>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Base Price</span>
            <PriceDisplay amount={basePrice} fromCurrency="PHP" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Service Fee</span>
            <PriceDisplay amount={0} fromCurrency="PHP" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Taxes</span>
            <PriceDisplay amount={0} fromCurrency="PHP" />
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-slate-900">Total Amount</span>
          <div className="text-right">
            <PriceDisplay amount={finalTotal} fromCurrency="PHP" />
            <p className="text-xs text-slate-500 mt-1">PHP {finalTotal.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Calendar, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddToItineraryDialog from "../itinerary/AddToItineraryDialog";
import moment from "moment";

export default function BookingHistoryTab({ user }) {
  const { data: flightBookings = [], isLoading: loadingFlights } = useQuery({
    queryKey: ["user-flight-bookings"],
    queryFn: async () => await base44.entities.FlightBooking.filter({ created_by: user.email }),
  });

  const { data: tourBookings = [], isLoading: loadingTours } = useQuery({
    queryKey: ["user-tour-bookings"],
    queryFn: async () => await base44.entities.Booking.filter({ created_by: user.email }),
  });

  const { data: hotelBookings = [], isLoading: loadingHotels } = useQuery({
    queryKey: ["user-hotel-bookings"],
    queryFn: async () => await base44.entities.HotelBooking.filter({ created_by: user.email }),
  });

  const allBookings = [
    ...flightBookings.map((b) => ({ ...b, type: "flight" })),
    ...tourBookings.map((b) => ({ ...b, type: "tour" })),
    ...hotelBookings.map((b) => ({ ...b, type: "hotel" })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const isLoading = loadingFlights || loadingTours || loadingHotels;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (allBookings.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No booking history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {allBookings.map((booking) => (
        <Card key={booking.id} className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {booking.type === "flight" && <Plane className="w-5 h-5 text-amber-500" />}
                  {booking.type === "tour" && <MapPin className="w-5 h-5 text-amber-500" />}
                  {booking.type === "hotel" && <MapPin className="w-5 h-5 text-amber-500" />}
                  <span className="font-semibold text-slate-900">
                    {booking.type === "flight" && booking.route}
                    {booking.type === "tour" && booking.tour_title}
                    {booking.type === "hotel" && booking.hotel_name}
                  </span>
                  <Badge className={statusColors[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {moment(booking.created_date).format("MMM D, YYYY")}
                  </div>
                  <div>${booking.total_price?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Calendar, Users, Loader2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import FlightBookingEditForm from "../components/flights/FlightBookingEditForm";
import moment from "moment";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const paymentColors = {
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-slate-100 text-slate-700",
};

export default function MyFlightBookings() {
  const [editingBooking, setEditingBooking] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["flight-bookings"],
    queryFn: () => base44.entities.FlightBooking.list("-created_date", 50),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Flight Bookings</h1>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Track and manage your flight reservations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No flight bookings yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Start booking flights to see your reservations here</p>
            <Link to={createPageUrl("Flights")}>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Browse Flights
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={statusColors[booking.status]}>
                            {booking.status}
                          </Badge>
                          <Badge className={paymentColors[booking.payment_status]}>
                            {booking.payment_status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {booking.cabin_class?.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {booking.route}
                        </h3>

                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-slate-400" />
                            Flight {booking.flight_number}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            {booking.number_of_passengers} passenger{booking.number_of_passengers > 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Booked on {moment(booking.created_date).format("MMM DD, YYYY")}
                          </div>
                        </div>

                        {booking.selected_seats && booking.selected_seats.length > 0 && (
                          <div className="mt-3 text-sm">
                            <p className="font-medium text-slate-600 mb-1">Selected Seats:</p>
                            <div className="flex flex-wrap gap-1">
                              {booking.selected_seats.map((seat) => (
                                <span key={seat} className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {booking.special_requests && (
                          <div className="mt-3 text-sm text-slate-500">
                            <p className="font-medium text-slate-600">Special Requests:</p>
                            <p>{booking.special_requests}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-3">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Total Price</p>
                          <p className="text-3xl font-bold text-slate-900">
                            ${booking.total_price?.toLocaleString()}
                          </p>
                        </div>
                        {booking.status === "pending" && (
                          <Button
                            onClick={() => setEditingBooking(booking)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Flight Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <FlightBookingEditForm
              booking={editingBooking}
              onClose={() => setEditingBooking(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
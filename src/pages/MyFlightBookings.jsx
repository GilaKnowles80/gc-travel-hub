import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Calendar, Users, Loader2, Edit, Mail, Smartphone, Printer, FileText, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import FlightBookingEditForm from "../components/flights/FlightBookingEditForm";
import RealTimeFlightStatus from "../components/flights/RealTimeFlightStatus";
import moment from "moment";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/mobile/PullToRefresh";

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
  const [viewingDetails, setViewingDetails] = useState(null);
  const [viewingLiveStatus, setViewingLiveStatus] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["flight-bookings"],
    queryFn: () => base44.entities.FlightBooking.list("-created_date", 50),
  });

  const { data: flights = [] } = useQuery({
    queryKey: ["flights"],
    queryFn: () => base44.entities.Flight.list(),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
  };

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      return await base44.entities.FlightBooking.update(bookingId, {
        status: "cancelled",
        payment_status: "refunded"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  const handleSendEmail = async (booking) => {
    try {
      toast.loading("Sending e-ticket...");
      await base44.integrations.Core.SendEmail({
        to: booking.passenger_email,
        subject: `Flight Ticket - ${booking.route}`,
        body: `
          <h2>Flight Ticket Confirmation</h2>
          <p><strong>Booking Reference:</strong> ${booking.id}</p>
          <p><strong>Route:</strong> ${booking.route}</p>
          <p><strong>Flight Number:</strong> ${booking.flight_number}</p>
          <p><strong>Passenger:</strong> ${booking.passenger_name}</p>
          <p><strong>Cabin Class:</strong> ${booking.cabin_class?.replace(/_/g, " ")}</p>
          <p><strong>Total Price:</strong> $${booking.total_price}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        `
      });
      toast.dismiss();
      toast.success("E-ticket sent to your email");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send email");
    }
  };

  const handlePrint = (booking) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Flight Ticket - ${booking.route}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e293b; }
            .details { margin: 20px 0; }
            .row { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Flight Ticket</h1>
          <div class="details">
            <div class="row"><span class="label">Booking Reference:</span> ${booking.id}</div>
            <div class="row"><span class="label">Route:</span> ${booking.route}</div>
            <div class="row"><span class="label">Flight Number:</span> ${booking.flight_number}</div>
            <div class="row"><span class="label">Passenger:</span> ${booking.passenger_name}</div>
            <div class="row"><span class="label">Cabin Class:</span> ${booking.cabin_class?.replace(/_/g, " ")}</div>
            <div class="row"><span class="label">Total Price:</span> $${booking.total_price}</div>
            <div class="row"><span class="label">Status:</span> ${booking.status}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCancelBooking = (booking) => {
    if (booking.status === "cancelled") {
      toast.error("Booking is already cancelled");
      return;
    }
    if (booking.status === "completed") {
      toast.error("Cannot cancel completed bookings");
      return;
    }
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(booking.id);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => {
                              const flight = flights.find(f => f.flight_number === booking.flight_number);
                              setViewingLiveStatus({ booking, flight });
                            }}
                            variant="default"
                            size="sm"
                            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Radio className="w-4 h-4 mr-2" />
                            Live Status
                          </Button>
                          <Button
                            onClick={() => setViewingDetails(booking)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {booking.status === "pending" && (
                            <Button
                              onClick={() => setEditingBooking(booking)}
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
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

      <Dialog open={!!viewingLiveStatus} onOpenChange={() => setViewingLiveStatus(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              Real-Time Flight Status
            </DialogTitle>
          </DialogHeader>
          {viewingLiveStatus && (
            <RealTimeFlightStatus 
              flight={viewingLiveStatus.flight} 
              booking={viewingLiveStatus.booking}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingDetails} onOpenChange={() => setViewingDetails(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {viewingDetails && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{viewingDetails.route}</h3>
                <p className="text-slate-600">Flight {viewingDetails.flight_number}</p>
                <div className="flex gap-2 mt-3">
                  <Badge className={statusColors[viewingDetails.status]}>
                    {viewingDetails.status}
                  </Badge>
                  <Badge className={paymentColors[viewingDetails.payment_status]}>
                    {viewingDetails.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Booking Reference</p>
                  <p className="font-semibold text-slate-900">{viewingDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cabin Class</p>
                  <p className="font-semibold text-slate-900 capitalize">{viewingDetails.cabin_class?.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Passenger Name</p>
                  <p className="font-semibold text-slate-900">{viewingDetails.passenger_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">{viewingDetails.passenger_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-900">{viewingDetails.passenger_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Passengers</p>
                  <p className="font-semibold text-slate-900">{viewingDetails.number_of_passengers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Price</p>
                  <p className="font-semibold text-slate-900 text-xl">${viewingDetails.total_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Booked On</p>
                  <p className="font-semibold text-slate-900">{moment(viewingDetails.created_date).format("MMM DD, YYYY")}</p>
                </div>
              </div>

              {viewingDetails.selected_seats && viewingDetails.selected_seats.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Selected Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingDetails.selected_seats.map((seat) => (
                      <span key={seat} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingDetails.special_requests && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Special Requests</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{viewingDetails.special_requests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Ticket Options</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleSendEmail(viewingDetails)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    onClick={() => {
                      toast.info("SMS feature coming soon");
                    }}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    onClick={() => handlePrint(viewingDetails)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              {viewingDetails.status !== "cancelled" && viewingDetails.status !== "completed" && (
                <div className="border-t pt-4">
                  <Button
                    onClick={() => handleCancelBooking(viewingDetails)}
                    variant="destructive"
                    className="w-full rounded-xl"
                    disabled={cancelBookingMutation.isPending}
                  >
                    {cancelBookingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Cancellation may be subject to airline policies
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}
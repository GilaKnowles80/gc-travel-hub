import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plane, Calendar, Users, Loader2, Edit, X, Download, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import FlightBookingEditForm from "../components/flights/FlightBookingEditForm";
import { toast } from "sonner";
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
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["flight-bookings"],
    queryFn: () => base44.entities.FlightBooking.list("-created_date", 50),
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId) => {
      return await base44.entities.FlightBooking.update(bookingId, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      toast.success("Booking cancelled successfully");
      setCancellingBooking(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel booking");
    }
  });

  const handleDownloadPdf = async (booking) => {
    setDownloadingPdf(booking.id);
    try {
      const response = await base44.functions.invoke('generateBookingPdf', { bookingId: booking.id });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-${booking.flight_number}-${moment(booking.created_date).format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setDownloadingPdf(null);
    }
  };

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

                        {booking.special_requests && (
                          <div className="mt-3 text-sm text-slate-500">
                            <p className="font-medium text-slate-600">Special Requests:</p>
                            <p>{booking.special_requests}</p>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {expandedBooking === booking.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="col-span-2 border-t border-slate-100 pt-4 mt-4 overflow-hidden"
                          >
                            <h4 className="font-semibold text-slate-900 mb-3">Passenger Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 mb-1">Full Name</p>
                                <p className="font-medium text-slate-900">{booking.passenger_name}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-1">Email</p>
                                <p className="font-medium text-slate-900">{booking.passenger_email}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-1">Phone</p>
                                <p className="font-medium text-slate-900">{booking.passenger_phone}</p>
                              </div>
                              {booking.passport_number && (
                                <div>
                                  <p className="text-slate-500 mb-1">Passport Number</p>
                                  <p className="font-medium text-slate-900">{booking.passport_number}</p>
                                </div>
                              )}
                              {booking.date_of_birth && (
                                <div>
                                  <p className="text-slate-500 mb-1">Date of Birth</p>
                                  <p className="font-medium text-slate-900">{moment(booking.date_of_birth).format("MMM DD, YYYY")}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-slate-500 mb-1">Trip Type</p>
                                <p className="font-medium text-slate-900 capitalize">{booking.trip_type?.replace(/_/g, " ")}</p>
                              </div>
                              {booking.return_date && (
                                <div>
                                  <p className="text-slate-500 mb-1">Return Date</p>
                                  <p className="font-medium text-slate-900">{moment(booking.return_date).format("MMM DD, YYYY")}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-slate-500 mb-1">Booking Reference</p>
                                <p className="font-medium text-slate-900">{booking.id.substring(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="text-right space-y-3">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Total Price</p>
                          <p className="text-3xl font-bold text-slate-900">
                            ${booking.total_price?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl w-full"
                          >
                            {expandedBooking === booking.id ? <ChevronUp className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {expandedBooking === booking.id ? "Hide Details" : "View Details"}
                          </Button>
                          <Button
                            onClick={() => handleDownloadPdf(booking)}
                            disabled={downloadingPdf === booking.id}
                            variant="outline"
                            size="sm"
                            className="rounded-xl w-full"
                          >
                            {downloadingPdf === booking.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Download PDF
                          </Button>
                          {booking.status === "pending" && (
                            <Button
                              onClick={() => setEditingBooking(booking)}
                              variant="outline"
                              size="sm"
                              className="rounded-xl w-full"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <Button
                              onClick={() => setCancellingBooking(booking)}
                              variant="outline"
                              size="sm"
                              className="rounded-xl w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
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

      <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this flight booking? This action cannot be undone.
              {cancellingBooking?.payment_status === "paid" && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: Refund processing may take 5-10 business days.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancellingBooking && cancelMutation.mutate(cancellingBooking.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
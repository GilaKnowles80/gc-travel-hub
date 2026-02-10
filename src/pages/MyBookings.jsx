import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Users, CreditCard, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

const paymentColors = {
  unpaid: "bg-orange-100 text-orange-800 border-orange-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function MyBookings() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 50),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-3 text-slate-400">Track and manage your travel reservations</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No bookings yet</h3>
            <p className="text-slate-400 mt-2">Start exploring our amazing tours!</p>
            <Link to={createPageUrl("Tours")}>
              <button className="mt-6 text-amber-600 font-semibold hover:text-amber-700">
                Browse Tours →
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
                <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          to={createPageUrl("TourDetail") + `?id=${booking.tour_id}`}
                          className="text-lg font-bold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {booking.tour_title}
                        </Link>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {booking.departure_date || "TBD"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {booking.number_of_travelers} traveler{booking.number_of_travelers > 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4" />
                            ${booking.total_price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${statusColors[booking.status]} border capitalize`}>
                          {booking.status}
                        </Badge>
                        <Badge className={`${paymentColors[booking.payment_status]} border capitalize`}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
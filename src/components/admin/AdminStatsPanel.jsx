import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, Users, DollarSign, TrendingUp, Plane, Hotel, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminStatsPanel() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    flightBookings: 0,
    hotelBookings: 0,
    tourBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [flights, hotels, tours, bookings] = await Promise.all([
          base44.entities.FlightBooking.list(),
          base44.entities.HotelBooking.list(),
          base44.entities.TourBooking.list(),
          base44.entities.Booking.list(),
        ]);

        const totalRevenue = [
          ...flights,
          ...hotels,
          ...tours,
          ...bookings,
        ].reduce((sum, b) => sum + (b.total_price || 0), 0);

        setStats({
          totalBookings: flights.length + hotels.length + tours.length + bookings.length,
          totalRevenue,
          totalCustomers: new Set([...flights, ...hotels, ...tours, ...bookings].map(b => b.customer_email || b.guest_email || b.passenger_email || b.client_email)).size,
          flightBookings: flights.length,
          hotelBookings: hotels.length,
          tourBookings: tours.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Bookings", value: stats.totalBookings, icon: BarChart3, color: "from-blue-500 to-blue-600" },
    { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "from-green-500 to-green-600" },
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Flight Bookings", value: stats.flightBookings, icon: Plane, color: "from-orange-500 to-orange-600" },
    { label: "Hotel Bookings", value: stats.hotelBookings, icon: Hotel, color: "from-pink-500 to-pink-600" },
    { label: "Tour Bookings", value: stats.tourBookings, icon: MapPin, color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">{card.label}</p>
                <p className="text-3xl font-bold">{loading ? "—" : card.value}</p>
              </div>
              <Icon className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
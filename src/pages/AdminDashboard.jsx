import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { 
  Plane, Hotel, MapPin, Users, DollarSign, 
  TrendingUp, Calendar, Shield, MessageSquare, Ship, Bus, FileText, Building2 
} from "lucide-react";
import { motion } from "framer-motion";
import UnifiedBookingsTable from "../components/admin/UnifiedBookingsTable";
import SupplierPortalsPanel from "../components/admin/SupplierPortalsPanel";

export default function AdminDashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [flights, hotels, tours, flightBookings, hotelBookings, tourBookings, reviews] = await Promise.all([
        base44.entities.Flight.list(),
        base44.entities.Hotel.list(),
        base44.entities.Tour.list(),
        base44.entities.FlightBooking.list(),
        base44.entities.HotelBooking.list(),
        base44.entities.Booking.list(),
        base44.entities.Review.list(),
      ]);

      const totalRevenue = [
        ...flightBookings.map(b => b.total_price || 0),
        ...hotelBookings.map(b => b.total_price || 0),
        ...tourBookings.map(b => b.total_price || 0),
      ].reduce((sum, price) => sum + price, 0);

      return {
        flights: flights.length,
        hotels: hotels.length,
        tours: tours.length,
        totalBookings: flightBookings.length + hotelBookings.length + tourBookings.length,
        flightBookings: flightBookings.length,
        hotelBookings: hotelBookings.length,
        tourBookings: tourBookings.length,
        totalRevenue,
        pendingReviews: reviews.filter(r => r.status === "pending").length,
      };
    },
    enabled: user?.role === "admin",
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  const quickLinks = [
    { title: "Manage Flights", icon: Plane, page: "AdminFlights", color: "amber" },
    { title: "Manage Hotels", icon: Hotel, page: "AdminHotels", color: "blue" },
    { title: "Manage Tours", icon: MapPin, page: "AdminTours", color: "green" },
    { title: "Manage Ferries", icon: Ship, page: "AdminFerries", color: "cyan" },
    { title: "Manage Buses", icon: Bus, page: "AdminBuses", color: "orange" },
    { title: "Manage Visas", icon: FileText, page: "AdminVisas", color: "indigo" },
    { title: "Bank Accounts", icon: Building2, page: "AdminBankAccounts", color: "blue" },
    { title: "Supplier Payments", icon: DollarSign, page: "AdminSupplierPayments", color: "green" },
    { title: "Loyalty Program", icon: TrendingUp, page: "AdminLoyalty", color: "purple" },
    { title: "Moderate Reviews", icon: MessageSquare, page: "AdminReviews", color: "rose" },
  ];

  const statCards = [
    { title: "Total Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "blue" },
    { title: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "green" },
    { title: "Active Flights", value: stats?.flights || 0, icon: Plane, color: "amber" },
    { title: "Active Hotels", value: stats?.hotels || 0, icon: Hotel, color: "indigo" },
    { title: "Active Tours", value: stats?.tours || 0, icon: MapPin, color: "teal" },
    { title: "Pending Reviews", value: stats?.pendingReviews || 0, icon: MessageSquare, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Manage your travel platform</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(link.page)}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-0 bg-gradient-to-br from-white to-slate-50">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-${link.color}-100 flex items-center justify-center mb-3`}>
                      <link.icon className={`w-6 h-6 text-${link.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-slate-900">{link.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Supplier Portal Credentials */}
        <div className="mt-8">
          <SupplierPortalsPanel />
        </div>

        {/* All Bookings - Unified View */}
        <Card className="mt-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              All Bookings - Manual Fulfillment Center
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Process bookings via biyaheko.ph, wanderlinx.com, or tripzynx.com
            </p>
          </CardHeader>
          <CardContent>
            <UnifiedBookingsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
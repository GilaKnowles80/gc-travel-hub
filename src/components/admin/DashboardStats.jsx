import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Hotel as HotelIcon, MapPin, DollarSign, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [flights, hotels, tours, bookings, payments] = await Promise.all([
        base44.entities.Flight.list(),
        base44.entities.Hotel.list(),
        base44.entities.Tour.list(),
        base44.entities.FlightBooking.list(),
        base44.entities.Payment.filter({ status: 'completed' })
      ]);

      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

      return {
        totalFlights: flights.length,
        totalHotels: hotels.length,
        totalTours: tours.length,
        totalBookings: bookings.length,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        activeListings: flights.length + hotels.length + tours.length
      };
    }
  });

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₱${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'green', change: '+12.5%' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: CheckCircle, color: 'blue', change: '+8.2%' },
    { title: 'Active Flights', value: stats?.totalFlights || 0, icon: Plane, color: 'amber' },
    { title: 'Active Hotels', value: stats?.totalHotels || 0, icon: HotelIcon, color: 'purple' },
    { title: 'Tour Packages', value: stats?.totalTours || 0, icon: MapPin, color: 'teal' },
    { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'orange' },
    { title: 'Confirmed Today', value: stats?.confirmedBookings || 0, icon: CheckCircle, color: 'green' },
    { title: 'Active Listings', value: stats?.activeListings || 0, icon: TrendingUp, color: 'indigo' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
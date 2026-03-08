import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, MapPin, DollarSign, Users, TrendingUp, CheckCircle, Clock, Globe, Home } from 'lucide-react';

// Domestic PH airports (IATA codes)
const PH_AIRPORTS = ['MNL','CEB','DVO','ILO','BCD','KLO','LGP','MXI','CGY','ZAM','BXU','GES','TAG','CYP','TUG','CRK','LAO','MPH','PPS','RXS','SJI','TAC','VRC','WNP','DPL','ENI','MBO','OZC','MLP','SFE','TWT','USU','VIS','ZAM'];

function isDomestic(booking) {
  // Check route field (e.g. "CEB → DVO" or notes for domestic indicators)
  const route = (booking.route || booking.price_comparison_notes || '').toUpperCase();
  // If both origin and destination are PH airports or route contains common PH city names
  const phCities = ['CEB','DVO','MNL','ILO','ZAM','DAV','CGY','BAC','TAG','LGA','LGP','ILO','BCD','KLO'];
  const hasPh = phCities.some(c => route.includes(c));
  const hasIntl = ['LAX','HKG','SIN','KUL','BKK','HND','NRT','ICN','LHR','CDG','DXB','SYD','JFK','SFO','ORD','AMS','FRA','DOH','MEL','AUH','PVG','PEK','TPE','HAN','SGN'].some(c => route.includes(c));
  return hasPh && !hasIntl;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [flights, hotels, tours, flightBookings, hotelBookings, tourBookings, trainBookings, ferryBookings, busBookings, carBookings, packages] = await Promise.all([
        base44.entities.Flight.list(),
        base44.entities.Hotel.list(),
        base44.entities.Tour.list(),
        base44.entities.FlightBooking.list(),
        base44.entities.HotelBooking.list(),
        base44.entities.TourBooking.list(),
        base44.entities.TrainBooking.list(),
        base44.entities.FerryBooking.list(),
        base44.entities.BusBooking.list(),
        base44.entities.CarRentalBooking.list(),
        base44.entities.PackageBooking.list()
      ]);

      const allBookings = [
        ...flightBookings,
        ...hotelBookings,
        ...tourBookings,
        ...trainBookings,
        ...ferryBookings,
        ...busBookings,
        ...carBookings,
        ...packages
      ];

      const paidFilter = b => b.payment_status === 'paid' || b.status === 'confirmed';

      const domesticFlights = flightBookings.filter(isDomestic);
      const internationalFlights = flightBookings.filter(b => !isDomestic(b));

      const domesticRevenue = domesticFlights.filter(paidFilter).reduce((sum, b) => sum + (b.total_price || 0), 0);
      const internationalRevenue = internationalFlights.filter(paidFilter).reduce((sum, b) => sum + (b.total_price || 0), 0);
      const otherRevenue = [...hotelBookings, ...tourBookings, ...trainBookings, ...ferryBookings, ...busBookings, ...carBookings, ...packages]
        .filter(paidFilter).reduce((sum, b) => sum + (b.total_price || b.final_price || 0), 0);

      const totalRevenue = domesticRevenue + internationalRevenue + otherRevenue;
      const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
      const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
      const totalProfit = totalRevenue * 0.12;

      return {
        totalFlights: flights.length,
        totalBookings: allBookings.length,
        confirmedBookings,
        totalRevenue,
        totalProfit,
        pendingBookings,
        domesticFlightCount: domesticFlights.length,
        internationalFlightCount: internationalFlights.length,
        domesticRevenue,
        internationalRevenue,
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
    { title: 'Total Revenue', value: `₱${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
    { title: 'Est. Profit (12%)', value: `₱${(stats?.totalProfit || 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: CheckCircle, color: 'blue' },
    { title: 'Confirmed Bookings', value: stats?.confirmedBookings || 0, icon: Users, color: 'teal' },
    { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'orange' },
    { title: 'Flight Bookings', value: stats?.flightBookings || 0, icon: Plane, color: 'sky' },
    { title: 'Active Flights', value: stats?.totalFlights || 0, icon: Plane, color: 'indigo' },
    { title: 'Active Listings', value: stats?.activeListings || 0, icon: TrendingUp, color: 'purple' }
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
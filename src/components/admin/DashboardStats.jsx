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

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: `₱${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
          { title: 'Est. Profit (12%)', value: `₱${(stats?.totalProfit || 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
          { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: CheckCircle, color: 'blue' },
          { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'orange' },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domestic vs International Flight Sales */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Flight Sales Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Domestic */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Domestic Flights</p>
                    <p className="text-xs text-slate-400">Philippines routes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats?.domesticFlightCount || 0}</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Total Sales</p>
                <p className="text-xl font-bold text-blue-700">₱{(stats?.domesticRevenue || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* International */}
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">International Flights</p>
                    <p className="text-xs text-slate-400">Overseas routes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats?.internationalFlightCount || 0}</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-600 font-medium">Total Sales</p>
                <p className="text-xl font-bold text-amber-700">₱{(stats?.internationalRevenue || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
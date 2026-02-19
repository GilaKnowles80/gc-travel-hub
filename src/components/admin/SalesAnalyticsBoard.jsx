import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Users, Plane, Hotel, Calendar, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import moment from 'moment';

export default function SalesAnalyticsBoard() {
  const [period, setPeriod] = useState('current_month');
  const navigate = useNavigate();

  const { data: payments = [] } = useQuery({
    queryKey: ['analytics-payments', period],
    queryFn: () => base44.entities.Payment.filter({ status: 'completed' }, '-created_date', 1000),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['analytics-bookings', period],
    queryFn: () => base44.entities.Booking.list('-created_date', 1000),
  });

  const { data: flightBookings = [] } = useQuery({
    queryKey: ['analytics-flight-bookings', period],
    queryFn: () => base44.entities.FlightBooking.list('-created_date', 1000),
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ['analytics-hotel-bookings', period],
    queryFn: () => base44.entities.HotelBooking.list('-created_date', 1000),
  });

  // Filter data based on selected period
  const filterByPeriod = (items) => {
    const now = moment();
    const startOfPeriod = period === 'current_month' 
      ? now.clone().startOf('month')
      : period === 'last_month'
      ? now.clone().subtract(1, 'month').startOf('month')
      : period === 'last_7_days'
      ? now.clone().subtract(7, 'days')
      : period === 'last_30_days'
      ? now.clone().subtract(30, 'days')
      : now.clone().startOf('year');

    const endOfPeriod = period === 'last_month'
      ? now.clone().subtract(1, 'month').endOf('month')
      : now;

    return items.filter(item => {
      const itemDate = moment(item.created_date);
      return itemDate.isBetween(startOfPeriod, endOfPeriod, null, '[]');
    });
  };

  const filteredPayments = filterByPeriod(payments);
  const filteredBookings = filterByPeriod(bookings);
  const filteredFlightBookings = filterByPeriod(flightBookings);
  const filteredHotelBookings = filterByPeriod(hotelBookings);

  // Calculate metrics
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalBookings = filteredBookings.length + filteredFlightBookings.length + filteredHotelBookings.length;
  const flightRevenue = filteredFlightBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const hotelRevenue = filteredHotelBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const totalCustomers = new Set([...filteredBookings.map(b => b.user_email), ...filteredFlightBookings.map(b => b.user_email), ...filteredHotelBookings.map(b => b.user_email)]).size;

  // Calculate growth compared to previous period
  const calculateGrowth = (currentValue, items, key = 'amount') => {
    const now = moment();
    const prevStartOfPeriod = period === 'current_month'
      ? now.clone().subtract(1, 'month').startOf('month')
      : period === 'last_month'
      ? now.clone().subtract(2, 'months').startOf('month')
      : period === 'last_7_days'
      ? now.clone().subtract(14, 'days')
      : period === 'last_30_days'
      ? now.clone().subtract(60, 'days')
      : now.clone().subtract(1, 'year').startOf('year');

    const prevEndOfPeriod = period === 'current_month'
      ? now.clone().subtract(1, 'month').endOf('month')
      : period === 'last_month'
      ? now.clone().subtract(2, 'months').endOf('month')
      : period === 'last_7_days'
      ? now.clone().subtract(7, 'days')
      : period === 'last_30_days'
      ? now.clone().subtract(30, 'days')
      : now.clone().subtract(1, 'year').endOf('year');

    const prevItems = items.filter(item => {
      const itemDate = moment(item.created_date);
      return itemDate.isBetween(prevStartOfPeriod, prevEndOfPeriod, null, '[]');
    });

    const prevValue = prevItems.reduce((sum, item) => sum + (item[key] || 0), 0);
    if (prevValue === 0) return 0;
    return ((currentValue - prevValue) / prevValue * 100).toFixed(1);
  };

  const revenueGrowth = calculateGrowth(totalRevenue, payments);
  const bookingsGrowth = calculateGrowth(totalBookings, [...bookings, ...flightBookings, ...hotelBookings], 'id');

  const metrics = [
    {
      label: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      growth: revenueGrowth,
      subtitle: `${period === 'current_month' ? 'This month' : period === 'last_month' ? 'Last month' : period === 'last_7_days' ? 'Last 7 days' : period === 'last_30_days' ? 'Last 30 days' : 'This year'}`
    },
    {
      label: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      growth: bookingsGrowth,
      subtitle: `${filteredFlightBookings.length} flights, ${filteredHotelBookings.length} hotels`
    },
    {
      label: 'Flight Sales',
      value: `₱${flightRevenue.toLocaleString()}`,
      icon: Plane,
      color: 'from-amber-500 to-orange-600',
      growth: calculateGrowth(flightRevenue, flightBookings, 'total_price'),
      subtitle: `${filteredFlightBookings.length} bookings`
    },
    {
      label: 'Hotel Sales',
      value: `₱${hotelRevenue.toLocaleString()}`,
      icon: Hotel,
      color: 'from-purple-500 to-pink-600',
      growth: calculateGrowth(hotelRevenue, hotelBookings, 'total_price'),
      subtitle: `${filteredHotelBookings.length} bookings`
    },
    {
      label: 'Avg Booking Value',
      value: `₱${avgBookingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Target,
      color: 'from-indigo-500 to-blue-600',
      subtitle: 'Per transaction'
    },
    {
      label: 'Active Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'from-rose-500 to-red-600',
      subtitle: `${period === 'current_month' ? 'This month' : period === 'last_month' ? 'Last month' : 'Period'}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales Analytics</h2>
          <p className="text-slate-600">Real-time business performance metrics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="current_month">Current Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="year_to_date">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const growthValue = parseFloat(metric.growth);
          const showGrowth = !isNaN(growthValue) && metric.growth;
          
          return (
            <Card 
              key={idx} 
              className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate(createPageUrl('AdminDashboard') + '?tab=reports')}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Icon className="w-full h-full" />
              </div>

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {showGrowth && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                      growthValue >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${growthValue < 0 ? 'rotate-180' : ''}`} />
                      {Math.abs(growthValue)}%
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">{metric.label}</p>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="text-slate-500 text-xs">{metric.subtitle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Indicator */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center gap-3 text-white">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <div>
            <p className="font-semibold">System Status: Active</p>
            <p className="text-sm text-slate-400">Last updated: {moment().format('MMM DD, YYYY • HH:mm:ss')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, TrendingUp, ShoppingCart, Plane, Hotel, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

export default function AdminPackageSales() {
  const [period, setPeriod] = useState('30days');

  const { data: packages = [] } = useQuery({
    queryKey: ['all-packages'],
    queryFn: () => base44.entities.PackageBooking.list('-created_date')
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['package-payments'],
    queryFn: async () => {
      const allPayments = await base44.entities.Payment.list('-created_date');
      return allPayments.filter(p => p.metadata?.booking_type === 'package');
    }
  });

  const filterByPeriod = (date) => {
    const now = moment();
    const itemDate = moment(date);
    switch(period) {
      case '7days': return itemDate.isAfter(now.subtract(7, 'days'));
      case '30days': return itemDate.isAfter(now.subtract(30, 'days'));
      case '90days': return itemDate.isAfter(now.subtract(90, 'days'));
      default: return true;
    }
  };

  const filteredPackages = packages.filter(p => filterByPeriod(p.created_date));
  const paidPackages = filteredPackages.filter(p => p.status === 'paid');
  
  const totalRevenue = payments
    .filter(p => filterByPeriod(p.created_date))
    .reduce((sum, p) => sum + p.amount, 0);

  const totalProfit = paidPackages.reduce((sum, pkg) => {
    const markup = (pkg.final_price || pkg.total_price) * 0.12; // 12% avg markup
    return sum + markup;
  }, 0);

  const avgPackageValue = paidPackages.length > 0 
    ? totalRevenue / paidPackages.length 
    : 0;

  const chartData = paidPackages.reduce((acc, pkg) => {
    const date = moment(pkg.created_date).format('MMM DD');
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.revenue += pkg.final_price || pkg.total_price;
      existing.count += 1;
    } else {
      acc.push({
        date,
        revenue: pkg.final_price || pkg.total_price,
        count: 1
      });
    }
    return acc;
  }, []).slice(-14);

  const componentBreakdown = paidPackages.reduce((acc, pkg) => {
    acc.flights += pkg.flights?.length || 0;
    acc.hotels += pkg.hotels?.length || 0;
    acc.tours += pkg.tours?.length || 0;
    return acc;
  }, { flights: 0, hotels: 0, tours: 0 });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Package Sales Analytics</h1>
          <p className="text-slate-600 mt-1">Real revenue tracking and performance metrics</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['7days', '30days', '90days', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === p 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p === '7days' && 'Last 7 Days'}
              {p === '30days' && 'Last 30 Days'}
              {p === '90days' && 'Last 90 Days'}
              {p === 'all' && 'All Time'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Real money earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Packages Sold</p>
              <p className="text-3xl font-bold text-slate-900">{paidPackages.length}</p>
              <p className="text-xs text-slate-500 mt-1">{filteredPackages.length} total created</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Avg Package Value</p>
              <p className="text-3xl font-bold text-slate-900">${avgPackageValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-slate-500 mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Est. Profit</p>
              <p className="text-3xl font-bold text-slate-900">${totalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-purple-600 mt-1">~12% avg markup</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Component Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Package Components Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-900">{componentBreakdown.flights}</p>
                <p className="text-sm text-blue-700">Flights</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Hotel className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-900">{componentBreakdown.hotels}</p>
                <p className="text-sm text-purple-700">Hotels</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-900">{componentBreakdown.tours}</p>
                <p className="text-sm text-green-700">Tours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Package Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paidPackages.slice(0, 10).map(pkg => (
                <div key={pkg.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{pkg.package_name}</p>
                    <p className="text-xs text-slate-500">{moment(pkg.created_date).format('MMM DD, YYYY HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${pkg.final_price?.toLocaleString()}</p>
                      {pkg.discount_percentage > 0 && (
                        <Badge className="text-xs">{pkg.discount_percentage}% bundle discount</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
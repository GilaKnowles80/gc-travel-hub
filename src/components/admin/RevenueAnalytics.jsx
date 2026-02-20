import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export default function RevenueAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      const [payments, packages, supplierPayments, commissions] = await Promise.all([
        base44.entities.Payment.filter({ status: 'completed' }),
        base44.entities.PackageBooking.filter({ status: 'paid' }),
        base44.entities.SupplierPayment.list(),
        base44.entities.SalesCommission.filter({ status: 'paid' })
      ]);

      // Daily revenue for last 30 days
      const dailyData = {};
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = moment().subtract(29 - i, 'days').format('MMM DD');
        dailyData[date] = { date, payments: 0, packages: 0, total: 0, count: 0 };
        return date;
      });

      payments.forEach(payment => {
        const date = moment(payment.created_date).format('MMM DD');
        if (dailyData[date]) {
          dailyData[date].payments += payment.amount || 0;
          dailyData[date].total += payment.amount || 0;
          dailyData[date].count += 1;
        }
      });

      packages.forEach(pkg => {
        const date = moment(pkg.created_date).format('MMM DD');
        const revenue = pkg.final_price || pkg.total_price || 0;
        if (dailyData[date]) {
          dailyData[date].packages += revenue;
          dailyData[date].total += revenue;
          dailyData[date].count += 1;
        }
      });

      const dailyRevenue = Object.values(dailyData);

      // Revenue by booking type
      const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPackages = packages.reduce((sum, p) => sum + (p.final_price || p.total_price || 0), 0);

      const revenueByType = [
        { name: 'Individual Bookings', value: totalPayments, color: '#3b82f6' },
        { name: 'Custom Packages', value: totalPackages, color: '#a855f7' }
      ];

      // Monthly growth
      const monthlyData = {};
      [...payments, ...packages.map(p => ({ ...p, amount: p.final_price || p.total_price }))].forEach(item => {
        const month = moment(item.created_date).format('MMM YYYY');
        if (!monthlyData[month]) {
          monthlyData[month] = { month, revenue: 0, profit: 0, bookings: 0 };
        }
        monthlyData[month].revenue += item.amount || 0;
        monthlyData[month].profit += (item.amount || 0) * 0.12;
        monthlyData[month].bookings += 1;
      });

      const monthlyGrowth = Object.values(monthlyData).slice(-6);

      // Cash Flow (last 30 days)
      const cashFlowData = {};
      last30Days.forEach(date => {
        cashFlowData[date] = { date, inflow: 0, outflow: 0, net: 0 };
      });

      // Inflows (payments received)
      [...payments, ...packages.map(p => ({ ...p, amount: p.final_price || p.total_price, created_date: p.created_date }))].forEach(item => {
        const date = moment(item.created_date).format('MMM DD');
        if (cashFlowData[date]) {
          cashFlowData[date].inflow += item.amount || 0;
        }
      });

      // Outflows (supplier payments + commissions)
      supplierPayments.forEach(sp => {
        const date = moment(sp.payment_date || sp.created_date).format('MMM DD');
        if (cashFlowData[date]) {
          cashFlowData[date].outflow += sp.amount || 0;
        }
      });

      commissions.forEach(comm => {
        const date = moment(comm.paid_date || comm.created_date).format('MMM DD');
        if (cashFlowData[date]) {
          cashFlowData[date].outflow += comm.commission_amount || 0;
        }
      });

      // Calculate net
      Object.values(cashFlowData).forEach(day => {
        day.net = day.inflow - day.outflow;
      });

      const cashFlow = Object.values(cashFlowData);

      return {
        dailyRevenue,
        revenueByType: revenueByType.filter(r => r.value > 0),
        monthlyGrowth,
        cashFlow,
        totalRevenue: totalPayments + totalPackages,
        totalProfit: (totalPayments + totalPackages) * 0.12
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-80 bg-slate-100 rounded"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              ${analytics?.totalRevenue?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              From {analytics?.dailyRevenue?.reduce((sum, d) => sum + d.count, 0)} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit (Est. 12% Margin)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">
              ${analytics?.totalProfit?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Average profit margin across all bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="total" stroke="#22c55e" fill="#86efac" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Booking Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.revenueByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics?.revenueByType?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#86efac" name="Revenue ($)" />
                <Bar yAxisId="left" dataKey="profit" fill="#fbbf24" name="Profit ($)" />
                <Bar yAxisId="right" dataKey="bookings" fill="#3b82f6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Breakdown (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="payments" stackId="a" fill="#3b82f6" name="Individual Bookings" />
                <Bar dataKey="packages" stackId="a" fill="#a855f7" name="Custom Packages" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={2} name="Cash Inflow" />
                <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Cash Outflow" />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Net Cash Flow" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
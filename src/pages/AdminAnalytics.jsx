import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Percent, Crown, Target } from "lucide-react";
import moment from "moment";

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics", timeRange],
    queryFn: async () => {
      const daysBack = parseInt(timeRange);
      const startDate = moment().subtract(daysBack, "days").toISOString();

      const [payments, packages, affiliates, affiliateCommissions, premiumMembers, allUsers, bookings] = await Promise.all([
        base44.entities.Payment.filter({ status: "completed" }),
        base44.entities.PackageBooking.filter({ status: "paid" }),
        base44.entities.Affiliate.list(),
        base44.entities.AffiliateCommission.list(),
        base44.entities.PremiumMembership.filter({ status: "active" }),
        base44.entities.User.list(),
        base44.entities.Booking.list()
      ]);

      // Filter by time range
      const filterByDate = (items) => items.filter(item => 
        moment(item.created_date).isAfter(moment().subtract(daysBack, "days"))
      );

      const recentPayments = filterByDate(payments);
      const recentPackages = filterByDate(packages);
      const recentUsers = filterByDate(allUsers);
      const recentBookings = filterByDate(bookings);

      // Calculate total revenue
      const paymentRevenue = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const packageRevenue = recentPackages.reduce((sum, p) => sum + (p.final_price || p.total_price || 0), 0);
      const totalRevenue = paymentRevenue + packageRevenue;

      // Calculate profit (12% average margin)
      const totalProfit = totalRevenue * 0.12;
      const profitMargin = 12;

      // Customer metrics
      const totalCustomers = allUsers.length;
      const newCustomers = recentUsers.length;
      const activeCustomers = new Set([
        ...recentPayments.map(p => p.user_email),
        ...recentPackages.map(p => p.user_email)
      ]).size;

      // Customer Acquisition Cost (CAC) - simplified estimate
      const marketingCost = totalRevenue * 0.05; // 5% of revenue spent on marketing
      const cac = newCustomers > 0 ? marketingCost / newCustomers : 0;

      // Customer Lifetime Value (CLV)
      const avgOrderValue = recentPayments.length > 0 ? totalRevenue / (recentPayments.length + recentPackages.length) : 0;
      const avgOrdersPerCustomer = activeCustomers > 0 ? (recentPayments.length + recentPackages.length) / activeCustomers : 0;
      const clv = avgOrderValue * avgOrdersPerCustomer * 3; // 3 year estimate

      // Daily revenue trend
      const dailyData = {};
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = moment().subtract(i, "days").format("MMM DD");
        dailyData[date] = { date, revenue: 0, bookings: 0, customers: new Set() };
      }

      recentPayments.forEach(p => {
        const date = moment(p.created_date).format("MMM DD");
        if (dailyData[date]) {
          dailyData[date].revenue += p.amount || 0;
          dailyData[date].bookings += 1;
          dailyData[date].customers.add(p.user_email);
        }
      });

      recentPackages.forEach(p => {
        const date = moment(p.created_date).format("MMM DD");
        if (dailyData[date]) {
          dailyData[date].revenue += p.final_price || p.total_price || 0;
          dailyData[date].bookings += 1;
          dailyData[date].customers.add(p.user_email);
        }
      });

      const dailyRevenue = Object.values(dailyData).map(d => ({
        ...d,
        customers: d.customers.size
      }));

      // Revenue by booking type
      const bookingTypes = {};
      recentBookings.forEach(b => {
        const type = b.booking_type || "other";
        if (!bookingTypes[type]) {
          bookingTypes[type] = { name: type, value: 0, count: 0 };
        }
        bookingTypes[type].value += b.total_price || 0;
        bookingTypes[type].count += 1;
      });

      const revenueByType = Object.values(bookingTypes);

      // Affiliate performance
      const totalAffiliateCommissions = affiliateCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const affiliateBookings = affiliateCommissions.length;
      const activeAffiliates = affiliates.filter(a => a.status === "active").length;

      // Premium membership metrics
      const premiumRevenue = premiumMembers.reduce((sum, m) => {
        return sum + (m.plan_type === "monthly" ? m.plan_price : m.plan_price / 12);
      }, 0);

      // Conversion metrics
      const conversionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
      const avgBookingValue = (recentPayments.length + recentPackages.length) > 0 ? totalRevenue / (recentPayments.length + recentPackages.length) : 0;

      // Growth calculations
      const halfwayPoint = Math.floor(daysBack / 2);
      const firstHalf = dailyRevenue.slice(0, halfwayPoint);
      const secondHalf = dailyRevenue.slice(halfwayPoint);
      
      const firstHalfRevenue = firstHalf.reduce((sum, d) => sum + d.revenue, 0);
      const secondHalfRevenue = secondHalf.reduce((sum, d) => sum + d.revenue, 0);
      const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalProfit,
        profitMargin,
        totalCustomers,
        newCustomers,
        activeCustomers,
        cac,
        clv,
        dailyRevenue,
        revenueByType,
        totalAffiliateCommissions,
        affiliateBookings,
        activeAffiliates,
        premiumRevenue,
        premiumMembers: premiumMembers.length,
        conversionRate,
        avgBookingValue,
        revenueGrowth,
        totalBookings: recentPayments.length + recentPackages.length
      };
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Revenue",
      value: `₱${analytics.totalRevenue.toLocaleString()}`,
      change: analytics.revenueGrowth,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Total Profit",
      value: `₱${analytics.totalProfit.toLocaleString()}`,
      subtitle: `${analytics.profitMargin}% margin`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Active Customers",
      value: analytics.activeCustomers.toLocaleString(),
      subtitle: `${analytics.totalCustomers} total`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Total Bookings",
      value: analytics.totalBookings.toLocaleString(),
      change: analytics.conversionRate,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Customer Acquisition Cost",
      value: `₱${Math.round(analytics.cac).toLocaleString()}`,
      subtitle: "per customer",
      icon: Target,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      label: "Customer Lifetime Value",
      value: `₱${Math.round(analytics.clv).toLocaleString()}`,
      subtitle: "3 year estimate",
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      label: "Avg Booking Value",
      value: `₱${Math.round(analytics.avgBookingValue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Premium Members",
      value: analytics.premiumMembers,
      subtitle: `₱${Math.round(analytics.premiumRevenue).toLocaleString()}/mo`,
      icon: Crown,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive business intelligence and KPIs</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(kpi.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">{kpi.value}</p>
                <p className="text-sm text-slate-600">{kpi.subtitle || kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue & Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#86efac" stroke="#22c55e" name="Revenue (₱)" />
                <Bar yAxisId="right" dataKey="bookings" fill="#3b82f6" name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#a855f7" strokeWidth={2} name="Active Customers" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Booking Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.revenueByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.revenueByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">CLV : CAC Ratio</p>
                    <p className="text-2xl font-bold">
                      {analytics.cac > 0 ? (analytics.clv / analytics.cac).toFixed(1) : 0}:1
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Healthy: 3:1+</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">New Customers</p>
                    <p className="text-2xl font-bold">{analytics.newCustomers}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Revenue per Customer</p>
                    <p className="text-2xl font-bold">
                      ₱{analytics.activeCustomers > 0 ? Math.round(analytics.totalRevenue / analytics.activeCustomers).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Program Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{analytics.activeAffiliates}</p>
                <p className="text-sm text-slate-600 mt-2">Active Affiliates</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{analytics.affiliateBookings}</p>
                <p className="text-sm text-slate-600 mt-2">Affiliate Bookings</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  ₱{analytics.totalAffiliateCommissions.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 mt-2">Total Commissions</p>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">
                  ₱{analytics.affiliateBookings > 0 ? Math.round(analytics.totalAffiliateCommissions / analytics.affiliateBookings).toLocaleString() : 0}
                </p>
                <p className="text-sm text-slate-600 mt-2">Avg Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
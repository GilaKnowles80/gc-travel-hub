import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Crown, Target, Database } from "lucide-react";
import moment from "moment";
import CustomerTransactionRecords from "@/components/analytics/CustomerTransactionRecords";

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics", timeRange],
    queryFn: async () => {
      const daysBack = parseInt(timeRange);
      const startDate = moment().subtract(daysBack, "days").toISOString();

      const [
        payments, packages, affiliates, affiliateCommissions, premiumMembers, allUsers,
        tourBookings, flightBookings, hotelBookings, carBookings, ferryBookings,
        busBookings, trainBookings, cruiseBookings, visaBookings
      ] = await Promise.all([
        base44.entities.Payment.filter({ status: "completed" }),
        base44.entities.PackageBooking.filter({ status: "paid" }),
        base44.entities.Affiliate.list(),
        base44.entities.AffiliateCommission.list(),
        base44.entities.PremiumMembership.filter({ status: "active" }),
        base44.entities.User.list(),
        base44.entities.Booking.list(),
        base44.entities.FlightBooking.list(),
        base44.entities.HotelBooking.list(),
        base44.entities.CarRentalBooking.list(),
        base44.entities.FerryBooking.list(),
        base44.entities.BusBooking.list(),
        base44.entities.TrainBooking.list(),
        base44.entities.CruiseBooking.list(),
        base44.entities.TourBooking.list(),
      ]);

      // Filter by time range
      const filterByDate = (items) => items.filter(item => 
        moment(item.created_date).isAfter(moment().subtract(daysBack, "days"))
      );

      const recentPayments = filterByDate(payments);
      const recentPackages = filterByDate(packages);
      const recentUsers = filterByDate(allUsers);

      // Normalize all booking types into a unified list
      const allBookingItems = [
        ...tourBookings.map(b => ({ ...b, _type: 'Tour', _price: b.total_price || 0, _email: b.customer_email || b.client_email })),
        ...flightBookings.map(b => ({ ...b, _type: 'Flight', _price: b.total_price || 0, _email: b.passenger_email })),
        ...hotelBookings.map(b => ({ ...b, _type: 'Hotel', _price: b.total_price || 0, _email: b.guest_email })),
        ...carBookings.map(b => ({ ...b, _type: 'Car Rental', _price: b.total_price || 0, _email: b.driver_email })),
        ...ferryBookings.map(b => ({ ...b, _type: 'Ferry', _price: b.total_price || 0, _email: b.passenger_email })),
        ...busBookings.map(b => ({ ...b, _type: 'Bus', _price: b.total_price || 0, _email: b.passenger_email })),
        ...trainBookings.map(b => ({ ...b, _type: 'Train', _price: b.total_price || 0, _email: b.passenger_email })),
        ...cruiseBookings.map(b => ({ ...b, _type: 'Cruise', _price: b.total_price || 0, _email: b.passenger_email || b.guest_email })),
        ...visaBookings.map(b => ({ ...b, _type: 'Visa', _price: b.total_price || 0, _email: b.applicant_email || b.passenger_email })),
        ...packages.map(b => ({ ...b, _type: 'Package', _price: b.final_price || b.total_price || 0, _email: b.user_email })),
      ];

      const recentBookings = filterByDate(allBookingItems);

      // Calculate total revenue from ALL booking types
      const paymentRevenue = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const bookingRevenue = recentBookings.reduce((sum, b) => sum + b._price, 0);
      const totalRevenue = Math.max(paymentRevenue, bookingRevenue); // use whichever is higher (avoid double-counting)

      // Calculate profit (12% average margin)
      const totalProfit = totalRevenue * 0.12;
      const profitMargin = 12;

      // Customer metrics
      const totalCustomers = allUsers.length;
      const newCustomers = recentUsers.length;
      const activeCustomers = new Set([
        ...recentBookings.map(b => b._email).filter(Boolean),
        ...recentPayments.map(p => p.user_email).filter(Boolean),
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

      // Add all booking types to daily trend
      recentBookings.forEach(b => {
        const date = moment(b.created_date).format("MMM DD");
        if (dailyData[date]) {
          dailyData[date].revenue += b._price;
          dailyData[date].bookings += 1;
          if (b._email) dailyData[date].customers.add(b._email);
        }
      });

      const dailyRevenue = Object.values(dailyData).map(d => ({
        ...d,
        customers: d.customers.size
      }));

      // Revenue by booking type (using normalized list)
      const bookingTypes = {};
      recentBookings.forEach(b => {
        const type = b._type || "Other";
        if (!bookingTypes[type]) {
          bookingTypes[type] = { name: type, value: 0, count: 0 };
        }
        bookingTypes[type].value += b._price;
        bookingTypes[type].count += 1;
      });

      const revenueByType = Object.values(bookingTypes).filter(t => t.value > 0 || t.count > 0);

      // Sales funnel data
      const totalVisitors = allUsers.length * 3; // Estimate
      const registeredUsers = allUsers.length;
      const browsedProducts = recentBookings.length * 2;
      const addedToCart = recentBookings.length * 1.5;
      const completedPayments = recentPayments.length + recentPackages.length;

      const salesFunnel = [
        { stage: 'Visitors', count: totalVisitors, percentage: 100 },
        { stage: 'Registered', count: registeredUsers, percentage: (registeredUsers / totalVisitors) * 100 },
        { stage: 'Browsed', count: Math.round(browsedProducts), percentage: (browsedProducts / totalVisitors) * 100 },
        { stage: 'Added to Cart', count: Math.round(addedToCart), percentage: (addedToCart / totalVisitors) * 100 },
        { stage: 'Completed', count: completedPayments, percentage: (completedPayments / totalVisitors) * 100 }
      ];

      // Top selling products (by booking type)
      const productSales = {};
      recentBookings.forEach(b => {
        const name = b.tour_title || b.hotel_name || b.route || b.flight_number || b._type;
        const key = `${b._type}_${name}`;
        if (!productSales[key]) {
          productSales[key] = { 
            name: name || `${b._type} Booking`,
            type: b._type,
            sales: 0,
            revenue: 0
          };
        }
        productSales[key].sales += 1;
        productSales[key].revenue += b._price;
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Monthly sales comparison
      const monthlySales = {};
      for (let i = 11; i >= 0; i--) {
        const month = moment().subtract(i, 'months').format('MMM YY');
        monthlySales[month] = { month, sales: 0, revenue: 0 };
      }

      recentBookings.forEach(item => {
        const month = moment(item.created_date).format('MMM YY');
        if (monthlySales[month]) {
          monthlySales[month].sales += 1;
          monthlySales[month].revenue += item._price;
        }
      });

      const salesTrend = Object.values(monthlySales);

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
        totalBookings: recentPayments.length + recentPackages.length,
        salesFunnel,
        topProducts,
        salesTrend
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

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2"><Database className="w-4 h-4" />Customer Records</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomerTransactionRecords />
          </TabsContent>

          <TabsContent value="overview">
            <div>
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

        {/* Sales Trend - Monthly */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={analytics.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (₱)" />
                <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} name="Sales Count" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Revenue & Bookings Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Revenue & Bookings Trend</CardTitle>
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

        {/* Top Selling Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Selling Products/Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue (₱)" />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.salesFunnel.map((stage, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{stage.stage}</span>
                      <span className="text-sm text-slate-600">
                        {stage.count} ({stage.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Conversion Rate: {analytics.salesFunnel[analytics.salesFunnel.length - 1].percentage.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
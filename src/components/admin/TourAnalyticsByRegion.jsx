import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Users, DollarSign, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function TourAnalyticsByRegion() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionData, setRegionData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('analyzeToursByRegion', {});
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        setData(response.data.data);
        
        // Group by region
        const grouped = {};
        response.data.data.forEach(item => {
          if (!grouped[item.region]) {
            grouped[item.region] = {
              region: item.region,
              bookings: 0,
              revenue: 0,
              avgRating: 0,
              customers: 0,
              packages: 0
            };
          }
          grouped[item.region].bookings += item.bookings;
          grouped[item.region].revenue += item.revenue;
          grouped[item.region].avgRating = (grouped[item.region].avgRating + item.rating) / 2;
          grouped[item.region].customers += item.customers;
          grouped[item.region].packages += 1;
        });
        
        const regionArray = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
        setRegionData(regionArray);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching tour analytics:', err);
      setError('Failed to fetch tour analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const topPackages = data.slice(0, 10);
  const topRegions = regionData.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{regionData.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active regions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.reduce((sum, item) => sum + item.bookings, 0).toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Across all packages</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(data.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(1)}k</div>
            <p className="text-xs text-slate-500 mt-1">Total tour revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.reduce((sum, item) => sum + item.customers, 0).toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="byRegion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="byRegion">By Region</TabsTrigger>
          <TabsTrigger value="topPackages">Top Packages</TabsTrigger>
          <TabsTrigger value="regionBreakdown">Region Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="byRegion">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Region</CardTitle>
              <CardDescription>Top performing regions by total revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topRegions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#f59e0b" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topPackages">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Tour Packages</CardTitle>
              <CardDescription>By number of bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topPackages.map((pkg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{pkg.packageName}</p>
                      <p className="text-xs text-slate-500">{pkg.region}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-sm">{pkg.bookings}</span>
                      </div>
                      <p className="text-xs text-slate-600">${pkg.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regionBreakdown">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Region</CardTitle>
              <CardDescription>Distribution of bookings across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topRegions}
                    dataKey="bookings"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    label={({ region, percent }) => `${region} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {topRegions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regional Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Details</CardTitle>
          <CardDescription>Complete breakdown by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Region</th>
                  <th className="text-center py-3 px-4 font-semibold">Packages</th>
                  <th className="text-center py-3 px-4 font-semibold">Bookings</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-center py-3 px-4 font-semibold">Avg Rating</th>
                  <th className="text-center py-3 px-4 font-semibold">Customers</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((region, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{region.region}</td>
                    <td className="py-3 px-4 text-center">{region.packages}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">{region.bookings}</td>
                    <td className="py-3 px-4 text-right font-semibold">${region.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {region.avgRating.toFixed(1)} ⭐
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{region.customers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
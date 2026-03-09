import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Database, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSnapshotTrend() {
  const { data: snapshots, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-snapshots'],
    queryFn: () => base44.entities.AdminSnapshot.list('-snapshot_date', 30),
  });

  const handleRecordNow = async () => {
    await base44.functions.invoke('recordAdminSnapshot', {});
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-48 bg-slate-100 rounded" />
      </Card>
    );
  }

  const sorted = [...(snapshots || [])].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));

  const chartData = sorted.map(s => ({
    date: s.snapshot_date?.slice(5), // MM-DD
    Revenue: Math.round(s.total_revenue || 0),
    Profit: Math.round(s.total_profit || 0),
    Bookings: s.total_bookings || 0,
    Customers: s.total_customers || 0,
  }));

  const latest = sorted[sorted.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-700">Auto-Recorded Admin Snapshots</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{snapshots?.length || 0} records</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleRecordNow} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          Record Now
        </Button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Latest Revenue', value: `₱${(latest.total_revenue || 0).toLocaleString()}`, color: 'green' },
            { label: 'Bookings', value: latest.total_bookings || 0, color: 'blue' },
            { label: 'Customers', value: latest.total_customers || 0, color: 'purple' },
            { label: 'Open Tickets', value: latest.open_support_tickets || 0, color: 'amber' },
          ].map((item, i) => (
            <div key={i} className={`bg-${item.color}-50 border border-${item.color}-100 rounded-lg p-3`}>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className={`text-xl font-bold text-${item.color}-700`}>{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">As of {latest.snapshot_date}</p>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Revenue & Bookings Trend (Daily Snapshots)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [n === 'Revenue' || n === 'Profit' ? `₱${v.toLocaleString()}` : v, n]} />
                <Legend />
                <Area type="monotone" dataKey="Revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Profit" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No snapshots yet. Click "Record Now" to capture today's metrics.
        </div>
      )}
    </div>
  );
}
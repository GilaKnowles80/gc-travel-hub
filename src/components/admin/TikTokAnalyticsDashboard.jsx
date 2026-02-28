import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heart, Users, Video, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TikTokAnalyticsDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { data: analytics = [], isLoading, refetch } = useQuery({
    queryKey: ['tiktokAnalytics'],
    queryFn: () => base44.entities.TikTokAnalytics.list('-recorded_at', 50)
  });

  const refreshMutation = useMutation({
    mutationFn: () => base44.functions.invoke('fetchTikTokAnalytics', {}),
    onSuccess: () => {
      refetch();
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to fetch TikTok data');
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMutation.mutateAsync();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading TikTok analytics...</div>;
  }

  const latestData = analytics[0];
  const previousData = analytics[1];

  const followerGrowth = latestData && previousData 
    ? latestData.follower_count - previousData.follower_count
    : 0;

  const videoGrowth = latestData && previousData
    ? latestData.video_count - previousData.video_count
    : 0;

  const heartGrowth = latestData && previousData
    ? latestData.heart_count - previousData.heart_count
    : 0;

  // Prepare chart data (last 30 days)
  const chartData = analytics
    .slice()
    .reverse()
    .map(item => ({
      date: new Date(item.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      followers: item.follower_count,
      hearts: item.heart_count,
      videos: item.video_count
    }))
    .slice(-30);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">TikTok Analytics</h2>
          {latestData && (
            <p className="text-sm text-slate-500 mt-1">
              @{latestData.username} • Last updated {new Date(latestData.recorded_at).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing && <Loader2 className="w-4 h-4 animate-spin" />}
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Followers Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Followers</CardTitle>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestData.follower_count.toLocaleString()}</div>
              <p className={`text-sm mt-2 ${followerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {followerGrowth >= 0 ? '+' : ''}{followerGrowth.toLocaleString()} since last check
              </p>
            </CardContent>
          </Card>

          {/* Likes Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Likes</CardTitle>
                <Heart className="w-4 h-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestData.heart_count.toLocaleString()}</div>
              <p className={`text-sm mt-2 ${heartGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {heartGrowth >= 0 ? '+' : ''}{heartGrowth.toLocaleString()} since last check
              </p>
            </CardContent>
          </Card>

          {/* Videos Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Videos</CardTitle>
                <Video className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestData.video_count.toLocaleString()}</div>
              <p className={`text-sm mt-2 ${videoGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {videoGrowth >= 0 ? '+' : ''}{videoGrowth.toLocaleString()} since last check
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Info */}
      {latestData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {latestData.avatar_url && (
                <img
                  src={latestData.avatar_url}
                  alt={latestData.display_name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{latestData.display_name}</h3>
                  {latestData.is_verified && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">✓ Verified</span>
                  )}
                </div>
                <p className="text-slate-600">@{latestData.username}</p>
                {latestData.bio && (
                  <p className="text-slate-600 mt-2 max-w-md">{latestData.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Follower Growth Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#3b82f6" 
                  dot={false}
                  name="Followers"
                />
                <Line 
                  type="monotone" 
                  dataKey="hearts" 
                  stroke="#ef4444" 
                  dot={false}
                  name="Total Likes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Points Table */}
      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-right py-2 px-4">Followers</th>
                    <th className="text-right py-2 px-4">Likes</th>
                    <th className="text-right py-2 px-4">Videos</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.slice(0, 20).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4">
                        {new Date(item.recorded_at).toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {item.follower_count.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {item.heart_count.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {item.video_count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
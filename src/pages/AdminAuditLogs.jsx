import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, AlertTriangle, Activity, Globe, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.asServiceRole.entities.AuditLog.list('-created_date', 500),
    enabled: user?.role === 'admin',
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => base44.asServiceRole.entities.UserSession.list('-last_active', 500),
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  if (user?.role !== 'admin') {
    return <div className="p-8 text-red-600">Admin access required</div>;
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = search === '' ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getSeverityColor = (severity) => ({
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }[severity] || 'bg-slate-100 text-slate-700');

  // Page traffic stats from sessions
  const pageCounts = {};
  sessions.forEach(s => {
    if (s.current_page) {
      pageCounts[s.current_page] = (pageCounts[s.current_page] || 0) + 1;
    }
  });
  const pageTraffic = Object.entries(pageCounts)
    .map(([page, visits]) => ({ page, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 15);

  // Device breakdown
  const deviceCounts = { mobile: 0, desktop: 0 };
  sessions.forEach(s => { if (s.device_type) deviceCounts[s.device_type] = (deviceCounts[s.device_type] || 0) + 1; });
  const deviceData = [
    { name: 'Desktop', value: deviceCounts.desktop },
    { name: 'Mobile', value: deviceCounts.mobile },
  ].filter(d => d.value > 0);

  // Active in last 5 min
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const liveVisitors = sessions.filter(s => s.last_active >= fiveMinAgo).length;

  // Audit stats
  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const todayCount = logs.filter(l => l.created_date >= new Date().toISOString().slice(0, 10)).length;

  // Entity type breakdown from logs
  const entityCounts = {};
  logs.forEach(l => { if (l.entity_type) entityCounts[l.entity_type] = (entityCounts[l.entity_type] || 0) + 1; });
  const entityData = Object.entries(entityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Audit Logs & Page Traffic</h1>
              <p className="text-slate-600">Auto-detected system activity, entity changes & visitor analytics</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Audit Logs', value: logs.length, icon: Shield, color: 'blue' },
            { label: 'Today\'s Events', value: todayCount, icon: Activity, color: 'green' },
            { label: 'Critical Alerts', value: criticalCount, icon: AlertTriangle, color: 'red' },
            { label: 'Live Visitors', value: liveVisitors, icon: Globe, color: 'purple' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="logs">
          <TabsList className="mb-6">
            <TabsTrigger value="logs"><Shield className="w-4 h-4 mr-2" />Audit Logs</TabsTrigger>
            <TabsTrigger value="traffic"><Globe className="w-4 h-4 mr-2" />Page Traffic</TabsTrigger>
          </TabsList>

          {/* AUDIT LOGS TAB */}
          <TabsContent value="logs" className="space-y-4">
            {/* Entity breakdown chart */}
            {entityData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Events by Entity Type (auto-detected)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={entityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search user, action, entity..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading logs...</div>
              ) : filteredLogs.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-slate-500">No audit logs found</CardContent></Card>
              ) : (
                filteredLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {log.severity}
                            </Badge>
                            <Badge variant="outline">{log.action}</Badge>
                            {log.entity_type && <Badge variant="outline">{log.entity_type}</Badge>}
                            {log.entity_id && log.entity_id !== 'undefined' && (
                              <span className="text-xs text-slate-400 font-mono">#{log.entity_id.slice(0, 8)}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500">User:</span>
                              <p className="font-medium truncate">{log.user_email}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">IP:</span>
                              <p className="font-mono text-xs">{log.ip_address}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Time:</span>
                              <p className="text-xs">{format(new Date(log.created_date), 'MMM dd, yyyy HH:mm:ss')}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Status:</span>
                              <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {log.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* PAGE TRAFFIC TAB */}
          <TabsContent value="traffic" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Device Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    {deviceData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={deviceData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1"><Monitor className="w-4 h-4 text-blue-500" /> Desktop: {deviceCounts.desktop}</div>
                          <div className="flex items-center gap-1"><Smartphone className="w-4 h-4 text-green-500" /> Mobile: {deviceCounts.mobile}</div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-slate-400 py-8 text-sm">No device data yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Top Pages by Visits</CardTitle></CardHeader>
                  <CardContent>
                    {pageTraffic.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={pageTraffic} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="page" type="category" width={120} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="visits" fill="#22c55e" name="Sessions" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-slate-400 py-8 text-sm">No traffic data yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Live session table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Recent Sessions ({sessions.length} total · {liveVisitors} live)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b">
                        <th className="pb-2 pr-4">User</th>
                        <th className="pb-2 pr-4">Page</th>
                        <th className="pb-2 pr-4">Device</th>
                        <th className="pb-2 pr-4">Last Active</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 30).map((s) => {
                        const isLive = s.last_active >= fiveMinAgo;
                        return (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-2 pr-4 truncate max-w-[150px]">{s.user_email || 'anonymous'}</td>
                            <td className="py-2 pr-4 text-blue-600 truncate max-w-[140px]">{s.current_page || '/'}</td>
                            <td className="py-2 pr-4">
                              {s.device_type === 'mobile'
                                ? <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
                                : <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>}
                            </td>
                            <td className="py-2 pr-4 text-xs text-slate-500">
                              {s.last_active ? format(new Date(s.last_active), 'MMM dd HH:mm:ss') : '-'}
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isLive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {isLive ? '● Live' : 'Offline'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
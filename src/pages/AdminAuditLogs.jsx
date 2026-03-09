import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, AlertTriangle, Activity, Globe, Monitor, Smartphone, RefreshCw, Download, ChevronDown, ChevronUp, FileText, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const SEVERITY_STYLES = {
  low:      { badge: 'bg-blue-100 text-blue-700 border-blue-200',      label: 'Low',      dot: 'bg-blue-400' },
  medium:   { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium',   dot: 'bg-yellow-400' },
  high:     { badge: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High',     dot: 'bg-orange-400' },
  critical: { badge: 'bg-red-100 text-red-700 border-red-200',          label: 'Critical', dot: 'bg-red-500' },
};

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  payment: 'bg-purple-100 text-purple-700',
  login:  'bg-slate-100 text-slate-600',
  admin_action: 'bg-amber-100 text-amber-700',
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function exportCSV(logs) {
  const headers = ['Timestamp (PHT)', 'Actor', 'Actor Type', 'Action', 'Entity Type', 'Record ID', 'Severity', 'Status', 'Description', 'Compliance Note'];
  const rows = logs.map(l => [
    l.created_date ? format(new Date(l.created_date), 'yyyy-MM-dd HH:mm:ss') : '',
    l.user_email || '',
    l.actor_type || '',
    l.action || '',
    l.entity_type || '',
    l.entity_id || '',
    l.severity || '',
    l.status || '',
    (l.description || '').replace(/,/g, ';'),
    (l.compliance_note || '').replace(/,/g, ';'),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GCTravel_AuditLog_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
  a.click();
}

function DiffViewer({ changes }) {
  if (!changes || Object.keys(changes).length === 0) return null;
  return (
    <div className="mt-3 bg-slate-50 rounded-lg border p-3 text-xs font-mono overflow-x-auto">
      <p className="text-slate-500 mb-2 font-sans font-semibold text-xs uppercase tracking-wide">Field Changes</p>
      {Object.entries(changes).map(([field, val]) => {
        if (field === 'created_with') {
          return (
            <div key={field} className="mb-1">
              <span className="text-slate-500">Created with: </span>
              {Object.entries(val).map(([k, v]) => (
                <span key={k} className="mr-3"><span className="text-slate-500">{k}=</span><span className="text-green-700">{String(v ?? '')}</span></span>
              ))}
            </div>
          );
        }
        if (field === 'deleted_record') {
          return (
            <div key={field} className="text-red-600">
              <span className="font-semibold">Deleted — </span>
              {Object.entries(val).filter(([k]) => k !== 'deleted_at').map(([k, v]) => (
                <span key={k} className="mr-3">{k}: {String(v ?? '')}</span>
              ))}
            </div>
          );
        }
        if (field === 'note') {
          return <div key={field} className="text-slate-500 italic">{val}</div>;
        }
        return (
          <div key={field} className="flex gap-2 mb-0.5">
            <span className="text-slate-600 min-w-[120px]">{field}:</span>
            <span className="text-red-500 line-through mr-1">{String(val?.from ?? '—')}</span>
            <span className="text-slate-400">→</span>
            <span className="text-green-600 ml-1">{String(val?.to ?? '—')}</span>
          </div>
        );
      })}
    </div>
  );
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.low;
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;

  return (
    <div className={`border rounded-xl overflow-hidden ${log.severity === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
      <div
        className={`p-4 ${hasChanges ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
        onClick={() => hasChanges && setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sev.dot}`} />
            <div className="flex-1 min-w-0">
              {/* Top row: badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={`${sev.badge} border text-xs font-semibold`}>
                  {log.severity === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {sev.label}
                </Badge>
                <Badge className={`${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'} text-xs`}>
                  {log.action}
                </Badge>
                {log.actor_type && (
                  <Badge variant="outline" className="text-xs">
                    {log.actor_type === 'automation' ? '🤖' : log.actor_type === 'admin' ? '🛡' : '👤'} {log.actor_type}
                  </Badge>
                )}
                {log.entity_type && (
                  <Badge variant="outline" className="text-xs font-mono">{log.entity_type}</Badge>
                )}
                {log.entity_id && log.entity_id.length > 4 && (
                  <span className="text-xs text-slate-400 font-mono">#{log.entity_id.slice(0, 10)}</span>
                )}
              </div>

              {/* Description */}
              {log.description && (
                <p className="text-sm text-slate-700 font-medium mb-1.5">{log.description}</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span><span className="font-medium text-slate-600">Actor:</span> {log.user_email}</span>
                <span><span className="font-medium text-slate-600">Time:</span> {log.created_date ? format(new Date(log.created_date), 'MMM dd, yyyy · HH:mm:ss') : '—'}</span>
                {log.compliance_note && (
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />{log.compliance_note}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
              {log.status || 'success'}
            </Badge>
            {hasChanges && (
              expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && hasChanges && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-2">
          <DiffViewer changes={log.changes} />
        </div>
      )}
    </div>
  );
}

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.asServiceRole.entities.AuditLog.list('-created_date', 500),
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => base44.asServiceRole.entities.UserSession.list('-last_active', 300),
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-slate-500">Administrator access required to view audit logs.</p>
        </div>
      </div>
    );
  }

  // All unique entity types for filter
  const entityTypes = [...new Set(logs.map(l => l.entity_type).filter(Boolean))].sort();

  const filteredLogs = logs.filter(log => {
    if (search) {
      const q = search.toLowerCase();
      if (!log.user_email?.toLowerCase().includes(q) &&
          !log.action?.toLowerCase().includes(q) &&
          !log.entity_type?.toLowerCase().includes(q) &&
          !log.description?.toLowerCase().includes(q) &&
          !log.entity_id?.toLowerCase().includes(q)) return false;
    }
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
    return true;
  });

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter(l => l.created_date?.startsWith(today));
  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const liveVisitors = sessions.filter(s => s.last_active >= fiveMinAgo).length;

  // Entity breakdown
  const entityCounts = {};
  logs.forEach(l => { if (l.entity_type) entityCounts[l.entity_type] = (entityCounts[l.entity_type] || 0) + 1; });
  const entityData = Object.entries(entityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value).slice(0, 10);

  // Action breakdown
  const actionCounts = {};
  logs.forEach(l => { if (l.action) actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
  const actionData = Object.entries(actionCounts).map(([name, value]) => ({ name, value }));

  // Severity breakdown
  const sevCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  logs.forEach(l => { if (l.severity) sevCounts[l.severity] = (sevCounts[l.severity] || 0) + 1; });
  const sevData = Object.entries(sevCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  // Daily activity (last 7 days)
  const dailyMap = {};
  logs.forEach(l => {
    const d = l.created_date?.slice(0, 10);
    if (d) dailyMap[d] = (dailyMap[d] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date: format(new Date(date), 'MMM dd'), count }));

  // Page traffic
  const pageCounts = {};
  sessions.forEach(s => { if (s.current_page) pageCounts[s.current_page] = (pageCounts[s.current_page] || 0) + 1; });
  const pageTraffic = Object.entries(pageCounts)
    .map(([page, visits]) => ({ page, visits }))
    .sort((a, b) => b.visits - a.visits).slice(0, 12);

  const deviceCounts = { mobile: 0, desktop: 0 };
  sessions.forEach(s => { if (s.device_type) deviceCounts[s.device_type] = (deviceCounts[s.device_type] || 0) + 1; });
  const deviceData = [
    { name: 'Desktop', value: deviceCounts.desktop },
    { name: 'Mobile', value: deviceCounts.mobile },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Compliance Audit Trail</h1>
                  <p className="text-sm text-slate-500">GC Travel & Tours — Automated Activity Ledger</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700 border border-green-200">✓ Auto-recorded</Badge>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200">✓ Field-level diffs</Badge>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200">✓ RA 10173 Data Privacy</Badge>
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200">✓ DOT Consumer Protection</Badge>
                <Badge className="bg-slate-100 text-slate-600 border">✓ BIR/SEC Financial Records</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(filteredLogs)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-500' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Audit Events', value: logs.length.toLocaleString(), icon: FileText, bg: 'bg-blue-50', iconColor: 'text-blue-600', note: 'All time' },
            { label: "Today's Events", value: todayLogs.length, icon: Activity, bg: 'bg-green-50', iconColor: 'text-green-600', note: 'Since midnight' },
            { label: 'Critical Alerts', value: criticalCount, icon: AlertTriangle, bg: 'bg-red-50', iconColor: 'text-red-600', note: 'Payment & wallet events' },
            { label: 'Live Visitors', value: liveVisitors, icon: Globe, bg: 'bg-purple-50', iconColor: 'text-purple-600', note: 'Active in last 5 min' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.note}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="logs">
          <TabsList className="mb-6 bg-white border shadow-sm">
            <TabsTrigger value="logs" className="gap-2"><Shield className="w-4 h-4" />Audit Trail</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><Activity className="w-4 h-4" />Analytics</TabsTrigger>
            <TabsTrigger value="traffic" className="gap-2"><Globe className="w-4 h-4" />Page Traffic</TabsTrigger>
          </TabsList>

          {/* ── AUDIT TRAIL TAB ── */}
          <TabsContent value="logs" className="space-y-4">
            {/* Filters */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search actor, action, entity, description..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger><SelectValue placeholder="All Severities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🔵 Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="admin_action">Admin Action</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger><SelectValue placeholder="All Entities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {entityTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(search || severityFilter !== 'all' || actionFilter !== 'all' || entityFilter !== 'all') && (
                  <p className="text-xs text-slate-500 mt-2">
                    Showing {filteredLogs.length} of {logs.length} events
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-16 text-slate-400">
                  <Shield className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                  Loading audit records...
                </div>
              ) : filteredLogs.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No audit events match your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLogs.map(log => <LogRow key={log.id} log={log} />)
              )}
            </div>
          </TabsContent>

          {/* ── ANALYTICS TAB ── */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Daily activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Audit Events (Last 7 Days)</CardTitle>
                  <CardDescription className="text-xs">All automated + manual events recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Events" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Severity breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Events by Severity</CardTitle>
                  <CardDescription className="text-xs">Compliance risk distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sevData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {sevData.map((entry, i) => (
                          <Cell key={i} fill={
                            entry.name === 'critical' ? '#ef4444' :
                            entry.name === 'high' ? '#f97316' :
                            entry.name === 'medium' ? '#eab308' : '#3b82f6'
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Entity breakdown */}
              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Events by Record Type</CardTitle>
                  <CardDescription className="text-xs">Which entity types are generating the most audit events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={entityData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name="Events" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Compliance notice */}
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-100">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Compliance Coverage</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      All audit events are recorded automatically by GC Travel's system automation — not manually entered. Each record captures the real actor, timestamp, affected record, and field-level changes.
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li><strong>RA 10173 (Data Privacy Act):</strong> Personal data access and modifications are logged with actor attribution.</li>
                      <li><strong>DOT Consumer Protection:</strong> All booking create/update/delete events are immutably recorded.</li>
                      <li><strong>BIR/SEC Financial Compliance:</strong> Payment and wallet transactions are logged at critical severity with email alerts.</li>
                      <li><strong>BSP E-Money Regulation:</strong> Wallet and WalletTransaction events are tracked as critical.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAGE TRAFFIC TAB ── */}
          <TabsContent value="traffic" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Device Breakdown</CardTitle>
                  <CardDescription className="text-xs">Sessions by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  {deviceData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={deviceData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Monitor className="w-4 h-4 text-blue-500" /> {deviceCounts.desktop}</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-4 h-4 text-green-500" /> {deviceCounts.mobile}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-slate-400 py-8 text-sm">No session data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top Pages by Sessions</CardTitle>
                  <CardDescription className="text-xs">Which pages visitors are accessing most</CardDescription>
                </CardHeader>
                <CardContent>
                  {pageTraffic.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={pageTraffic} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="page" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#22c55e" name="Sessions" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-8 text-sm">No traffic data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live sessions table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Visitor Sessions
                  <Badge className="bg-green-100 text-green-700 ml-1">{liveVisitors} live now</Badge>
                  <span className="text-slate-400 font-normal text-xs">({sessions.length} total recorded)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b pb-2">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 pr-4">Current Page</th>
                        <th className="pb-3 pr-4">Device</th>
                        <th className="pb-3 pr-4">Last Active</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 30).map((s) => {
                        const isLive = s.last_active >= fiveMinAgo;
                        return (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-2.5 pr-4 text-sm max-w-[160px] truncate">{s.user_email || <span className="text-slate-400 italic">anonymous</span>}</td>
                            <td className="py-2.5 pr-4 text-blue-600 text-xs font-mono max-w-[140px] truncate">{s.current_page || '/'}</td>
                            <td className="py-2.5 pr-4 text-xs text-slate-600">
                              {s.device_type === 'mobile'
                                ? <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
                                : <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>}
                            </td>
                            <td className="py-2.5 pr-4 text-xs text-slate-500">
                              {s.last_active ? format(new Date(s.last_active), 'MMM dd · HH:mm:ss') : '—'}
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isLive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
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
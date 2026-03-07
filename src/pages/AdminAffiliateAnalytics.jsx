import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, ExternalLink, TrendingUp, MousePointer, Globe, Tag, BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PLATFORMS = ["klook", "agoda", "booking_com", "airbnb", "expedia", "viator", "tripadvisor", "12go", "traveloka", "other"];
const CATEGORIES = ["tours", "hotels", "flights", "activities", "transport", "insurance", "other"];
const PLATFORM_COLORS = { klook: "#e63946", agoda: "#e91e63", booking_com: "#003580", airbnb: "#ff5a5f", expedia: "#f5a623", viator: "#39c1b3", tripadvisor: "#00af87", "12go": "#1e88e5", traveloka: "#0064d2", other: "#94a3b8" };

const emptyLink = { name: "", platform: "klook", category: "tours", destination: "", base_url: "", description: "", image_url: "", commission_rate: "", is_active: true, featured: false };

export default function AdminAffiliateAnalytics() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLink);
  const [activeTab, setActiveTab] = useState("dashboard");
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: () => base44.entities.AffiliateLink.list('-total_clicks'),
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ['affiliate-clicks'],
    queryFn: () => base44.entities.AffiliateClick.list('-clicked_at', 500),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.AffiliateLink.update(editing.id, data)
      : base44.entities.AffiliateLink.create(data),
    onSuccess: () => { qc.invalidateQueries(['affiliate-links']); setShowForm(false); setEditing(null); setForm(emptyLink); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AffiliateLink.delete(id),
    onSuccess: () => qc.invalidateQueries(['affiliate-links']),
  });

  const handleEdit = (link) => { setEditing(link); setForm({ ...link }); setShowForm(true); };

  const handleSave = () => {
    const data = { ...form, commission_rate: parseFloat(form.commission_rate) || 0 };
    saveMutation.mutate(data);
  };

  // Analytics computations
  const totalClicks = clicks.length;
  const uniquePlatforms = [...new Set(clicks.map(c => c.platform))].length;
  const clicksByPlatform = PLATFORMS.map(p => ({ name: p.replace(/_/g, ' '), clicks: clicks.filter(c => c.platform === p).length })).filter(p => p.clicks > 0).sort((a, b) => b.clicks - a.clicks);
  const clicksByCategory = CATEGORIES.map(c => ({ name: c, value: clicks.filter(cl => cl.category === c).length })).filter(c => c.value > 0);

  // Last 7 days trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), clicks: clicks.filter(c => c.clicked_at?.startsWith(dateStr)).length };
  });

  const PIE_COLORS = ["#f59e0b", "#e63946", "#003580", "#ff5a5f", "#39c1b3", "#0064d2", "#94a3b8"];

  if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-500">Access denied.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-amber-500" /> Affiliate Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage your affiliate partner links</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm(emptyLink); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Link
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["dashboard", "links"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Clicks", value: totalClicks, icon: MousePointer, color: "text-blue-500" },
                { label: "Active Links", value: links.filter(l => l.is_active).length, icon: Globe, color: "text-green-500" },
                { label: "Platforms", value: uniquePlatforms, icon: Tag, color: "text-purple-500" },
                { label: "Top Platform", value: clicksByPlatform[0]?.name || "—", icon: TrendingUp, color: "text-amber-500" },
              ].map((s, i) => {
                const IconComp = s.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1"><IconComp className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-slate-500">{s.label}</span></div>
                    <p className="text-2xl font-bold text-slate-800 capitalize">{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 7-day trend */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Clicks Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last7Days}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Clicks by Platform */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Clicks by Platform</h3>
                {clicksByPlatform.length === 0 ? (
                  <div className="text-center py-12 text-slate-400"><BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No clicks yet</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={clicksByPlatform} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#e63946" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Pie */}
            {clicksByCategory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Clicks by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={clicksByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {clicksByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top performing links */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Top Performing Links</h3></div>
              <div className="divide-y divide-slate-50">
                {links.slice(0, 10).map((link, i) => (
                  <div key={link.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{link.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{link.platform?.replace(/_/g, ' ')} · {link.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{link.total_clicks || 0}</p>
                      <p className="text-xs text-slate-400">clicks</p>
                    </div>
                  </div>
                ))}
                {links.length === 0 && <div className="p-8 text-center text-slate-400">No links yet.</div>}
              </div>
            </div>
          </>
        )}

        {activeTab === "links" && (
          <>
            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
                <h2 className="font-bold text-slate-800 text-lg mb-5">{editing ? 'Edit Link' : 'Add Affiliate Link'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Name *</label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Klook Boracay Island Hopping" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Platform *</label>
                    <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PLATFORMS.map(pl => <SelectItem key={pl} value={pl}>{pl.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Destination</label>
                    <Input value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="e.g., Boracay" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Full Affiliate URL *</label>
                    <Input value={form.base_url} onChange={e => setForm(p => ({ ...p, base_url: e.target.value }))} placeholder="https://affiliate.klook.com/..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Commission Rate (%)</label>
                    <Input type="number" value={form.commission_rate} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} placeholder="e.g., 5" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Image URL</label>
                    <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    {editing ? 'Save Changes' : 'Create Link'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Links Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h2 className="font-semibold text-slate-800">All Affiliate Links ({links.length})</h2></div>
              {linksLoading ? (
                <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" /></div>
              ) : links.length === 0 ? (
                <div className="p-12 text-center text-slate-400"><Globe className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No affiliate links yet.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Platform</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Clicks</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {links.map(link => (
                        <tr key={link.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{link.name}</p>
                            <p className="text-xs text-slate-400">{link.destination}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-xs px-2 py-1 rounded-full font-medium" style={{ background: (PLATFORM_COLORS[link.platform] || '#94a3b8') + '20', color: PLATFORM_COLORS[link.platform] || '#94a3b8' }}>
                              {link.platform?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 capitalize text-xs text-slate-500">{link.category}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{link.total_clicks || 0}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {link.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <a href={link.base_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-colors inline-flex">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(link)}><Edit2 className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => { if (confirm('Delete this link?')) deleteMutation.mutate(link.id); }}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
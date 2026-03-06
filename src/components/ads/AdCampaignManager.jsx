import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ExternalLink, TrendingUp, MousePointer, Eye, ShoppingCart, Pencil, Trash2, BarChart3 } from "lucide-react";

const PLATFORMS = [
  { value: "facebook", label: "Facebook", color: "bg-blue-600", emoji: "📘" },
  { value: "instagram", label: "Instagram", color: "bg-pink-500", emoji: "📸" },
  { value: "tiktok", label: "TikTok", color: "bg-black", emoji: "🎵" },
  { value: "x_twitter", label: "X (Twitter)", color: "bg-slate-900", emoji: "🐦" },
  { value: "google", label: "Google", color: "bg-red-500", emoji: "🔍" },
  { value: "pinterest", label: "Pinterest", color: "bg-red-600", emoji: "📌" },
  { value: "reddit", label: "Reddit", color: "bg-orange-500", emoji: "🤖" },
  { value: "microsoft_bing", label: "Microsoft/Bing", color: "bg-blue-500", emoji: "🪟" },
  { value: "yahoo", label: "Yahoo", color: "bg-purple-600", emoji: "🟣" },
  { value: "discord", label: "Discord", color: "bg-indigo-500", emoji: "💬" },
  { value: "opera", label: "Opera", color: "bg-red-700", emoji: "🔴" },
  { value: "tumblr", label: "Tumblr", color: "bg-blue-800", emoji: "📝" },
  { value: "youtube", label: "YouTube", color: "bg-red-600", emoji: "▶️" },
  { value: "other", label: "Other", color: "bg-slate-500", emoji: "📣" },
];

const STATUSES = [
  { value: "draft", label: "Draft", cls: "bg-slate-100 text-slate-600" },
  { value: "active", label: "Active", cls: "bg-green-100 text-green-700" },
  { value: "paused", label: "Paused", cls: "bg-yellow-100 text-yellow-700" },
  { value: "completed", label: "Completed", cls: "bg-blue-100 text-blue-700" },
];

const OBJECTIVES = ["brand_awareness", "traffic", "conversions", "lead_generation", "engagement"];

const platformInfo = (val) => PLATFORMS.find(p => p.value === val) || PLATFORMS[PLATFORMS.length - 1];

const emptyForm = { name: "", platform: "facebook", status: "draft", objective: "traffic", budget: "", spent: "", start_date: "", end_date: "", target_audience: "", ad_url: "", impressions: "", clicks: "", conversions: "", notes: "" };

export default function AdCampaignManager() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["AdCampaign"],
    queryFn: () => base44.entities.AdCampaign.list("-created_date", 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.AdCampaign.update(editing.id, data)
      : base44.entities.AdCampaign.create(data),
    onSuccess: () => { qc.invalidateQueries(["AdCampaign"]); setOpen(false); setEditing(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdCampaign.delete(id),
    onSuccess: () => qc.invalidateQueries(["AdCampaign"]),
  });

  const handleOpen = (campaign = null) => {
    setEditing(campaign);
    setForm(campaign ? { ...emptyForm, ...campaign } : emptyForm);
    setOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, budget: +form.budget || 0, spent: +form.spent || 0, impressions: +form.impressions || 0, clicks: +form.clicks || 0, conversions: +form.conversions || 0 };
    saveMutation.mutate(data);
  };

  const filtered = campaigns.filter(c =>
    (filterPlatform === "all" || c.platform === filterPlatform) &&
    (filterStatus === "all" || c.status === filterStatus)
  );

  // Stats
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Budget", value: `₱${totalBudget.toLocaleString()}`, icon: BarChart3, color: "text-purple-600" },
          { label: "Total Spent", value: `₱${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-red-500" },
          { label: "Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-blue-500" },
          { label: "Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "text-green-500" },
          { label: "Conversions", value: totalConversions.toLocaleString(), icon: ShoppingCart, color: "text-amber-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="font-bold text-slate-800">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Platforms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.emoji} {p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpen()} className="bg-purple-600 hover:bg-purple-700 gap-2">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-slate-400"><p>No campaigns yet. Create your first one!</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => {
            const pl = platformInfo(c.platform);
            const st = STATUSES.find(s => s.value === c.status) || STATUSES[0];
            const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0.0";
            const pctSpent = c.budget > 0 ? Math.min(100, ((c.spent / c.budget) * 100)).toFixed(0) : 0;
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${pl.color} rounded-xl flex items-center justify-center text-xl`}>{pl.emoji}</div>
                      <div>
                        <h3 className="font-bold text-slate-800">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{pl.label}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 capitalize">{c.objective?.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={st.cls}>{st.label}</Badge>
                      {c.ad_url && (
                        <a href={c.ad_url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-slate-400">Budget</p><p className="font-semibold">₱{(c.budget||0).toLocaleString()}</p></div>
                    <div><p className="text-xs text-slate-400">Spent</p><p className="font-semibold text-red-500">₱{(c.spent||0).toLocaleString()}</p></div>
                    <div><p className="text-xs text-slate-400">Impressions</p><p className="font-semibold">{(c.impressions||0).toLocaleString()}</p></div>
                    <div><p className="text-xs text-slate-400">CTR</p><p className="font-semibold">{ctr}%</p></div>
                  </div>

                  {c.budget > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Budget used</span><span>{pctSpent}%</span></div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pctSpent}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Campaign" : "New Ad Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="md:col-span-2 space-y-1">
              <Label>Campaign Name *</Label>
              <Input placeholder="e.g. Summer Flights Promo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Platform *</Label>
              <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map(pl => <SelectItem key={pl.value} value={pl.value}>{pl.emoji} {pl.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Objective</Label>
              <Select value={form.objective} onValueChange={v => setForm(p => ({ ...p, objective: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OBJECTIVES.map(o => <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Budget (₱)</Label>
              <Input type="number" placeholder="0" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Amount Spent (₱)</Label>
              <Input type="number" placeholder="0" value={form.spent} onChange={e => setForm(p => ({ ...p, spent: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Impressions</Label>
              <Input type="number" placeholder="0" value={form.impressions} onChange={e => setForm(p => ({ ...p, impressions: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Clicks</Label>
              <Input type="number" placeholder="0" value={form.clicks} onChange={e => setForm(p => ({ ...p, clicks: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Conversions</Label>
              <Input type="number" placeholder="0" value={form.conversions} onChange={e => setForm(p => ({ ...p, conversions: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Ad URL (link to your ad)</Label>
              <Input placeholder="https://..." value={form.ad_url} onChange={e => setForm(p => ({ ...p, ad_url: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label>Target Audience</Label>
              <Input placeholder="e.g. Filipino travelers aged 25-45 interested in beach vacations" value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label>Notes</Label>
              <Input placeholder="Additional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || saveMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
              {saveMutation.isPending ? "Saving..." : "Save Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
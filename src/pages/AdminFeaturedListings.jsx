import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";

const PLACEMENTS = ["homepage_top", "category_top", "search_results"];
const ENTITY_TYPES = ["tour", "hotel", "flight", "package"];

const emptyForm = {
  entity_type: "tour",
  entity_id: "",
  supplier_id: "",
  placement: "homepage_top",
  start_date: new Date().toISOString(),
  end_date: moment().add(30, "days").toISOString(),
  price_paid: "",
  status: "active",
};

export default function AdminFeaturedListings() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["featured-listings-admin"],
    queryFn: () => base44.entities.FeaturedListing.list("-created_date"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing
        ? base44.entities.FeaturedListing.update(editing.id, data)
        : base44.entities.FeaturedListing.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["featured-listings-admin"]);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeaturedListing.delete(id),
    onSuccess: () => qc.invalidateQueries(["featured-listings-admin"]),
  });

  const handleEdit = (l) => {
    setEditing(l);
    setForm({
      ...l,
      start_date: l.start_date || new Date().toISOString(),
      end_date: l.end_date || moment().add(30, "days").toISOString(),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      entity_id: form.entity_id,
      price_paid: parseFloat(form.price_paid) || 0,
    });
  };

  if (!user || user.role !== "admin")
    return <div className="p-8 text-center text-red-500">Access denied.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" /> Featured Listings
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Suppliers pay to feature their tours/hotels at the top of search &amp; home.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Featured
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              {editing ? "Edit Featured Listing" : "New Featured Listing"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Entity Type</label>
                <Select value={form.entity_type} onValueChange={(v) => setForm((p) => ({ ...p, entity_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Placement</label>
                <Select value={form.placement} onValueChange={(v) => setForm((p) => ({ ...p, placement: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLACEMENTS.map((p) => (
                      <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Listing ID (tour/hotel id) *
                </label>
                <Input
                  value={form.entity_id}
                  onChange={(e) => setForm((p) => ({ ...p, entity_id: e.target.value }))}
                  placeholder="Paste the tour/hotel record id"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Supplier ID</label>
                <Input
                  value={form.supplier_id || ""}
                  onChange={(e) => setForm((p) => ({ ...p, supplier_id: e.target.value }))}
                  placeholder="Supplier who paid"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Price Paid (PHP)</label>
                <Input
                  type="number"
                  value={form.price_paid}
                  onChange={(e) => setForm((p) => ({ ...p, price_paid: e.target.value }))}
                  placeholder="e.g., 2500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="paused">paused</SelectItem>
                    <SelectItem value="expired">expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !form.entity_id}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {editing ? "Save Changes" : "Create Featured Listing"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Featured Listings ({listings.length})</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No featured listings yet. Add one to start earning from paid placement.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Listing ID</th>
                    <th className="px-4 py-3 text-left">Placement</th>
                    <th className="px-4 py-3 text-left">Window</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 capitalize">{l.entity_type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {l.entity_id?.slice(-8) || "—"}
                      </td>
                      <td className="px-4 py-3 capitalize text-xs">{l.placement?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {l.start_date ? moment(l.start_date).format("MMM D") : "—"} →{" "}
                        {l.end_date ? moment(l.end_date).format("MMM D, YY") : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        ₱{l.price_paid?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={l.status === "active" ? "default" : "outline"}
                          className={l.status === "active" ? "bg-green-100 text-green-700" : ""}
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(l)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => {
                              if (confirm("Delete this featured listing?")) deleteMutation.mutate(l.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
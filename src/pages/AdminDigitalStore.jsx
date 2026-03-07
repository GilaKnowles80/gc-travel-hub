import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Upload, Package, DollarSign, ShoppingBag, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["travel_guide", "visa_template", "budget_spreadsheet", "checklist", "ebook", "other"];
const STATUS_COLORS = { available: "bg-green-100 text-green-700", draft: "bg-yellow-100 text-yellow-700", unavailable: "bg-red-100 text-red-700" };

const emptyForm = { title: "", description: "", long_description: "", category: "travel_guide", price: "", price_usd: "", image_url: "", file_uri: "", file_name: "", status: "available", tags: "" };

export default function AdminDigitalStore() {
  const [user, setUser] = React.useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-digital-products'],
    queryFn: () => base44.entities.DigitalProduct.list('-created_date'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-digital-orders'],
    queryFn: () => base44.entities.DigitalOrder.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.DigitalProduct.update(editing.id, data)
      : base44.entities.DigitalProduct.create(data),
    onSuccess: () => { qc.invalidateQueries(['admin-digital-products']); setShowForm(false); setEditing(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DigitalProduct.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-digital-products']),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm(prev => ({ ...prev, file_uri: result.file_uri, file_name: file.name }));
    } catch (err) {
      alert('File upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({ ...product, tags: product.tags?.join(', ') || '' });
    setShowForm(true);
  };

  const handleSave = () => {
    const data = { ...form, price: parseFloat(form.price) || 0, price_usd: parseFloat(form.price_usd) || 0, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    saveMutation.mutate(data);
  };

  if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-500">Access denied.</div>;

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount || 0), 0);
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className="w-6 h-6 text-amber-500" /> Digital Store Admin</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your downloadable products</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length, icon: Package, color: "text-blue-500" },
            { label: "Active Products", value: products.filter(p => p.status === 'available').length, icon: Eye, color: "text-green-500" },
            { label: "Total Orders", value: paidOrders, icon: ShoppingBag, color: "text-purple-500" },
            { label: "Revenue (USD)", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-amber-500" },
          ].map((s, i) => {
            const IconComp = s.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <IconComp className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
            <h2 className="font-bold text-slate-800 text-lg mb-5">{editing ? 'Edit Product' : 'New Product'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Title *</label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Ultimate Boracay Travel Guide" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Category *</label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Price (PHP) *</label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g., 299" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Price (USD) *</label>
                <Input type="number" value={form.price_usd} onChange={e => setForm(p => ({ ...p, price_usd: e.target.value }))} placeholder="e.g., 5.99" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Short Description</label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="A brief summary..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Cover Image URL</label>
                <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tags (comma-separated)</label>
                <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Boracay, beach, Philippines" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Upload Downloadable File</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {form.file_name || "Choose file"}
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {form.file_uri && <span className="text-xs text-green-600">✓ Uploaded</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editing ? 'Save Changes' : 'Create Product'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Products ({products.length})</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No products yet. Add your first digital product!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Sales</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" alt="" /> : <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-amber-400" /></div>}
                          <div>
                            <p className="font-medium text-slate-800">{p.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="capitalize text-xs">{p.category?.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-amber-600">₱{p.price?.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">${p.price_usd}</p>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                      <td className="px-4 py-3"><span className="font-semibold">{p.sales_count || 0}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}><Edit2 className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Products</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.slice(0, 20).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{o.user_email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{o.product_titles?.join(', ')}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">${o.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.payment_status}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
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
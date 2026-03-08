import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminVisas() {
  const [editingVisa, setEditingVisa] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: visas = [], isLoading } = useQuery({
    queryKey: ["admin-visas"],
    queryFn: () => base44.entities.Visa.list(),
    enabled: user?.role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingVisa) {
        return base44.entities.Visa.update(editingVisa.id, data);
      }
      return base44.entities.Visa.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-visas"]);
      setShowDialog(false);
      setEditingVisa(null);
      toast.success(editingVisa ? "Visa updated" : "Visa added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Visa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-visas"]);
      toast.success("Visa deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const requirements = formData.get("requirements").split("\n").filter(r => r.trim());
    
    mutation.mutate({
      country: formData.get("country"),
      visa_type: formData.get("visa_type"),
      processing_time_days: parseInt(formData.get("processing_time_days")),
      validity_months: parseInt(formData.get("validity_months")),
      price: parseFloat(formData.get("price")),
      supplier_price: parseFloat(formData.get("supplier_price")),
      supplier: formData.get("supplier"),
      requirements,
      description: formData.get("description"),
      status: "active",
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Visa Services</h1>
            <p className="text-slate-500 mt-1">Add visa processing from suppliers</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVisa(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Visa Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVisa ? "Edit" : "Add"} Visa Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Input name="country" defaultValue={editingVisa?.country} placeholder="Japan" required />
                  </div>
                  <div>
                    <Label>Visa Type</Label>
                    <Select name="visa_type" defaultValue={editingVisa?.visa_type || "tourist"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">Tourist</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="transit">Transit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processing Time (days)</Label>
                    <Input name="processing_time_days" type="number" defaultValue={editingVisa?.processing_time_days || 7} required />
                  </div>
                  <div>
                    <Label>Validity (months)</Label>
                    <Input name="validity_months" type="number" defaultValue={editingVisa?.validity_months || 6} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Your Price (₱)</Label>
                    <Input name="price" type="number" step="0.01" defaultValue={editingVisa?.price} required />
                  </div>
                  <div>
                    <Label>Supplier Price (₱)</Label>
                    <Input name="supplier_price" type="number" step="0.01" defaultValue={editingVisa?.supplier_price} required />
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Select name="supplier" defaultValue={editingVisa?.supplier || "direct"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="biyaheko">Biyaheko</SelectItem>
                        <SelectItem value="wanderlinx">Wanderlinx</SelectItem>
                        <SelectItem value="tripzynx">Tripzynx</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Requirements (one per line)</Label>
                  <Textarea 
                    name="requirements" 
                    defaultValue={editingVisa?.requirements?.join("\n")} 
                    placeholder="Valid passport&#10;2x2 photo&#10;Bank statement"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editingVisa?.description} rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visas.map((visa) => {
              const profit = visa.price - (visa.supplier_price || 0);
              const profitMargin = visa.supplier_price ? ((profit / visa.supplier_price) * 100).toFixed(1) : 0;
              
              return (
                <Card key={visa.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {visa.country}
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{visa.visa_type} Visa</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingVisa(visa);
                            setShowDialog(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(visa.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-slate-500">Processing:</span> {visa.processing_time_days} days
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Validity:</span> {visa.validity_months} months
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Price:</span> ₱{visa.price.toFixed(2)}
                    </div>
                    {visa.supplier_price && (
                      <Badge className="bg-emerald-600 text-white">
                        Profit: ₱{profit.toFixed(2)} ({profitMargin}%)
                      </Badge>
                    )}
                    <Badge variant="outline">{visa.supplier}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
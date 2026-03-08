import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Percent, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AdminPromotions() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: "amadeus",
    promo_code: "",
    promo_title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    minimum_passengers: 1,
    applicable_to: ["flight"],
    valid_from: moment().format("YYYY-MM-DD"),
    valid_until: moment().add(30, 'days').format("YYYY-MM-DD"),
    status: "active",
    terms_conditions: ""
  });
  const queryClient = useQueryClient();

  const { data: promotions = [] } = useQuery({
    queryKey: ["supplier-promotions"],
    queryFn: () => base44.entities.SupplierPromotion.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierPromotion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-promotions"] });
      toast.success("Promotion created!");
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupplierPromotion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-promotions"] });
      toast.success("Promotion updated!");
      setShowDialog(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      supplier_name: "amadeus",
      promo_code: "",
      promo_title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      minimum_passengers: 1,
      applicable_to: ["flight"],
      valid_from: moment().format("YYYY-MM-DD"),
      valid_until: moment().add(30, 'days').format("YYYY-MM-DD"),
      status: "active",
      terms_conditions: ""
    });
    setEditingPromo(null);
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData(promo);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleApplicableTo = (type) => {
    const current = formData.applicable_to || [];
    if (current.includes(type)) {
      setFormData({ ...formData, applicable_to: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, applicable_to: [...current, type] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Percent className="w-8 h-8 text-amber-500" />
              Supplier Promotions
            </h1>
            <p className="text-slate-600">Manage Amadeus and supplier promotional codes</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Promotion
          </Button>
        </div>

        <div className="grid gap-4">
          {promotions.map(promo => (
            <Card key={promo.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{promo.promo_title}</h3>
                      <Badge>{promo.promo_code}</Badge>
                      <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                        {promo.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Supplier: {promo.supplier_name}</p>
                        <p className="text-slate-600">Discount: {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' PHP'}</p>
                        <p className="text-slate-600">Min Passengers: {promo.minimum_passengers}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Valid: {moment(promo.valid_from).format('MMM DD')} - {moment(promo.valid_until).format('MMM DD, YYYY')}</p>
                        <p className="text-slate-600">Applies to: {promo.applicable_to?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit' : 'Add'} Promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <Select value={formData.supplier_name} onValueChange={(value) => setFormData({...formData, supplier_name: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amadeus">Amadeus</SelectItem>
                      <SelectItem value="biyaheko">Biyaheko</SelectItem>
                      <SelectItem value="wanderlinx">Wanderlinx</SelectItem>
                      <SelectItem value="tripzynx">Tripzynx</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Promo Code</Label>
                  <Input value={formData.promo_code} onChange={(e) => setFormData({...formData, promo_code: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <Label>Promo Title</Label>
                  <Input value={formData.promo_title} onChange={(e) => setFormData({...formData, promo_title: e.target.value})} />
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <Select value={formData.discount_type} onValueChange={(value) => setFormData({...formData, discount_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value</Label>
                  <Input type="number" value={formData.discount_value} onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Min Passengers</Label>
                  <Input type="number" value={formData.minimum_passengers} onChange={(e) => setFormData({...formData, minimum_passengers: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Valid From</Label>
                  <Input type="date" value={formData.valid_from} onChange={(e) => setFormData({...formData, valid_from: e.target.value})} />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input type="date" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <Label>Applicable To</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={formData.applicable_to?.includes('flight')} onCheckedChange={() => toggleApplicableTo('flight')} />
                      Flight
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={formData.applicable_to?.includes('hotel')} onCheckedChange={() => toggleApplicableTo('hotel')} />
                      Hotel
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={formData.applicable_to?.includes('tour')} onCheckedChange={() => toggleApplicableTo('tour')} />
                      Tour
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPromo ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
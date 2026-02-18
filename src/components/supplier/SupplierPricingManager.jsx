import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SupplierPricingManager({ supplierId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    promo_title: '',
    promo_code: '',
    discount_type: 'percentage',
    discount_value: 0,
    valid_from: '',
    valid_until: ''
  });

  const queryClient = useQueryClient();

  const { data: promotions = [] } = useQuery({
    queryKey: ['supplier-promotions', supplierId],
    queryFn: () => base44.entities.SupplierPromotion.filter({ supplier_id: supplierId })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierPromotion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-promotions']);
      toast.success('Promotion created');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierPromotion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-promotions']);
      toast.success('Promotion deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      promo_title: '',
      promo_code: '',
      discount_type: 'percentage',
      discount_value: 0,
      valid_from: '',
      valid_until: ''
    });
  };

  const handleSubmit = () => {
    createMutation.mutate({
      ...formData,
      supplier_id: supplierId,
      discount_value: parseFloat(formData.discount_value),
      applicable_items: []
    });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pricing & Promotions</CardTitle>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Promotion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No promotions yet</p>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{promo.promo_title}</span>
                      <Badge className="bg-blue-100 text-blue-700">{promo.promo_code}</Badge>
                      <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                        {promo.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `$${promo.discount_value} off`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Valid: {promo.valid_from} → {promo.valid_until}
                    </p>
                    <p className="text-xs text-slate-500">
                      Used: {promo.usage_count} {promo.usage_limit ? `/ ${promo.usage_limit}` : ''}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteMutation.mutate(promo.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Promotion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Promotion Title</Label>
              <Input
                value={formData.promo_title}
                onChange={(e) => setFormData({...formData, promo_title: e.target.value})}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div>
              <Label>Promo Code</Label>
              <Input
                value={formData.promo_code}
                onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
                placeholder="e.g., SUMMER2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData({...formData, discount_type: v})}>
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
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '50'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Create Promotion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
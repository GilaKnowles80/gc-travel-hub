import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import moment from 'moment';

export default function AdminPackagePromoCodes() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: moment().format('YYYY-MM-DDTHH:mm'),
    valid_until: moment().add(30, 'days').format('YYYY-MM-DDTHH:mm'),
    usage_limit: null,
    min_package_value: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: promoCodes = [] } = useQuery({
    queryKey: ['package-promo-codes'],
    queryFn: () => base44.entities.PackagePromoCode.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PackagePromoCode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-promo-codes']);
      toast.success('Promo code created');
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PackagePromoCode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-promo-codes']);
      toast.success('Promo code updated');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PackagePromoCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-promo-codes']);
      toast.success('Promo code deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      valid_from: moment().format('YYYY-MM-DDTHH:mm'),
      valid_until: moment().add(30, 'days').format('YYYY-MM-DDTHH:mm'),
      usage_limit: null,
      min_package_value: 0,
      is_active: true
    });
    setEditingCode(null);
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      valid_from: moment(code.valid_from).format('YYYY-MM-DDTHH:mm'),
      valid_until: moment(code.valid_until).format('YYYY-MM-DDTHH:mm'),
      usage_limit: code.usage_limit,
      min_package_value: code.min_package_value,
      is_active: code.is_active
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Package Promo Codes</h1>
            <p className="text-slate-600 mt-1">Manage promotional codes for packages</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            New Promo Code
          </Button>
        </div>

        <div className="grid gap-4">
          {promoCodes.map(code => (
            <Card key={code.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="w-5 h-5 text-amber-600" />
                      <h3 className="text-2xl font-bold">{code.code}</h3>
                      <Badge className={code.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500">Discount</p>
                        <p className="font-semibold">
                          {code.discount_type === 'percentage' ? `${code.discount_value}%` : `$${code.discount_value}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Valid Until</p>
                        <p className="font-semibold">{moment(code.valid_until).format('MMM DD, YYYY')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Usage</p>
                        <p className="font-semibold">
                          {code.usage_count} {code.usage_limit ? `/ ${code.usage_limit}` : '/ ∞'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Min. Value</p>
                        <p className="font-semibold">${code.min_package_value || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(code)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(code.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit' : 'Create'} Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., SUMMER2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
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
                  <label className="text-sm font-medium">Discount Value</label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valid From</label>
                  <Input
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valid Until</label>
                  <Input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usage Limit (blank = unlimited)</label>
                  <Input
                    type="number"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Package Value</label>
                  <Input
                    type="number"
                    value={formData.min_package_value}
                    onChange={(e) => setFormData({...formData, min_package_value: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700">
                {editingCode ? 'Update' : 'Create'} Promo Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
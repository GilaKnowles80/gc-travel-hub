import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInsurance() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    insurance_name: '',
    provider: '',
    coverage_type: 'basic',
    coverage_amount: 50000,
    price_per_day: 150,
    description: '',
    coverage_details: [],
    exclusions: [],
    max_age: 75,
    destinations_covered: [],
    status: 'active'
  });

  const { data: insurance = [], isLoading } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => base44.entities.TravelInsurance.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TravelInsurance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance']);
      toast.success('Insurance plan added!');
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TravelInsurance.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance']);
      toast.success('Insurance plan updated!');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TravelInsurance.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance']);
      toast.success('Insurance plan deleted!');
    }
  });

  const resetForm = () => {
    setFormData({
      insurance_name: '',
      provider: '',
      coverage_type: 'basic',
      coverage_amount: 50000,
      price_per_day: 150,
      description: '',
      coverage_details: [],
      exclusions: [],
      max_age: 75,
      destinations_covered: [],
      status: 'active'
    });
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowDialog(true);
  };

  const filteredInsurance = insurance.filter(item =>
    item.insurance_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.provider?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Travel Insurance</h1>
            <p className="text-slate-600">Manage insurance plans and coverage options</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Insurance Plan
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search insurance plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsurance.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <div className="font-semibold">{item.insurance_name}</div>
                      <div className="text-sm text-slate-600 font-normal">{item.provider}</div>
                    </div>
                  </div>
                  <Badge className={item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                    {item.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Coverage:</span>
                    <span className="font-semibold">${item.coverage_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Price/Day:</span>
                    <span className="font-semibold">${item.price_per_day}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Type:</span>
                    <Badge variant="outline" className="capitalize">{item.coverage_type}</Badge>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)} className="text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Insurance Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.insurance_name}
                    onChange={(e) => setFormData({ ...formData, insurance_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Provider *</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Coverage Type</Label>
                  <Select value={formData.coverage_type} onValueChange={(val) => setFormData({ ...formData, coverage_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coverage Amount (USD)</Label>
                  <Input
                    type="number"
                    value={formData.coverage_amount}
                    onChange={(e) => setFormData({ ...formData, coverage_amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Price per Day (USD)</Label>
                  <Input
                    type="number"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingItem ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
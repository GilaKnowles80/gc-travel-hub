import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SupplierInventoryManager({ supplierId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_type: 'hotel',
    item_name: '',
    availability: 0,
    total_capacity: 0,
    date_range_start: '',
    date_range_end: ''
  });

  const queryClient = useQueryClient();

  const { data: inventory = [] } = useQuery({
    queryKey: ['supplier-inventory', supplierId],
    queryFn: () => base44.entities.SupplierInventory.filter({ supplier_id: supplierId })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierInventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-inventory']);
      toast.success('Inventory added');
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupplierInventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-inventory']);
      toast.success('Inventory updated');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierInventory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-inventory']);
      toast.success('Inventory deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      item_type: 'hotel',
      item_name: '',
      availability: 0,
      total_capacity: 0,
      date_range_start: '',
      date_range_end: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      supplier_id: supplierId,
      item_id: 'temp_' + Date.now(),
      availability: parseInt(formData.availability),
      total_capacity: parseInt(formData.total_capacity),
      status: formData.availability > 10 ? 'available' : formData.availability > 0 ? 'limited' : 'sold_out'
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_type: item.item_type,
      item_name: item.item_name,
      availability: item.availability,
      total_capacity: item.total_capacity,
      date_range_start: item.date_range_start || '',
      date_range_end: item.date_range_end || ''
    });
    setShowDialog(true);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Inventory</CardTitle>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No inventory items yet</p>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{item.item_name}</span>
                      <Badge className="capitalize">{item.item_type}</Badge>
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Available: {item.availability} / {item.total_capacity}
                    </p>
                    {item.date_range_start && (
                      <p className="text-xs text-slate-500">
                        {item.date_range_start} → {item.date_range_end}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.item_type} onValueChange={(v) => setFormData({...formData, item_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="ferry">Ferry</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="car">Car Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={formData.item_name}
                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                placeholder="e.g., Deluxe Room, Manila-Cebu Flight"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Available</Label>
                <Input
                  type="number"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                />
              </div>
              <div>
                <Label>Total Capacity</Label>
                <Input
                  type="number"
                  value={formData.total_capacity}
                  onChange={(e) => setFormData({...formData, total_capacity: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.date_range_start}
                  onChange={(e) => setFormData({...formData, date_range_start: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.date_range_end}
                  onChange={(e) => setFormData({...formData, date_range_end: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingItem ? 'Update' : 'Add'} Inventory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCarRentals() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    car_type: '',
    location: '',
    price_per_day: 0,
    available_units: 10,
    description: '',
    features: '',
    status: 'active'
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['car-rentals'],
    queryFn: async () => {
      return [];
    }
  });

  const resetForm = () => {
    setFormData({
      car_type: '',
      location: '',
      price_per_day: 0,
      available_units: 10,
      description: '',
      features: '',
      status: 'active'
    });
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Car Rentals</h1>
            <p className="text-slate-600">Manage car rental inventory and availability</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Car
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-12">
          <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Car rental management coming soon. Use Data Manager to import car rental data.</p>
        </div>
      </div>
    </div>
  );
}
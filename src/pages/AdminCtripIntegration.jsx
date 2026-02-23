import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, DollarSign, Loader2, Package, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminCtripIntegration() {
  const [apiMode, setApiMode] = useState('vendor'); // 'vendor' or 'supply'
  
  const [inventoryForm, setInventoryForm] = useState({
    hotel_id: '',
    room_type: '',
    start_date: '',
    end_date: '',
    availability: ''
  });

  const [rateForm, setRateForm] = useState({
    hotel_id: '',
    room_type: '',
    start_date: '',
    end_date: '',
    rate_plan: 'BAR',
    base_rate: ''
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => base44.entities.Hotel.list('-created_date', 50)
  });

  const syncInventoryMutation = useMutation({
    mutationFn: async (data) => {
      const functionName = apiMode === 'supply' ? 'ctripSupplyUpdateInventory' : 'syncCtripInventory';
      const payload = apiMode === 'supply' ? {
        hotel_id: data.hotel_id,
        room_type_code: data.room_type,
        date_from: data.start_date,
        date_to: data.end_date,
        inventory: parseInt(data.availability)
      } : {
        hotel_id: data.hotel_id,
        room_type: data.room_type,
        date_range: {
          start_date: data.start_date,
          end_date: data.end_date
        },
        availability: parseInt(data.availability)
      };
      const response = await base44.functions.invoke(functionName, payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Inventory synced to Ctrip successfully');
        setInventoryForm({ hotel_id: '', room_type: '', start_date: '', end_date: '', availability: '' });
      } else {
        toast.error(data.message || 'Sync failed');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sync inventory');
    }
  });

  const syncRatesMutation = useMutation({
    mutationFn: async (data) => {
      const functionName = apiMode === 'supply' ? 'ctripSupplyUpdateRates' : 'syncCtripRates';
      const payload = apiMode === 'supply' ? {
        hotel_id: data.hotel_id,
        room_type_code: data.room_type,
        rate_plan_code: data.rate_plan,
        date_from: data.start_date,
        date_to: data.end_date,
        rate: parseFloat(data.base_rate)
      } : {
        hotel_id: data.hotel_id,
        room_type: data.room_type,
        date_range: {
          start_date: data.start_date,
          end_date: data.end_date
        },
        rate_plan: data.rate_plan,
        base_rate: parseFloat(data.base_rate)
      };
      const response = await base44.functions.invoke(functionName, payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Rates synced to Ctrip successfully');
        setRateForm({ hotel_id: '', room_type: '', start_date: '', end_date: '', rate_plan: 'BAR', base_rate: '' });
      } else {
        toast.error(data.message || 'Sync failed');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sync rates');
    }
  });

  const handleInventorySync = (e) => {
    e.preventDefault();
    syncInventoryMutation.mutate(inventoryForm);
  };

  const handleRateSync = (e) => {
    e.preventDefault();
    syncRatesMutation.mutate(rateForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ctrip Integration</h1>
              <p className="text-slate-600">Dual integration: Vendor OTA + Supply Channel Manager</p>
            </div>
          </div>
          <Tabs value={apiMode} onValueChange={setApiMode}>
            <TabsList>
              <TabsTrigger value="vendor">Vendor API</TabsTrigger>
              <TabsTrigger value="supply">Supply API (cm/v4)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              {apiMode === 'vendor' ? 'Vendor API - OTA Webhook' : 'Supply API - Channel Manager v4'}
            </CardTitle>
            <CardDescription>
              {apiMode === 'vendor' 
                ? 'Receive booking notifications via OTA XML protocol' 
                : 'Modern JSON API for inventory and rate management'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiMode === 'vendor' ? (
              <>
                <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm break-all">
                  {window.location.origin}/api/functions/ctripWebhook
                </div>
                <p className="text-sm text-slate-600">
                  Configure this webhook URL in your Ctrip vendor dashboard to receive booking notifications.
                </p>
              </>
            ) : (
              <>
                <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm break-all">
                  https://supply.ctrip.com/cm/v4
                </div>
                <p className="text-sm text-slate-600">
                  Using Ctrip Supply Channel Manager v4 API for real-time inventory and rate updates.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Inventory Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Sync Inventory
            </CardTitle>
            <CardDescription>Update room availability on Ctrip</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInventorySync} className="space-y-4">
              <div>
                <Label>Hotel</Label>
                <Select value={inventoryForm.hotel_id} onValueChange={(v) => setInventoryForm({...inventoryForm, hotel_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Type</Label>
                  <Input 
                    value={inventoryForm.room_type}
                    onChange={(e) => setInventoryForm({...inventoryForm, room_type: e.target.value})}
                    placeholder="e.g., DBL, KING"
                    required
                  />
                </div>
                <div>
                  <Label>Availability</Label>
                  <Input 
                    type="number"
                    value={inventoryForm.availability}
                    onChange={(e) => setInventoryForm({...inventoryForm, availability: e.target.value})}
                    placeholder="Number of rooms"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={inventoryForm.start_date}
                    onChange={(e) => setInventoryForm({...inventoryForm, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={inventoryForm.end_date}
                    onChange={(e) => setInventoryForm({...inventoryForm, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={syncInventoryMutation.isPending}
              >
                {syncInventoryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Inventory'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rate Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Sync Rates
            </CardTitle>
            <CardDescription>Update pricing on Ctrip</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRateSync} className="space-y-4">
              <div>
                <Label>Hotel</Label>
                <Select value={rateForm.hotel_id} onValueChange={(v) => setRateForm({...rateForm, hotel_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Type</Label>
                  <Input 
                    value={rateForm.room_type}
                    onChange={(e) => setRateForm({...rateForm, room_type: e.target.value})}
                    placeholder="e.g., DBL, KING"
                    required
                  />
                </div>
                <div>
                  <Label>Rate Plan</Label>
                  <Input 
                    value={rateForm.rate_plan}
                    onChange={(e) => setRateForm({...rateForm, rate_plan: e.target.value})}
                    placeholder="e.g., BAR"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Base Rate (USD)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={rateForm.base_rate}
                  onChange={(e) => setRateForm({...rateForm, base_rate: e.target.value})}
                  placeholder="Price per night"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={rateForm.start_date}
                    onChange={(e) => setRateForm({...rateForm, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={rateForm.end_date}
                    onChange={(e) => setRateForm({...rateForm, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={syncRatesMutation.isPending}
              >
                {syncRatesMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Rates'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
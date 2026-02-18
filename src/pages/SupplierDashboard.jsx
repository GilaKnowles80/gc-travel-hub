import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  Building2, Package, DollarSign, Calendar, TrendingUp, 
  LogOut, Settings, FileText, Tag, MessageSquare
} from 'lucide-react';
import SupplierInventoryManager from '@/components/supplier/SupplierInventoryManager';
import SupplierPricingManager from '@/components/supplier/SupplierPricingManager';
import SupplierBookingsView from '@/components/supplier/SupplierBookingsView';
import SupplierRevenueReports from '@/components/supplier/SupplierRevenueReports';
import AdvancedAnalyticsDashboard from '@/components/supplier/AdvancedAnalyticsDashboard';
import SupplierMessagesHub from '@/components/supplier/SupplierMessagesHub';

export default function SupplierDashboard() {
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('supplier_session');
    if (!session) {
      window.location.href = '/supplier-login';
      return;
    }
    setSupplier(JSON.parse(session));
  }, []);

  const { data: onboarding } = useQuery({
    queryKey: ['supplier-onboarding', supplier?.id],
    queryFn: async () => {
      const records = await base44.entities.SupplierOnboarding.filter({ supplier_id: supplier.id });
      return records[0];
    },
    enabled: !!supplier?.id
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (supplier && (!onboarding || !onboarding.onboarding_completed)) {
      window.location.href = createPageUrl('SupplierOnboarding');
    }
  }, [supplier, onboarding]);

  const { data: supplierData } = useQuery({
    queryKey: ['supplier', supplier?.id],
    queryFn: () => base44.asServiceRole.entities.Supplier.get(supplier.id),
    enabled: !!supplier?.id
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['supplier-inventory', supplier?.id],
    queryFn: () => base44.entities.SupplierInventory.filter({ supplier_id: supplier.id }),
    enabled: !!supplier?.id
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['supplier-bookings', supplier?.id],
    queryFn: async () => {
      const flights = await base44.entities.FlightBooking.filter({ supplier: supplier.company_name });
      const hotels = await base44.entities.HotelBooking.filter({ supplier: supplier.company_name });
      const tours = await base44.entities.Booking.filter({ supplier: supplier.company_name });
      return [...flights, ...hotels, ...tours];
    },
    enabled: !!supplier?.id
  });

  const handleLogout = () => {
    localStorage.removeItem('supplier_session');
    window.location.href = '/supplier-login';
  };

  if (!supplier) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg">{supplier.company_name}</h1>
              <p className="text-xs text-slate-600 capitalize">{supplier.supplier_type} Supplier</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${supplierData?.total_revenue || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Inventory Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rating</p>
                  <p className="text-2xl font-bold">{supplierData?.rating || 'N/A'}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <Tag className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <SupplierInventoryManager supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <SupplierPricingManager supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <SupplierBookingsView supplierId={supplier.id} bookings={bookings} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AdvancedAnalyticsDashboard supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <SupplierRevenueReports supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <SupplierMessagesHub supplierId={supplier.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
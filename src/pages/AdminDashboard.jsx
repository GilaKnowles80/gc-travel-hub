import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Settings, Users, Receipt, TrendingUp } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import QuickActions from '@/components/admin/QuickActions';
import SalesReports from '@/components/admin/SalesReports';
import UnifiedBookingsTable from '@/components/admin/UnifiedBookingsTable';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage all travel offerings, bookings, and view reports</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('AdminDataManager')}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Data Manager
              </Button>
            </Link>
            <Link to={createPageUrl('AdminSecurityCenter')}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Security
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Receipt className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats />
            <QuickActions />
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedBookingsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <SalesReports />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={createPageUrl('AdminFlights')}>
                    <Button variant="outline" className="w-full justify-start">Manage Flights</Button>
                  </Link>
                  <Link to={createPageUrl('AdminHotels')}>
                    <Button variant="outline" className="w-full justify-start">Manage Hotels</Button>
                  </Link>
                  <Link to={createPageUrl('AdminTours')}>
                    <Button variant="outline" className="w-full justify-start">Manage Tours</Button>
                  </Link>
                  <Link to={createPageUrl('AdminVisas')}>
                    <Button variant="outline" className="w-full justify-start">Manage Visas</Button>
                  </Link>
                  <Link to={createPageUrl('AdminFerries')}>
                    <Button variant="outline" className="w-full justify-start">Manage Ferry Tickets</Button>
                  </Link>
                  <Link to={createPageUrl('AdminBuses')}>
                    <Button variant="outline" className="w-full justify-start">Manage Bus Tickets</Button>
                  </Link>
                  <Link to={createPageUrl('AdminInsurance')}>
                    <Button variant="outline" className="w-full justify-start">Manage Insurance</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={createPageUrl('AdminCorporateClients')}>
                    <Button variant="outline" className="w-full justify-start">Corporate Clients</Button>
                  </Link>
                  <Link to={createPageUrl('AdminPromotions')}>
                    <Button variant="outline" className="w-full justify-start">Promotions & Discounts</Button>
                  </Link>
                  <Link to={createPageUrl('AdminPricing')}>
                    <Button variant="outline" className="w-full justify-start">Dynamic Pricing</Button>
                  </Link>
                  <Link to={createPageUrl('AdminSupplierPayments')}>
                    <Button variant="outline" className="w-full justify-start">Supplier Payments</Button>
                  </Link>
                  <Link to={createPageUrl('AdminHelpdesk')}>
                    <Button variant="outline" className="w-full justify-start">Customer Support</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
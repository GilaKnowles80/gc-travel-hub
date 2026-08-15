import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Settings, Users, Receipt, TrendingUp, DollarSign, Plug } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import QuickActions from '@/components/admin/QuickActions';
import SalesReports from '@/components/admin/SalesReports';
import UnifiedBookingsTable from '@/components/admin/UnifiedBookingsTable';
import BulkOperationsPanel from '@/components/admin/BulkOperationsPanel';
import PerformanceMonitor from '@/components/admin/PerformanceMonitor';
import RevenueAnalytics from '@/components/admin/RevenueAnalytics';
import SalesAnalyticsBoard from '@/components/admin/SalesAnalyticsBoard';
import DuffelTopupGuide from '@/components/admin/DuffelTopupGuide';
import LiveInteractionEmails from '@/components/admin/LiveInteractionEmails';
import DetailedPerformanceAnalytics from '@/components/admin/DetailedPerformanceAnalytics';
import TourAnalyticsByRegion from '@/components/admin/TourAnalyticsByRegion';
import GoogleDriveSync from '@/components/admin/GoogleDriveSync';
import GoogleSheetsSync from '@/components/admin/GoogleSheetsSync';
import PitchDeckBuilder from '@/components/admin/PitchDeckBuilder';
import TravelItineraryDocBuilder from '@/components/admin/TravelItineraryDocBuilder';
import SupportTicketsPanel from '@/components/admin/SupportTicketsPanel';
import TikTokAnalyticsDashboard from '@/components/admin/TikTokAnalyticsDashboard';
import WalletManagementPanel from '@/components/admin/WalletManagementPanel';
import RevenueSplitFlowDiagram from '@/components/flows/RevenueSplitFlowDiagram';
import FinancialControlDashboard from '@/components/admin/FinancialControlDashboard';
import SystemArchitectureDashboard from '@/components/admin/SystemArchitectureDashboard';
import EnterpriseOTADashboard from '@/components/admin/EnterpriseOTADashboard';
import OTAOperationsCenter from '@/components/admin/OTAOperationsCenter';
import MasterWorkflowDiagram from '@/components/admin/MasterWorkflowDiagram';
import FinancialSpreadsheet from '@/components/admin/FinancialSpreadsheet';
import AdminCallReceiver from '@/components/support/AdminCallReceiver';
import UnifiedSupportCenter from '@/components/support/UnifiedSupportCenter';
import AdminSnapshotTrend from '@/components/admin/AdminSnapshotTrend';
import FinancialSummary from '@/components/admin/FinancialSummary';

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
            <Link to={createPageUrl('AdminIntegrations')}>
              <Button variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                <Plug className="w-4 h-4 mr-2" />
                Integrations
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-12 w-full max-w-6xl">
            <TabsTrigger value="overview">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales">
              <TrendingUp className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tours">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Receipt className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="support">
              <Users className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Receipt className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="tiktok">
              <TrendingUp className="w-4 h-4 mr-2" />
              TikTok
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue Split
            </TabsTrigger>
            <TabsTrigger value="financials">
              <DollarSign className="w-4 h-4 mr-2" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialSummary />
            <DashboardStats />
            <LiveInteractionEmails />
            <RevenueAnalytics />
            <div className="grid lg:grid-cols-2 gap-6">
              <BulkOperationsPanel />
              <PerformanceMonitor />
            </div>
            <QuickActions />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesAnalyticsBoard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DetailedPerformanceAnalytics />
          </TabsContent>

          <TabsContent value="tours" className="space-y-6">
            <TourAnalyticsByRegion />
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

          <TabsContent value="support" className="space-y-6">
            <UnifiedSupportCenter />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletManagementPanel />
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-6">
            <TikTokAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <MasterWorkflowDiagram />
            <FinancialControlDashboard />
            <EnterpriseOTADashboard />
            <OTAOperationsCenter />
            <SystemArchitectureDashboard />
            <RevenueSplitFlowDiagram />
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <FinancialSpreadsheet />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <GoogleDriveSync />
            <GoogleSheetsSync />
            <PitchDeckBuilder />
            <TravelItineraryDocBuilder />
            <DuffelTopupGuide />
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
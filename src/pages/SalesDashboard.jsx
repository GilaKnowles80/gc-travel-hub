import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, DollarSign, Target, Phone, Mail, 
  Calendar, Plus, Filter, Download
} from "lucide-react";
import LeadsTable from "@/components/sales/LeadsTable";
import LeadForm from "@/components/sales/LeadForm";
import SalesActivityTimeline from "@/components/sales/SalesActivityTimeline";
import SalesPerformanceChart from "@/components/sales/SalesPerformanceChart";
import CommissionsTable from "@/components/sales/CommissionsTable";

export default function SalesDashboard() {
  const [user, setUser] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isSalesStaff = user?.role === "sales" || user?.role === "sales_manager" || user?.role === "admin";

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", user?.email],
    queryFn: async () => {
      if (user?.role === "sales") {
        return await base44.entities.Lead.filter({ assigned_to: user.email }, "-created_date");
      }
      return await base44.entities.Lead.list("-created_date");
    },
    enabled: !!user && isSalesStaff,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["sales-activities", user?.email],
    queryFn: async () => {
      if (user?.role === "sales") {
        return await base44.entities.SalesActivity.filter({ sales_person: user.email }, "-created_date", 50);
      }
      return await base44.entities.SalesActivity.list("-created_date", 50);
    },
    enabled: !!user && isSalesStaff,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["commissions", user?.email],
    queryFn: async () => {
      if (user?.role === "sales") {
        return await base44.entities.SalesCommission.filter({ sales_person: user.email }, "-created_date");
      }
      return await base44.entities.SalesCommission.list("-created_date");
    },
    enabled: !!user && isSalesStaff,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSalesStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-600">This page is only accessible to sales team members.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "new").length,
    activeLeads: leads.filter(l => ["contacted", "qualified", "proposal_sent", "negotiating"].includes(l.status)).length,
    wonLeads: leads.filter(l => l.status === "won").length,
    totalCommissions: commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    pendingCommissions: commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === "won").length / leads.length) * 100).toFixed(1) : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {user.full_name}
            </p>
          </div>
          <Button onClick={() => setShowLeadForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-slate-600 mt-1">{stats.newLeads} new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Leads</CardTitle>
              <Target className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLeads}</div>
              <p className="text-xs text-slate-600 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-slate-600 mt-1">{stats.wonLeads} won</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Commissions</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-slate-600 mt-1">₱{stats.pendingCommissions.toFixed(2)} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadsTable 
              leads={leads} 
              onSelectLead={setSelectedLead}
              userRole={user.role}
            />
          </TabsContent>

          <TabsContent value="activities">
            <SalesActivityTimeline activities={activities} />
          </TabsContent>

          <TabsContent value="performance">
            <SalesPerformanceChart leads={leads} commissions={commissions} />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionsTable commissions={commissions} />
          </TabsContent>
        </Tabs>

        {/* Lead Form Dialog */}
        {showLeadForm && (
          <LeadForm
            open={showLeadForm}
            onClose={() => setShowLeadForm(false)}
            lead={selectedLead}
            salesPerson={user}
          />
        )}
      </div>
    </div>
  );
}
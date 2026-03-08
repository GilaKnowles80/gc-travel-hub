import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, DollarSign, TrendingUp, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminSalesTeam() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("sales");
  const queryClient = useQueryClient();

  const { data: salesUsers = [] } = useQuery({
    queryKey: ["sales-users"],
    queryFn: async () => {
      const all = await base44.entities.User.list();
      return all.filter(u => u.role === "sales" || u.role === "sales_manager");
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["all-leads"],
    queryFn: () => base44.entities.Lead.list(),
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["all-commissions"],
    queryFn: () => base44.entities.SalesCommission.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      await base44.users.inviteUser(inviteEmail, inviteRole);
    },
    onSuccess: () => {
      toast.success("Sales team member invited");
      setInviteEmail("");
      queryClient.invalidateQueries(["sales-users"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to invite");
    },
  });

  const salesStats = salesUsers.map(user => {
    const userLeads = leads.filter(l => l.assigned_to === user.email);
    const userCommissions = commissions.filter(c => c.sales_person === user.email);
    const totalCommission = userCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const wonLeads = userLeads.filter(l => l.status === "won").length;

    return {
      ...user,
      totalLeads: userLeads.length,
      wonLeads,
      conversionRate: userLeads.length > 0 ? ((wonLeads / userLeads.length) * 100).toFixed(1) : 0,
      totalCommission,
      pendingCommission: userCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commission_amount, 0),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Sales Team Management</h1>
          <p className="text-slate-600 mt-1">Manage your sales team and track performance</p>
        </div>

        {/* Invite Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite Sales Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="sales">Sales</option>
                <option value="sales_manager">Sales Manager</option>
              </select>
              <Button 
                onClick={() => inviteMutation.mutate()}
                disabled={!inviteEmail || inviteMutation.isPending}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {inviteMutation.isPending ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Team Members</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Won Deals</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.filter(l => l.status === "won").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Commissions</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Team Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Role</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">Leads</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">Won</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">Conv. Rate</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">Total Comm.</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {salesStats.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{user.full_name}</td>
                      <td className="p-3 text-sm text-slate-600">{user.email}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {user.role === "sales_manager" ? "Manager" : "Sales"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-slate-700">{user.totalLeads}</td>
                      <td className="p-3 text-right text-green-600 font-medium">{user.wonLeads}</td>
                      <td className="p-3 text-right text-slate-700">{user.conversionRate}%</td>
                      <td className="p-3 text-right font-bold text-amber-600">
                        ₱{user.totalCommission.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        ₱{user.pendingCommission.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesUsers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No sales team members yet. Invite your first member above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
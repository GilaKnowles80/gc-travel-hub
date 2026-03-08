import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AdminAffiliates() {
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: affiliates = [] } = useQuery({
    queryKey: ["affiliates"],
    queryFn: () => base44.entities.Affiliate.list("-created_date"),
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["all-commissions"],
    queryFn: () => base44.entities.AffiliateCommission.list("-created_date"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.Affiliate.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["affiliates"]);
      toast.success("Status updated");
    },
  });

  const approveCommissionMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.AffiliateCommission.update(id, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-commissions"]);
      toast.success("Commission approved");
    },
  });

  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const totalPendingAmount = pendingCommissions.reduce(
    (sum, c) => sum + (c.commission_amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Affiliate Management</h1>
          <p className="text-slate-600">Manage affiliates and commission payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Total Affiliates</p>
              <p className="text-3xl font-bold">{affiliates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Active Affiliates</p>
              <p className="text-3xl font-bold text-green-600">
                {affiliates.filter((a) => a.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Pending Commissions</p>
              <p className="text-3xl font-bold text-amber-600">
                ₱{totalPendingAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                ₱
                {affiliates
                  .reduce((sum, a) => sum + (a.total_revenue || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliates">
          <TabsList>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates">
            <Card>
              <CardHeader>
                <CardTitle>All Affiliates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Code</th>
                        <th className="text-center p-3">Referrals</th>
                        <th className="text-center p-3">Bookings</th>
                        <th className="text-right p-3">Revenue</th>
                        <th className="text-right p-3">Balance</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((aff) => (
                        <tr key={aff.id} className="border-b">
                          <td className="p-3 text-sm">{aff.user_email}</td>
                          <td className="p-3 text-sm font-mono">{aff.affiliate_code}</td>
                          <td className="p-3 text-sm text-center">
                            {aff.total_referrals || 0}
                          </td>
                          <td className="p-3 text-sm text-center">
                            {aff.total_bookings || 0}
                          </td>
                          <td className="p-3 text-sm text-right">
                            ₱{aff.total_revenue?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 text-sm text-right font-semibold">
                            ₱{aff.commission_balance?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={
                                aff.status === "active"
                                  ? "default"
                                  : aff.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {aff.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-1 justify-center">
                              {aff.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: aff.id,
                                      status: "active",
                                    })
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {aff.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: aff.id,
                                      status: "suspended",
                                    })
                                  }
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {aff.commission_balance > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAffiliate(aff);
                                    setShowPayoutDialog(true);
                                  }}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Affiliate</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-right p-3">Rate</th>
                        <th className="text-right p-3">Commission</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((comm) => (
                        <tr key={comm.id} className="border-b">
                          <td className="p-3 text-sm">
                            {moment(comm.created_date).format("MMM D, YYYY")}
                          </td>
                          <td className="p-3 text-sm font-mono">
                            {comm.affiliate_code}
                          </td>
                          <td className="p-3 text-sm">{comm.customer_email}</td>
                          <td className="p-3 text-sm capitalize">{comm.booking_type}</td>
                          <td className="p-3 text-sm text-right">
                            ₱{comm.booking_amount?.toLocaleString()}
                          </td>
                          <td className="p-3 text-sm text-right">{comm.commission_rate}%</td>
                          <td className="p-3 text-sm text-right font-semibold">
                            ₱{comm.commission_amount?.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={
                                comm.status === "paid"
                                  ? "default"
                                  : comm.status === "approved"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {comm.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {comm.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => approveCommissionMutation.mutate(comm.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
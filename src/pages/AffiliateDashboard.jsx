import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, TrendingUp, Users, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AffiliateDashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: affiliate } = useQuery({
    queryKey: ["affiliate", user?.email],
    queryFn: async () => {
      const affiliates = await base44.entities.Affiliate.filter({
        user_email: user.email
      });
      return affiliates[0];
    },
    enabled: !!user,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["affiliate-commissions", affiliate?.id],
    queryFn: () =>
      base44.entities.AffiliateCommission.filter(
        { affiliate_id: affiliate.id },
        "-created_date"
      ),
    enabled: !!affiliate,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["affiliate-referrals", affiliate?.id],
    queryFn: () =>
      base44.entities.AffiliateReferral.filter(
        { affiliate_id: affiliate.id },
        "-created_date"
      ),
    enabled: !!affiliate,
  });

  const affiliateLink = affiliate
    ? `${window.location.origin}?ref=${affiliate.affiliate_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Affiliate link copied!");
  };

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Join Our Affiliate Program</h2>
              <p className="text-slate-600 mb-6">
                Earn commission on every booking from your referrals!
              </p>
              <Button onClick={() => window.location.href = "/affiliate-signup"}>
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Commission Balance",
      value: `₱${affiliate.commission_balance?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Total Earned",
      value: `₱${affiliate.total_commission_earned?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Total Referrals",
      value: affiliate.total_referrals || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Total Bookings",
      value: affiliate.total_bookings || 0,
      icon: CheckCircle,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
          <p className="text-slate-600">Track your referrals and earnings</p>
        </div>

        {/* Affiliate Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Affiliate Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-slate-50"
              />
              <Button onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold mb-2">Commission Rates:</p>
              <ul className="text-sm space-y-1">
                <li>• Bookings under ₱10,000: <strong>5%</strong></li>
                <li>• Bookings ₱10,000 - ₱50,000: <strong>8%</strong></li>
                <li>• Bookings over ₱50,000: <strong>10%</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Commissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No commissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Booking</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-right p-3">Rate</th>
                      <th className="text-right p-3">Commission</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.slice(0, 10).map((comm) => (
                      <tr key={comm.id} className="border-b">
                        <td className="p-3 text-sm">
                          {moment(comm.created_date).format("MMM D, YYYY")}
                        </td>
                        <td className="p-3 text-sm">{comm.customer_email}</td>
                        <td className="p-3 text-sm capitalize">{comm.booking_type}</td>
                        <td className="p-3 text-sm text-right">
                          ₱{comm.booking_amount?.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm text-right">{comm.commission_rate}%</td>
                        <td className="p-3 text-sm text-right font-semibold text-green-600">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No referrals yet</p>
            ) : (
              <div className="space-y-3">
                {referrals.slice(0, 10).map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{ref.referred_email}</p>
                      <p className="text-sm text-slate-600">
                        {moment(ref.created_date).fromNow()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {ref.total_bookings || 0} bookings
                      </p>
                      <p className="text-sm text-slate-600">
                        ₱{ref.total_revenue?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
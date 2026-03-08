import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Settings, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoyalty() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: settings } = useQuery({
    queryKey: ["loyalty-settings"],
    queryFn: async () => {
      const list = await base44.entities.LoyaltySettings.list();
      return list[0] || null;
    },
    enabled: user?.role === "admin",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["loyalty-accounts"],
    queryFn: () => base44.entities.LoyaltyAccount.list("-points_balance"),
    enabled: user?.role === "admin",
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["loyalty-transactions"],
    queryFn: () => base44.entities.LoyaltyTransaction.list("-created_date", 50),
    enabled: user?.role === "admin",
  });

  const settingsMutation = useMutation({
    mutationFn: (data) => {
      if (settings) {
        return base44.entities.LoyaltySettings.update(settings.id, data);
      }
      return base44.entities.LoyaltySettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty-settings"]);
      toast.success("Settings updated");
    },
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    settingsMutation.mutate({
      points_per_peso: parseFloat(formData.get("points_per_peso")),
      peso_per_point: parseFloat(formData.get("peso_per_point")),
      bronze_threshold: parseFloat(formData.get("bronze_threshold")),
      silver_threshold: parseFloat(formData.get("silver_threshold")),
      gold_threshold: parseFloat(formData.get("gold_threshold")),
      platinum_threshold: parseFloat(formData.get("platinum_threshold")),
      bronze_bonus: parseFloat(formData.get("bronze_bonus")),
      silver_bonus: parseFloat(formData.get("silver_bonus")),
      gold_bonus: parseFloat(formData.get("gold_bonus")),
      platinum_bonus: parseFloat(formData.get("platinum_bonus")),
      min_redemption_points: parseFloat(formData.get("min_redemption_points")),
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  const totalPoints = accounts.reduce((sum, acc) => sum + (acc.points_balance || 0), 0);
  const totalMembers = accounts.length;
  const tierCounts = {
    bronze: accounts.filter(a => a.tier === "bronze").length,
    silver: accounts.filter(a => a.tier === "silver").length,
    gold: accounts.filter(a => a.tier === "gold").length,
    platinum: accounts.filter(a => a.tier === "platinum").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            Loyalty Program Management
          </h1>
          <p className="text-slate-500 mt-1">Configure rewards and track member activity</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Members</p>
                  <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Points</p>
                  <p className="text-2xl font-bold text-slate-900">{totalPoints.toLocaleString()}</p>
                </div>
                <Award className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Gold+ Members</p>
                  <p className="text-2xl font-bold text-slate-900">{tierCounts.gold + tierCounts.platinum}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Platinum Members</p>
                  <p className="text-2xl font-bold text-slate-900">{tierCounts.platinum}</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Loyalty Program Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">Points Accrual</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Points per Peso Spent</Label>
                          <Input
                            name="points_per_peso"
                            type="number"
                            step="0.1"
                            defaultValue={settings?.points_per_peso || 1}
                            required
                          />
                        </div>
                        <div>
                          <Label>Peso Value per Point (Redemption)</Label>
                          <Input
                            name="peso_per_point"
                            type="number"
                            step="0.01"
                            defaultValue={settings?.peso_per_point || 0.5}
                            required
                          />
                        </div>
                        <div>
                          <Label>Minimum Points for Redemption</Label>
                          <Input
                            name="min_redemption_points"
                            type="number"
                            defaultValue={settings?.min_redemption_points || 100}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">Tier Thresholds (Lifetime Points)</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Bronze Tier</Label>
                          <Input
                            name="bronze_threshold"
                            type="number"
                            defaultValue={settings?.bronze_threshold || 0}
                            required
                          />
                        </div>
                        <div>
                          <Label>Silver Tier</Label>
                          <Input
                            name="silver_threshold"
                            type="number"
                            defaultValue={settings?.silver_threshold || 5000}
                            required
                          />
                        </div>
                        <div>
                          <Label>Gold Tier</Label>
                          <Input
                            name="gold_threshold"
                            type="number"
                            defaultValue={settings?.gold_threshold || 15000}
                            required
                          />
                        </div>
                        <div>
                          <Label>Platinum Tier</Label>
                          <Input
                            name="platinum_threshold"
                            type="number"
                            defaultValue={settings?.platinum_threshold || 30000}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">Tier Bonus Percentages</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Bronze Bonus (%)</Label>
                          <Input
                            name="bronze_bonus"
                            type="number"
                            defaultValue={settings?.bronze_bonus || 0}
                            required
                          />
                        </div>
                        <div>
                          <Label>Silver Bonus (%)</Label>
                          <Input
                            name="silver_bonus"
                            type="number"
                            defaultValue={settings?.silver_bonus || 10}
                            required
                          />
                        </div>
                        <div>
                          <Label>Gold Bonus (%)</Label>
                          <Input
                            name="gold_bonus"
                            type="number"
                            defaultValue={settings?.gold_bonus || 25}
                            required
                          />
                        </div>
                        <div>
                          <Label>Platinum Bonus (%)</Label>
                          <Input
                            name="platinum_bonus"
                            type="number"
                            defaultValue={settings?.platinum_bonus || 50}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={settingsMutation.isPending}>
                    {settingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Member</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Tier</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Points Balance</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Lifetime Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b">
                          <td className="py-3 px-4 text-sm text-slate-700">{account.user_email}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                account.tier === "platinum"
                                  ? "bg-purple-100 text-purple-700"
                                  : account.tier === "gold"
                                  ? "bg-amber-100 text-amber-700"
                                  : account.tier === "silver"
                                  ? "bg-slate-300 text-slate-700"
                                  : "bg-orange-100 text-orange-700"
                              }
                            >
                              {account.tier?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700 text-right font-semibold">
                            {account.points_balance?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 text-right">
                            {account.lifetime_points?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Member</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Description</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn.id} className="border-b">
                          <td className="py-3 px-4 text-sm text-slate-700">
                            {new Date(txn.created_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{txn.user_email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={txn.transaction_type === "earn" ? "default" : "outline"}>
                              {txn.transaction_type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{txn.description}</td>
                          <td
                            className={`py-3 px-4 text-sm text-right font-semibold ${
                              txn.points > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {txn.points > 0 ? "+" : ""}
                            {txn.points}
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
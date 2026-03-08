import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPayouts() {
  const queryClient = useQueryClient();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [formData, setFormData] = useState({
    account_type: "paymongo",
    payment_method: "domestic_paymongo",
    account_identifier: "",
    account_name: ""
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["payout-accounts"],
    queryFn: () => base44.entities.PayoutAccount.list("-created_date")
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["markup-payouts"],
    queryFn: () => base44.entities.MarkupPayout.list("-created_date", 100)
  });

  const addAccountMutation = useMutation({
    mutationFn: (data) => base44.entities.PayoutAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
      setShowAddAccount(false);
      setFormData({ account_type: "paymongo", payment_method: "domestic_paymongo", account_identifier: "", account_name: "" });
    }
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PayoutAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
    }
  });

  const statusColors = {
    completed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    completed: CheckCircle2,
    processing: Clock,
    failed: AlertCircle,
    pending: Clock
  };

  const totalMarkupEarned = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.total_markup || 0), 0);

  const pendingMarkup = payouts
    .filter(p => ['pending', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + (p.total_markup || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Markup Payouts</h1>
          <p className="text-slate-400 mt-2">Manage your weekly payout accounts and track payouts</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Markup Earned</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">₱{totalMarkupEarned.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-100" />
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Payout</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">₱{pendingMarkup.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-100" />
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Accounts</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{accounts.filter(a => a.is_active).length}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-100" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Payout Accounts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Payout Accounts</h2>
            <Button onClick={() => setShowAddAccount(true)} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>

          <div className="grid gap-4">
            {accounts.map((account, i) => (
              <motion.div key={account.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{account.account_name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{account.account_identifier}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge className={account.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">{account.account_type}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">{account.payment_method}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Total Received</p>
                      <p className="text-2xl font-bold text-green-600">₱{(account.total_received || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                      {account.last_payout_date && (
                        <p className="text-xs text-slate-500 mt-2">{new Date(account.last_payout_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payout History */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Payout History</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Payout #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Period</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Payments</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => {
                    const StatusIcon = statusIcons[payout.status] || Clock;
                    return (
                      <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">{payout.payout_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          ₱{(payout.total_markup || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{payout.payment_count || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            <Badge className={statusColors[payout.status]}>
                              {payout.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payout Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Account Type</label>
              <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paymongo">PayMongo</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Payment Method</label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe_to_gcash">Stripe → GCash (International)</SelectItem>
                  <SelectItem value="domestic_paymongo">PayMongo (Domestic)</SelectItem>
                  <SelectItem value="domestic_gcash">GCash (Domestic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Account Identifier (Phone/Number)</label>
              <Input
                value={formData.account_identifier}
                onChange={(e) => setFormData({ ...formData, account_identifier: e.target.value })}
                placeholder="e.g., 09171234567"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Account Name</label>
              <Input
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <Button
              onClick={() => addAccountMutation.mutate(formData)}
              disabled={addAccountMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {addAccountMutation.isPending ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
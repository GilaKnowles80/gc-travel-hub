import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Globe, Plus, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function MultiCurrencyWallet({ user, accounts }) {
  const [open, setOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeAmount, setExchangeAmount] = useState("");
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async (currency) => {
      return await base44.entities.CurrencyAccount.create({
        user_email: user.email,
        currency: currency,
        balance: 0,
        is_primary: accounts.length === 0,
      });
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["currency-accounts"] });
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: async (data) => {
      // This would call a backend function for actual exchange
      return { success: true, message: "Exchange initiated" };
    },
  });

  const primaryAccount = accounts.find(a => a.is_primary);

  return (
    <div className="space-y-4">
      {/* Primary Account */}
      {primaryAccount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Primary Wallet</p>
              <p className="text-3xl font-bold">{primaryAccount.currency}</p>
            </div>
            <Globe className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-4xl font-bold">{primaryAccount.balance.toLocaleString()}</p>
          <p className="text-emerald-100 text-sm mt-2">≈ PHP {(primaryAccount.balance * (primaryAccount.last_exchange_rate || 55)).toLocaleString()}</p>
        </motion.div>
      )}

      {/* All Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="p-4 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-600">{account.currency} Account</p>
                <p className="text-2xl font-bold text-slate-900">{account.balance}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                {account.status}
              </span>
            </div>
            <Button size="sm" variant="outline" className="w-full">Exchange</Button>
          </Card>
        ))}
      </div>

      {/* Add Currency */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full border-2 border-dashed" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Currency Account
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Multi-Currency Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Currency</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                🌍 Create accounts in multiple currencies. Receive international payments directly and exchange at better rates.
              </p>
            </div>

            <Button
              onClick={() => createAccountMutation.mutate(selectedCurrency)}
              disabled={createAccountMutation.isPending}
              className="w-full"
            >
              {createAccountMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exchange Rates */}
      <Card className="p-4 bg-slate-50">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          Live Exchange Rates
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <p className="text-slate-600">USD/PHP</p>
            <p className="font-bold">55.50</p>
          </div>
          <div>
            <p className="text-slate-600">EUR/PHP</p>
            <p className="font-bold">60.25</p>
          </div>
          <div>
            <p className="text-slate-600">GBP/PHP</p>
            <p className="font-bold">69.80</p>
          </div>
          <div>
            <p className="text-slate-600">SGD/PHP</p>
            <p className="font-bold">41.30</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
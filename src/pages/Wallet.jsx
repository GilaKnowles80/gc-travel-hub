import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Send, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AddFundsDialog from "@/components/wallet/AddFundsDialog";
import WithdrawFundsDialog from "@/components/wallet/WithdrawFundsDialog";

const MAX_WALLET_AMOUNT = 1_000_000_000; // 1 billion

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [allWallets, setAllWallets] = useState([]);

  const queryClient = useQueryClient();

  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch all wallets for admin view
  const { data: adminWallets = [] } = useQuery({
    queryKey: ["all-wallets"],
    queryFn: async () => {
      try {
        return await base44.entities.Wallet.list();
      } catch {
        return [];
      }
    },
    enabled: user?.role === "admin",
  });

  // Fetch user's wallet
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
      return wallets[0] || null;
    },
    enabled: !!user?.email,
  });

  // Fetch wallet transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["wallet-transactions", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const txns = await base44.entities.WalletTransaction.filter({ user_email: user.email });
      return txns.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (numAmount > MAX_WALLET_AMOUNT) {
        throw new Error(`Maximum deposit amount is ${MAX_WALLET_AMOUNT.toLocaleString()}`);
      }

      const currentBalance = walletData?.balance || 0;
      const newBalance = currentBalance + numAmount;

      if (newBalance > MAX_WALLET_AMOUNT) {
        throw new Error(`Wallet balance cannot exceed ${MAX_WALLET_AMOUNT.toLocaleString()}`);
      }

      // Create or update wallet
      if (walletData) {
        await base44.entities.Wallet.update(walletData.id, { balance: newBalance });
      } else {
        await base44.entities.Wallet.create({
          user_email: user.email,
          balance: numAmount,
          points_balance: 0,
        });
      }

      // Record transaction
      await base44.entities.WalletTransaction.create({
        user_email: user.email,
        transaction_type: "deposit",
        amount: numAmount,
        description: `Deposited ${numAmount.toLocaleString()}`,
      });

      queryClient.invalidateQueries({ queryKey: ["wallet", user.email] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", user.email] });
    },
    onSuccess: () => {
      setDepositAmount("");
      setDepositError("");
      setIsDepositOpen(false);
    },
    onError: (error) => {
      setDepositError(error.message);
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const currentBalance = walletData?.balance || 0;

      if (numAmount > currentBalance) {
        throw new Error("Insufficient balance");
      }

      const newBalance = currentBalance - numAmount;

      // Update wallet
      await base44.entities.Wallet.update(walletData.id, { balance: newBalance });

      // Record transaction
      await base44.entities.WalletTransaction.create({
        user_email: user.email,
        transaction_type: "withdrawal",
        amount: numAmount,
        description: `Withdrew ${numAmount.toLocaleString()}`,
      });

      queryClient.invalidateQueries({ queryKey: ["wallet", user.email] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", user.email] });
    },
    onSuccess: () => {
      setWithdrawAmount("");
      setWithdrawError("");
      setIsWithdrawOpen(false);
    },
    onError: (error) => {
      setWithdrawError(error.message);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <p className="text-center text-slate-600">Please log in to access your wallet</p>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const balance = walletData?.balance || 0;
  const usagePercent = (balance / MAX_WALLET_AMOUNT) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-8 h-8 text-amber-600" />
              <h1 className="text-4xl font-bold text-slate-900">{isAdmin ? "Wallet Management" : "My Wallet"}</h1>
            </div>
            {isAdmin && <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">Admin View</span>}
          </div>
          <p className="text-slate-600">{isAdmin ? "Monitor and manage all user wallets" : "Manage your account balance"}</p>
        </motion.div>

        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="text-blue-700 text-sm font-medium">Total Wallets</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{adminWallets.length}</p>
            </Card>
            <Card className="p-6 bg-green-50 border-green-200">
              <p className="text-green-700 text-sm font-medium">Total Balance</p>
              <p className="text-3xl font-bold text-green-900 mt-2">₱{adminWallets.reduce((sum, w) => sum + (w.balance || 0), 0).toLocaleString()}</p>
            </Card>
            <Card className="p-6 bg-orange-50 border-orange-200">
              <p className="text-orange-700 text-sm font-medium">Avg Balance</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">₱{adminWallets.length > 0 ? Math.round(adminWallets.reduce((sum, w) => sum + (w.balance || 0), 0) / adminWallets.length).toLocaleString() : 0}</p>
            </Card>
          </motion.div>
        )}

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8 shadow-xl">
            <p className="text-amber-100 text-sm font-medium mb-2">Current Balance</p>
            <h2 className="text-5xl font-bold mb-6">{balance.toLocaleString()}</h2>

            {/* Usage Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Wallet Capacity</span>
                <span className="text-sm font-semibold">{usagePercent.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-amber-100 mt-2">Max: {MAX_WALLET_AMOUNT.toLocaleString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-white text-amber-600 hover:bg-amber-50 font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        setDepositError("");
                      }}
                      max={MAX_WALLET_AMOUNT}
                      min="0"
                      step="0.01"
                    />
                    {depositError && <p className="text-red-600 text-sm">{depositError}</p>}
                    <Button
                      onClick={() => depositMutation.mutate(depositAmount)}
                      disabled={depositMutation.isPending || !depositAmount}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-white/20 text-white hover:bg-white/30 font-semibold border border-white/30">
                    <Send className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        setWithdrawError("");
                      }}
                      max={balance}
                      min="0"
                      step="0.01"
                    />
                    {withdrawError && <p className="text-red-600 text-sm">{withdrawError}</p>}
                    <Button
                      onClick={() => withdrawMutation.mutate(withdrawAmount)}
                      disabled={withdrawMutation.isPending || !withdrawAmount}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="text-2xl font-bold text-slate-900">Transaction History</h3>
            </div>

            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {txn.transaction_type === "deposit" ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 capitalize">{txn.transaction_type}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(txn.created_date).toLocaleDateString()} {new Date(txn.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-lg ${txn.transaction_type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                      {txn.transaction_type === "deposit" ? "+" : "-"}
                      {txn.amount.toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Admin Wallets Table */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">All User Wallets</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">User Email</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Usage</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminWallets.map((wallet) => {
                      const usage = (wallet.balance / MAX_WALLET_AMOUNT) * 100;
                      return (
                        <tr key={wallet.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-slate-900 font-medium">{wallet.user_email}</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-900">₱{(wallet.balance || 0).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <div className="w-full bg-slate-200 rounded-full h-2 mx-auto max-w-xs">
                              <div className={`h-2 rounded-full transition-all ${usage > 80 ? "bg-red-500" : usage > 50 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${Math.min(usage, 100)}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 text-center mt-1">{usage.toFixed(1)}%</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Button size="sm" variant="outline" onClick={() => setSelectedUserEmail(wallet.user_email)} className="text-xs">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
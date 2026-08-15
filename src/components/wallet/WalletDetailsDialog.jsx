import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const MAX_WALLET_AMOUNT = 1_000_000_000;

export default function WalletDetailsDialog({ open, onOpenChange, userEmail }) {
  const { data: wallet } = useQuery({
    queryKey: ["admin-wallet-detail", userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const wallets = await base44.entities.Wallet.filter({ user_email: userEmail });
      return wallets[0] || null;
    },
    enabled: open && !!userEmail,
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-wallet-transactions", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const txns = await base44.entities.WalletTransaction.filter({ user_email: userEmail });
      return txns.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: open && !!userEmail,
  });

  const balance = wallet?.balance || 0;
  const usage = (balance / MAX_WALLET_AMOUNT) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wallet Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-5">
            <p className="text-amber-100 text-sm">{userEmail}</p>
            <p className="text-3xl font-bold mt-1">₱{balance.toLocaleString()}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-100">Wallet Capacity</span>
                <span className="font-semibold">{usage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Transactions</h4>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {transactions.map((txn) => {
                  const isCredit = txn.type === "credit" || txn.type === "deposit";
                  return (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between border border-slate-100 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">
                          {txn.type?.replace(/_/g, " ") || "Transaction"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {txn.description || "—"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(txn.created_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={isCredit ? "default" : "secondary"}
                        className={isCredit ? "bg-green-600" : "bg-slate-400"}
                      >
                        {isCredit ? "+" : "−"}₱{(txn.amount || 0).toLocaleString()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
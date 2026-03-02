import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, AlertCircle } from "lucide-react";

export default function WithdrawFundsDialog({ open, onOpenChange, user, balance, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("gcash");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (numAmount > balance) {
        throw new Error("Insufficient balance");
      }

      // Call backend function to process withdrawal with Stripe
      const response = await base44.functions.invoke("processWalletWithdrawalStripe", {
        amount: numAmount,
        withdrawMethod,
        bankAccount,
        accountName,
      });

      if (response.data.success) {
        setAmount("");
        setBankAccount("");
        setAccountName("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(response.data.error || "Withdrawal processing failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Withdrawals are processed within 1-3 business days. A small processing fee may apply.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₱)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={balance}
              step="0.01"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Available: ₱{balance.toLocaleString()}</p>
          </div>

          {/* Withdrawal Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Withdrawal Method</label>
            <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="paymongo">PayMongo Payout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Details */}
          {withdrawMethod === "gcash" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GCash Number</label>
              <Input
                placeholder="09XX-XXX-XXXX"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
              />
            </div>
          )}

          {withdrawMethod === "bank" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <Input
                  placeholder="Account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account Number</label>
                <Input
                  placeholder="Account number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {withdrawMethod === "paymongo" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw ₱${amount || "0"}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
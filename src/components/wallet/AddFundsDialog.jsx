import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader } from "lucide-react";

export default function AddFundsDialog({ open, onOpenChange, user, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (window.self !== window.top) {
        throw new Error("Checkout must be accessed from the published app, not from an embedded preview");
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      let response;

      if (paymentMethod === "stripe") {
        response = await base44.functions.invoke("createWalletDepositCheckout", {
          amount: numAmount,
        });
        if (response.data.success && response.data.url) {
          window.location.href = response.data.url;
        }
      } else if (paymentMethod === "paypal") {
        response = await base44.functions.invoke("createPayPalWalletCheckout", {
          amount: numAmount,
        });
        if (response.data.success && response.data.approvalUrl) {
          window.location.href = response.data.approvalUrl;
        }
      } else if (paymentMethod === "paymongo") {
        response = await base44.functions.invoke("createPayMongoWalletCheckout", {
          amount: numAmount,
        });
        if (response.data.success && response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
        }
      } else if (paymentMethod === "bank") {
        response = await base44.functions.invoke("createBankTransferRequest", {
          amount: numAmount,
          bankName,
          accountName,
        });
        if (response.data.success) {
          setAmount("");
          setBankName("");
          setAccountName("");
          onOpenChange(false);
          onSuccess?.();
          return;
        }
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Payment processing failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Funds to Wallet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe (Card)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="paymongo">PayMongo</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            placeholder="Amount to be Deposited (₱)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />

          {paymentMethod === "bank" && (
            <>
              <Input
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
              <Input
                placeholder="Account Holder Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Deposit ₱${amount || "0"}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
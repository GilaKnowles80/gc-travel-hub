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
          <Input
            type="number"
            placeholder="Amount to be Deposited (₱)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />

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
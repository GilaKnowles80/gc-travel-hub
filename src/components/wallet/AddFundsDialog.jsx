import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Loader } from "lucide-react";

export default function AddFundsDialog({ open, onOpenChange, user, onSuccess }) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
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

      if (expDate.length !== 5 || !expDate.includes("/")) {
        throw new Error("Expiry date must be in MM/DD format");
      }

      const [expMonth, expYear] = expDate.split("/");

      const response = await base44.functions.invoke("processWalletDeposit", {
        amount: numAmount,
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expMonth,
        expYear,
        cvv,
        userEmail: user.email,
      });

      if (response.data.success) {
        setCardName("");
        setCardNumber("");
        setAmount("");
        setExpDate("");
        setCvv("");
        onOpenChange(false);
        onSuccess?.();
      } else {
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
            placeholder="Full Name on Card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />

          <Input
            placeholder="Debit/Credit Card or Account Number"
            value={cardNumber}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "").slice(0, 16);
              val = val.replace(/(\d{4})/g, "$1 ").trim();
              setCardNumber(val);
            }}
            required
          />

          <Input
            type="number"
            placeholder="Amount to be Deposited (₱)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />

          <Input
            placeholder="EXP Date (MM/DD)"
            value={expDate}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");
              if (val.length >= 2) {
                val = val.slice(0, 2) + "/" + val.slice(2, 4);
              }
              setExpDate(val);
            }}
            maxLength="5"
            required
          />

          <Input
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.slice(0, 4))}
            maxLength="4"
            type="password"
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
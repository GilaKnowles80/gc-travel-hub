import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader } from "lucide-react";

export default function AddFundsDialog({ open, onOpenChange, user, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
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

      // Call backend function to process deposit
      const response = await base44.functions.invoke("processWalletDeposit", {
        amount: numAmount,
        paymentMethod,
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expMonth,
        expYear,
        cvv,
        userEmail: user.email,
      });

      if (response.data.success) {
        setAmount("");
        setCardName("");
        setCardNumber("");
        setExpMonth("");
        setExpYear("");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₱)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                <SelectItem value="paymongo">PayMongo</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Details */}
          {paymentMethod !== "paypal" && (
            <>
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Details
                </h4>

                <Input
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />

                <Input
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
                    val = val.replace(/(\d{4})/g, "$1 ").trim();
                    setCardNumber(val);
                  }}
                  required
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="MM"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.slice(0, 2))}
                    maxLength="2"
                    required
                  />
                  <Input
                    placeholder="YY"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.slice(0, 2))}
                    maxLength="2"
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
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Security Note */}
          <p className="text-xs text-slate-500">
            🔒 Your card information is securely processed and never stored on our servers.
          </p>

          {/* Submit Button */}
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
              `Add ₱${amount || "0"} to Wallet`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
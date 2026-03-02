import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function WalletPaymentModal({ isOpen, onClose, amount, bookingType, bookingId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [customAmount, setCustomAmount] = useState(amount.toString());

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      const finalAmount = parseFloat(customAmount);

      if (isNaN(finalAmount) || finalAmount <= 0) {
        throw new Error("Invalid amount");
      }

      const response = await base44.functions.invoke('processWalletPayment', {
        amount: finalAmount,
        bookingId,
        bookingType,
        description: `${bookingType} booking payment`,
      });

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(response.data);
          onClose();
          setSuccess(false);
          setCustomAmount(amount.toString());
        }, 2000);
      } else {
        throw new Error(response.data?.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-600" />
            Pay with Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!success ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Amount to Pay</p>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="text-lg font-bold"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 100% of payment goes to your wallet and is fully withdrawable
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Your funds are stored securely in your wallet
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-3" />
              <p className="text-lg font-semibold text-slate-900 mb-1">Payment Successful!</p>
              <p className="text-sm text-slate-600 text-center">
                Your payment has been added to your wallet and can be withdrawn anytime.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
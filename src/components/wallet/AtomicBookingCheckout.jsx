import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2, Wallet, Lock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function AtomicBookingCheckout({
  bookingId,
  bookingType,
  totalAmount,
  supplierId,
  supplierName,
  supplierCost,
  serviceFee = 0,
  supplierApiConfig,
  onSuccess,
  onError
}) {
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txnState, setTxnState] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const wallets = await base44.entities.Wallet.filter({ user_email: user.email });
      return wallets[0] || null;
    }
  });

  // Fetch velocity limits
  const { data: velocityLimits } = useQuery({
    queryKey: ["velocity-limits"],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const limits = await base44.entities.VelocityLimit.filter({ user_email: user.email });
      return limits[0] || null;
    }
  });

  const gcCommission = totalAmount - supplierCost - serviceFee;
  const walletAmount = paymentMethod === "wallet" ? totalAmount : paymentMethod === "split" ? Math.floor(totalAmount * 0.5) : 0;
  const cardAmount = paymentMethod === "split" ? totalAmount - walletAmount : paymentMethod === "card" ? totalAmount : 0;

  // Check velocity
  const canProcess = !velocityLimits || 
    (velocityLimits.transacted_today || 0) + totalAmount <= (velocityLimits.daily_transaction_limit || 500000);

  // Execute atomic booking
  const executeBooking = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const user = await base44.auth.me();

      const payload = {
        booking_id: bookingId,
        booking_type: bookingType,
        total_amount: totalAmount,
        wallet_amount: walletAmount,
        card_amount: cardAmount,
        supplier_id: supplierId,
        supplier_name: supplierName,
        supplier_payout: supplierCost,
        service_fee: serviceFee,
        payment_method: paymentMethod,
        supplier_api_config: supplierApiConfig
      };

      const response = await base44.functions.invoke('atomicBookingExecution', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setTxnState(data);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["velocity-limits"] });
      if (data.status === 'success') {
        onSuccess?.(data);
      } else {
        onError?.(data);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      setTxnState({
        status: 'error',
        error: error.message,
        txn_state: 'error'
      });
      onError?.(error);
      setIsProcessing(false);
    }
  });

  if (walletLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
          <p>Loading wallet information...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Booking Summary */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Booking Type:</span>
            <span className="font-medium">{bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Amount:</span>
            <span className="font-bold text-lg">₱{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-600">Supplier Cost:</span>
            <span>₱{supplierCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Service Fee:</span>
            <span>₱{serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">GC Commission:</span>
            <span className="text-amber-600 font-medium">₱{gcCommission.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Payment Method Selection */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          {/* Wallet Option */}
          <button
            onClick={() => setPaymentMethod("wallet")}
            disabled={isProcessing || !canProcess}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              paymentMethod === "wallet"
                ? "border-amber-600 bg-amber-50"
                : "border-slate-200 bg-white hover:border-amber-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-amber-600" />
              <div className="text-left flex-1">
                <p className="font-medium">Wallet</p>
                <p className="text-sm text-slate-600">Balance: ₱{(wallet?.balance || 0).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₱{totalAmount.toLocaleString()}</p>
                {wallet?.balance && wallet.balance < totalAmount && (
                  <p className="text-xs text-red-600">Insufficient balance</p>
                )}
              </div>
            </div>
          </button>

          {/* Card Option */}
          <button
            onClick={() => setPaymentMethod("card")}
            disabled={isProcessing}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              paymentMethod === "card"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-blue-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div className="text-left flex-1">
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-sm text-slate-600">Stripe Payment</p>
              </div>
              <p className="font-semibold">₱{totalAmount.toLocaleString()}</p>
            </div>
          </button>

          {/* Split Option */}
          <button
            onClick={() => setPaymentMethod("split")}
            disabled={isProcessing || !wallet?.balance || wallet.balance < Math.floor(totalAmount * 0.5)}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              paymentMethod === "split"
                ? "border-purple-600 bg-purple-50"
                : "border-slate-200 bg-white hover:border-purple-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                ½
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">50/50 Split</p>
                <p className="text-sm text-slate-600">
                  ₱{Math.floor(totalAmount * 0.5).toLocaleString()} wallet + ₱{Math.ceil(totalAmount * 0.5).toLocaleString()} card
                </p>
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Velocity Check */}
      {velocityLimits && !canProcess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Daily Limit Exceeded</p>
            <p className="text-red-700">
              You've used ₱{(velocityLimits.transacted_today || 0).toLocaleString()} of your ₱{(velocityLimits.daily_transaction_limit || 500000).toLocaleString()} daily limit.
            </p>
          </div>
        </motion.div>
      )}

      {/* Wallet Lock Security */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex gap-2 text-sm">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Atomic Transaction</p>
            <p className="text-blue-700 text-xs mt-1">
              Your funds are locked until the booking is confirmed with the supplier.
            </p>
          </div>
        </div>
      </Card>

      {/* Transaction Status */}
      {txnState && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex gap-3 ${
            txnState.status === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {txnState.status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className={`font-semibold ${txnState.status === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {txnState.status === 'success' ? 'Booking Confirmed!' : 'Transaction Failed'}
            </p>
            <p className={txnState.status === 'success' ? 'text-green-700' : 'text-red-700'}>
              {txnState.message}
            </p>
          </div>
        </motion.div>
      )}

      {/* Process Button */}
      <Button
        onClick={() => executeBooking.mutate()}
        disabled={isProcessing || !canProcess || (paymentMethod === "wallet" && wallet?.balance < totalAmount)}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Confirm & Process Booking
          </>
        )}
      </Button>
    </div>
  );
}
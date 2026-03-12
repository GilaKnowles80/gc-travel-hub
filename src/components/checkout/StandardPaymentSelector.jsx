import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, Building2, Loader2, CheckCircle2, Info, Phone, QrCode, Zap } from "lucide-react";
import PayMongoQRModal from "@/components/payment/PayMongoQRModal";
import XenditPayment from "@/components/payment/XenditPayment";

/**
 * StandardPaymentSelector - Unified payment method selection
 * Supports: Stripe, PayMongo, PayPal, Bank Transfer
 */
export default function StandardPaymentSelector({
  bookingData,
  customerInfo,
  isProcessing,
  onPayment,
}) {
  const [selectedMethod, setSelectedMethod] = useState("xendit");
  const [isLoading, setIsLoading] = useState(false);
  const [paymongoQROpen, setPaymongoQROpen] = useState(false);

  const handlePayment = async () => {
    if (selectedMethod === "xendit") {
      // Handled by XenditPayment component directly
      return;
    }
    if (selectedMethod === "paymongo_qr") {
      setPaymongoQROpen(true);
      return;
    }
    setIsLoading(true);
    try {
      await onPayment(selectedMethod, {
        booking: bookingData,
        customer: customerInfo,
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: "xendit",
      name: "Xendit — GCash, Maya, Cards & More ⭐",
      description: "GCash, Maya, Credit/Debit Cards, OTC, Online Banking",
      icon: Zap,
      fee: "Primary",
      badge: "RECOMMENDED",
    },
    {
      id: "stripe",
      name: "Credit/Debit Card (Stripe)",
      description: "Visa, Mastercard, American Express — International",
      icon: CreditCard,
      fee: "2.9% + $0.30",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Fast & Secure",
      icon: CreditCard,
      fee: "Free",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer with manual confirmation",
      icon: Building2,
      fee: "Free",
    },
  ];

  const total = bookingData?.totalPrice || 0;

  return (
    <div className="space-y-6">
      {/* Total Amount */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-700 font-medium">Total Amount:</span>
          <span className="text-4xl font-bold text-amber-600">
            ₱{total?.toLocaleString() || "0.00"}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-slate-900">
          Select Payment Method
        </Label>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Icon className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <Label
                    htmlFor={method.id}
                    className="font-semibold text-slate-900 cursor-pointer block"
                  >
                    {method.name}
                  </Label>
                  <p className="text-xs text-slate-600">{method.description}</p>
                </div>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                  {method.fee}
                </span>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Xendit inline payment (primary) */}
      {selectedMethod === "xendit" ? (
        <XenditPayment
          amount={total}
          currency="PHP"
          description={bookingData?.description || bookingData?.tourTitle || bookingData?.type || "Travel Booking"}
          bookingRef={bookingData?.bookingRef || bookingData?.id}
        />
      ) : (
        <Button
          onClick={handlePayment}
          disabled={isLoading || isProcessing || !customerInfo.email}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12 rounded-xl gap-2 text-lg"
        >
          {isLoading || isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₱{total?.toLocaleString() || "0.00"}
            </>
          )}
        </Button>
      )}

      {/* What happens next */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-green-800">✅ What happens after payment:</p>
        <ul className="text-xs text-green-700 space-y-1">
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> You'll receive a booking confirmation email immediately</li>
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> Your booking will appear in "My Bookings"</li>
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> Our team will follow up within 24 hours if needed</li>
        </ul>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-xs text-blue-700">
          🔒 Your payment is encrypted and secure. We never store your card details.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-60" />
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-xs text-slate-500 font-semibold">PayMongo</span>
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-xs text-slate-500 font-semibold">QR Ph</span>
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-xs text-slate-500 font-semibold">Stripe</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Need help? <a href="tel:+639154401150" className="font-semibold underline">Call +639154401150</a> — we're here 24/7.
        </p>
      </div>

      <PayMongoQRModal
        open={paymongoQROpen}
        onClose={() => setPaymongoQROpen(false)}
        amount={bookingData?.totalPrice || 0}
        bookingType={bookingData?.type}
        bookingId={bookingData?.id}
      />
    </div>
  );
}
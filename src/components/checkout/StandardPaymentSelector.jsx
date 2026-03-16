import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CreditCard, Building2, Loader2, CheckCircle2, Zap, Globe } from "lucide-react";
import XenditPayment from "@/components/payment/XenditPayment";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoQRModal from "@/components/payment/PayMongoQRModal";

/**
 * StandardPaymentSelector
 * - Xendit: Local PH gateway (GCash, Maya, Cards, OTC, Online Banking)
 * - Stripe: International gateway (Visa, Mastercard, Amex, global cards)
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
    if (selectedMethod === "bank_transfer") {
      setIsLoading(true);
      try {
        await onPayment(selectedMethod, { booking: bookingData, customer: customerInfo });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const total = bookingData?.totalPrice || 0;

  const localMethods = [
    {
      id: "xendit",
      name: "Xendit",
      description: "GCash, Maya, Credit/Debit Cards, OTC, Online Banking",
      icon: Zap,
      badge: "RECOMMENDED",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer with manual confirmation",
      icon: Building2,
      fee: "Free",
    },
  ];

  const intlMethods = [
    {
      id: "stripe",
      name: "Credit / Debit Card",
      description: "Visa, Mastercard, Amex — Powered by Stripe",
      icon: CreditCard,
      fee: "2.9% + $0.30",
    },
  ];

  const renderMethodCard = (method) => {
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
          <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor={method.id} className="font-semibold text-slate-900 cursor-pointer">
              {method.name}
            </Label>
            {method.badge && (
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">
                {method.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{method.description}</p>
        </div>
        {method.fee && (
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{method.fee}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Total Amount */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-700 font-medium">Total Amount:</span>
          <span className="text-4xl font-bold text-amber-600">
            ₱{total?.toLocaleString() || "0.00"}
          </span>
        </div>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
        {/* Local PH Gateway */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">🇵🇭 Local Payment (Philippines)</span>
          </div>
          {localMethods.map(renderMethodCard)}
        </div>

        {/* International Gateway */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">International Payment</span>
          </div>
          {intlMethods.map(renderMethodCard)}
        </div>
      </RadioGroup>

      {/* Payment Action */}
      {selectedMethod === "xendit" && (
        <XenditPayment
          amount={total}
          currency="PHP"
          description={bookingData?.description || bookingData?.tourTitle || bookingData?.type || "Travel Booking"}
          bookingRef={bookingData?.bookingRef || bookingData?.id}
        />
      )}

      {selectedMethod === "stripe" && (
        <StripeCheckout
          bookingType={bookingData?.type}
          bookingId={bookingData?.id || bookingData?.bookingRef}
          amount={total}
          currency="PHP"
        />
      )}

      {selectedMethod === "bank_transfer" && (
        <Button
          onClick={handlePayment}
          disabled={isLoading || isProcessing}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12 rounded-xl text-lg"
        >
          {isLoading || isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            <><Building2 className="w-5 h-5" /> Pay via Bank Transfer</>
          )}
        </Button>
      )}

      {/* After payment info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-green-800">✅ What happens after payment:</p>
        <ul className="text-xs text-green-700 space-y-1">
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> You'll receive a booking confirmation email immediately</li>
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> Your booking will appear in "My Bookings"</li>
          <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> Our team will follow up within 24 hours if needed</li>
        </ul>
      </div>

      {/* Security */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-xs text-blue-700">🔒 Your payment is encrypted and secure. We never store your card details.</p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap text-xs text-slate-500 font-semibold">
          <span>Xendit</span><span className="text-slate-300">|</span>
          <span>Stripe</span><span className="text-slate-300">|</span>
          <span>GCash</span><span className="text-slate-300">|</span>
          <span>Maya</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Need help? <a href="tel:+639154401150" className="font-semibold underline">Call +639154401150</a> — we're here 24/7.
        </p>
      </div>

      <PayMongoQRModal
        open={paymongoQROpen}
        onClose={() => setPaymongoQROpen(false)}
        amount={total}
        bookingType={bookingData?.type}
        bookingId={bookingData?.id}
      />
    </div>
  );
}
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, HelpCircle, MessageCircle, Phone, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BOOKING_TIPS = {
  1: [
    "✅ Review all booking details carefully before proceeding.",
    "📅 Check the date and time — make sure it matches your travel plans.",
    "🔄 Prices shown are final including all fees and taxes.",
  ],
  2: [
    "📝 Enter your details exactly as they appear on your government ID or passport.",
    "📧 Use a valid email — your booking confirmation will be sent there.",
    "📱 Include your country code in your phone number (e.g. +63 for Philippines).",
  ],
  3: [
    "💳 Credit/Debit Card — instant confirmation via Stripe.",
    "📲 PayMongo — supports GCash, Maya, and local banks.",
    "🏦 Bank Transfer — send proof of payment to confirm your booking.",
    "🔒 All payments are encrypted and secure.",
  ],
};

/**
 * UnifiedCheckoutFlow - Standard booking flow for all travel services
 * Steps: 1) Summary 2) Customer Info 3) Payment
 */
export default function UnifiedCheckoutFlow({
  bookingType,
  bookingData,
  summaryComponent: SummaryComponent,
  customerFormComponent: CustomerFormComponent,
  paymentComponent: PaymentComponent,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePayment = async (paymentMethod) => {
    setIsProcessing(true);
  };

  const steps = [
    { number: 1, label: "Review Booking" },
    { number: 2, label: "Your Details" },
    { number: 3, label: "Payment" },
  ];

  const stepLabels = { 1: "Review Booking", 2: "Your Information", 3: "Choose Payment Method" };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header with progress */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Complete Your Booking</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, idx) => (
              <React.Fragment key={s.number}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step >= s.number ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full transition-all ${step > s.number ? "bg-amber-500" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between text-xs text-slate-500 px-0">
            {steps.map(s => (
              <span key={s.number} className={step === s.number ? "text-amber-600 font-semibold" : ""}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* Tips Banner */}
        {showTips && BOOKING_TIPS[step] && (
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Helpful Tips</span>
              </div>
              <button onClick={() => setShowTips(false)} className="text-blue-400 hover:text-blue-600 text-xs shrink-0">✕</button>
            </div>
            <ul className="space-y-1 mt-1">
              {BOOKING_TIPS[step].map((tip, i) => (
                <li key={i} className="text-xs text-blue-700">{tip}</li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-blue-200 flex items-center gap-4 text-xs text-blue-600">
              <a href="tel:+639154401150" className="flex items-center gap-1 hover:underline">
                <Phone className="w-3 h-3" /> Need help? Call us
              </a>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Available 24/7
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step > 1 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step > 1 ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[350px]"
            >
              <h3 className="text-xl font-semibold mb-4 text-slate-900">{stepLabels[step]}</h3>

              {step === 1 && <SummaryComponent bookingData={bookingData} />}

              {step === 2 && (
                <CustomerFormComponent
                  bookingType={bookingType}
                  onDataChange={setCustomerInfo}
                />
              )}

              {step === 3 && (
                <PaymentComponent
                  bookingType={bookingType}
                  bookingData={bookingData}
                  customerInfo={customerInfo}
                  isProcessing={isProcessing}
                  onPayment={handlePayment}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust badge strip */}
        <div className="mx-6 mb-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Secure & Encrypted</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Instant Confirmation</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-amber-500" /> 24/7 Support</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> Free Cancellation*</span>
        </div>

        {/* Footer with navigation */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={step === 1 || isProcessing}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 3 && (
            <Button
              onClick={() => { setShowTips(true); handleNextStep(); }}
              disabled={isProcessing}
              className="gap-2 bg-amber-500 hover:bg-amber-600"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {step === 3 && isProcessing && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing payment...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
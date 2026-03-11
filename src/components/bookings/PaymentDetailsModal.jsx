import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Receipt, Copy, CheckCircle, CreditCard, Banknote, Wallet, Building2, Smartphone, ExternalLink, AlertCircle, Clock, ShieldCheck } from "lucide-react";

const paymentMethodIcons = {
  stripe: { icon: CreditCard, label: "Stripe (Card)", color: "text-indigo-600 bg-indigo-50" },
  paymongo: { icon: Smartphone, label: "PayMongo", color: "text-blue-600 bg-blue-50" },
  bank_transfer: { icon: Building2, label: "Bank Transfer", color: "text-emerald-600 bg-emerald-50" },
  cash: { icon: Banknote, label: "Cash", color: "text-green-600 bg-green-50" },
  wallet: { icon: Wallet, label: "GC Wallet", color: "text-amber-600 bg-amber-50" },
  gcash: { icon: Smartphone, label: "GCash", color: "text-blue-600 bg-blue-50" },
};

const statusColors = {
  completed: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-slate-100 text-slate-800 border-slate-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} className="ml-1 text-slate-400 hover:text-slate-600 transition-colors">
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function PaymentDetailsModal({ booking, bookingType, isOpen, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessedAt] = useState(new Date());

  useEffect(() => {
    if (isOpen && booking?.id) {
      setLoading(true);
      base44.entities.Payment.filter({ booking_id: booking.id })
        .then(results => setPayment(results[0] || null))
        .finally(() => setLoading(false));
    }
    if (!isOpen) setPayment(null);
  }, [isOpen, booking]);

  const methodInfo = payment ? (paymentMethodIcons[payment.payment_method] || { icon: CreditCard, label: payment.payment_method?.replace(/_/g, ' ')?.toUpperCase(), color: "text-slate-600 bg-slate-50" }) : null;
  const MethodIcon = methodInfo?.icon || CreditCard;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Payment Record & Proof
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Accessed: {accessedAt.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm">Loading payment record...</p>
          </div>
        ) : !payment ? (
          <div className="py-8 flex flex-col items-center gap-3 text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No payment record found</p>
            <p className="text-xs text-slate-400 text-center">
              This booking has no linked payment entry yet.<br />
              Booking ref: <span className="font-mono font-bold text-amber-700">{booking?.booking_ref || booking?.id}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Payment Method — Most prominent */}
            <div className={`rounded-xl p-4 border-2 ${methodInfo?.color?.includes('indigo') ? 'border-indigo-200 bg-indigo-50' : methodInfo?.color?.includes('blue') ? 'border-blue-200 bg-blue-50' : methodInfo?.color?.includes('emerald') ? 'border-emerald-200 bg-emerald-50' : methodInfo?.color?.includes('green') ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Payment Method Used</div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${methodInfo?.color}`}>
                  <MethodIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{methodInfo?.label}</div>
                  <Badge className={`${statusColors[payment.status] || statusColors.pending} border text-xs mt-1`}>
                    {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {payment.currency || "PHP"} {payment.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              {payment.status === "partial" && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Paid</div>
                    <div className="font-semibold text-yellow-700">
                      {payment.currency} {payment.partial_amount_paid?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Remaining</div>
                    <div className="font-semibold text-orange-700">
                      {payment.currency} {payment.remaining_amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Markup / Profit */}
            {payment.cost_basis && (
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <label className="text-xs font-semibold text-slate-500 uppercase">Breakdown</label>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost Basis:</span>
                    <span className="font-medium">{payment.currency} {payment.cost_basis?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Markup:</span>
                    <span className="font-medium text-green-600">{payment.currency} {payment.markup_amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {payment.markup_percentage && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Markup %:</span>
                      <span className="font-medium text-green-600">{payment.markup_percentage.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Evidence */}
            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-slate-600" />
                <label className="text-xs font-semibold text-slate-500 uppercase">Transaction Evidence</label>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Booking ID:</span>
                  <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
                    {booking?.booking_ref || booking?.id}
                    <CopyButton text={booking?.booking_ref || booking?.id} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Record ID:</span>
                  <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
                    {payment.id}
                    <CopyButton text={payment.id} />
                  </span>
                </div>
                {payment.payment_provider_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Provider Txn ID:</span>
                    <span className="font-mono text-xs flex items-center gap-1 text-slate-700 break-all text-right max-w-[55%]">
                      {payment.payment_provider_id}
                      <CopyButton text={payment.payment_provider_id} />
                    </span>
                  </div>
                )}
                {payment.stripe_session_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Stripe Session:</span>
                    <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
                      {payment.stripe_session_id.slice(-12)}...
                      <CopyButton text={payment.stripe_session_id} />
                    </span>
                  </div>
                )}
                {payment.stripe_payment_intent && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Intent:</span>
                    <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
                      {payment.stripe_payment_intent.slice(-12)}...
                      <CopyButton text={payment.stripe_payment_intent} />
                    </span>
                  </div>
                )}
                {payment.payment_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Date:</span>
                    <span className="font-medium text-xs">
                      {new Date(payment.payment_date).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
                    </span>
                  </div>
                )}
                {payment.user_email && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Customer Email:</span>
                    <span className="font-medium text-xs flex items-center gap-1">
                      {payment.user_email}
                      <CopyButton text={payment.user_email} />
                    </span>
                  </div>
                )}
              </div>
              {payment.receipt_url && (
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Official Receipt
                </a>
              )}
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Banknote, Receipt } from "lucide-react";

export default function PaymentDetailsModal({ booking, bookingType, isOpen, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking?.id) {
      setLoading(true);
      base44.entities.Payment.filter({ booking_id: booking.id, booking_type: bookingType })
        .then(results => setPayment(results[0] || null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, booking, bookingType]);

  if (!isOpen || !payment) return null;

  const statusColors = {
    completed: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <div className="mt-2">
              <Badge className={statusColors[payment.status] || "bg-slate-100"}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Customer Payment */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-semibold text-slate-500 uppercase">Customer Payment</label>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Amount Paid</div>
              <div className="text-2xl font-bold text-blue-600">
                {payment.currency} {payment.amount?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              {payment.payment_method && (
                <div className="text-xs text-slate-500 mt-2">
                  Method: {payment.payment_method.replace('_', ' ').toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Partial Payment Info */}
          {payment.status === "partial" && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Paid</div>
                  <div className="font-semibold text-yellow-700">
                    {payment.currency} {payment.partial_amount_paid?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Remaining</div>
                  <div className="font-semibold text-orange-700">
                    {payment.currency} {payment.remaining_amount?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Markup Breakdown */}
          {payment.cost_basis && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <label className="text-xs font-semibold text-slate-500 uppercase">Your Profit</label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Cost Basis:</span>
                  <span className="font-medium">{payment.currency} {payment.cost_basis?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Your Markup:</span>
                  <span className="font-medium text-green-600">{payment.currency} {payment.markup_amount?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                {payment.markup_percentage && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Markup %:</span>
                    <span className="font-medium text-green-600">{payment.markup_percentage.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-slate-600" />
              <label className="text-xs font-semibold text-slate-500 uppercase">Transaction Details</label>
            </div>
            <div className="space-y-2 text-sm">
              {payment.payment_date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</span>
                </div>
              )}
              {payment.payment_provider_id && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{payment.payment_provider_id.slice(-8)}</span>
                </div>
              )}
              {payment.receipt_url && (
                <div>
                  <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                    View Receipt →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
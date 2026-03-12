import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function XenditPayment({ amount, currency = 'PHP', description, bookingRef, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    // Block if running in iframe
    if (window.self !== window.top) {
      alert('Payment only works from the published app. Please open the app directly.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await base44.functions.invoke('createXenditCheckout', {
        amount,
        currency,
        description,
        booking_ref: bookingRef,
        success_url: `${window.location.origin}/PaymentSuccess`,
        failure_url: `${window.location.origin}/PaymentCancelled`,
      });

      if (res.data?.invoice_url) {
        if (onSuccess) onSuccess(res.data);
        window.location.href = res.data.invoice_url;
      } else {
        throw new Error(res.data?.error || 'Failed to create payment link');
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating payment link...</>
        ) : (
          <><ExternalLink className="w-4 h-4 mr-2" /> Pay with Xendit — {currency} {Number(amount).toLocaleString()}</>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        You'll be redirected to Xendit's secure payment page. Accepts GCash, Maya, Cards, OTC & more.
      </p>
    </div>
  );
}
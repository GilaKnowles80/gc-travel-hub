import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CreditCard, Wallet, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/pages/utils';
import GCashQRModal from '@/components/payment/GCashQRModal';
import PayMongoQRModal from '@/components/payment/PayMongoQRModal';

const PAYMENT_METHODS = [
  {
    id: 'stripe',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, AMEX – Secure Stripe payment',
    icon: '💳',
    currency: 'USD',
    tag: 'International'
  },
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay with your GCash e-wallet',
    icon: '📱',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'gcash_qr',
    name: 'GCash QR (Direct)',
    description: 'Scan QR code — direct deposit to GC E-wallet',
    icon: '📲',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'paymongo_qr',
    name: 'QR Ph (PayMongo)',
    description: 'Scan QR Ph — works with GCash, Maya, BDO, BPI & all banks. No fees!',
    icon: '🟦',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'paymaya',
    name: 'Maya (PayMaya)',
    description: 'Pay with your Maya e-wallet',
    icon: '💚',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'grab_pay',
    name: 'GrabPay',
    description: 'Pay with GrabPay wallet',
    icon: '🟢',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'card_ph',
    name: 'Credit / Debit Card (PHP)',
    description: 'Local card payment via PayMongo',
    icon: '🏦',
    currency: 'PHP',
    tag: 'Philippines'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay securely with your PayPal account',
    icon: '🅿️',
    currency: 'USD',
    tag: 'International'
  },
];

export default function UnifiedPaymentButton({
  bookingType,
  bookingId,
  amount,        // in USD by default
  amountPhp,     // PHP equivalent (optional, falls back to amount * 56)
  customerEmail,
  disabled = false,
  className = '',
  label = 'Pay Now',
  onSuccess
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gcashQROpen, setGcashQROpen] = useState(false);
  const [paymongoQROpen, setPaymongoQROpen] = useState(false);
  // PayPal flow state
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  const phpAmount = amountPhp || Math.round(amount * 56);

  const handleOpen = () => {
    if (window.self !== window.top) {
      setError('Checkout is only available from the published app.');
      return;
    }
    setError(null);
    setSelected(null);
    setOpen(true);
  };

  const handlePay = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      // ── STRIPE ────────────────────────────────────────────────────────────
      if (selected === 'stripe') {
        const { data } = await base44.functions.invoke('createBookingCheckout', {
          bookingType,
          bookingId,
          customerEmail,
          amount,
          currency: 'usd',
          successUrl: `${window.location.origin}${createPageUrl('PaymentSuccess')}?booking_id=${bookingId}&booking_type=${bookingType}`,
          cancelUrl: `${window.location.origin}${createPageUrl('PaymentCancelled')}?booking_id=${bookingId}`
        });
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        return;
      }

      // ── GCASH QR DIRECT ──────────────────────────────────────────────────
      if (selected === 'gcash_qr') {
        setOpen(false);
        setGcashQROpen(true);
        setLoading(false);
        return;
      }

      // ── PAYMONGO QR PH (STATIC) ───────────────────────────────────────────
      if (selected === 'paymongo_qr') {
        setOpen(false);
        setPaymongoQROpen(true);
        setLoading(false);
        return;
      }

      // ── PAYMONGO local methods ────────────────────────────────────────────
      if (['gcash', 'paymaya', 'grab_pay', 'card_ph'].includes(selected)) {
        const { data } = await base44.functions.invoke('createPayMongoCheckout', {
          bookingType,
          bookingId,
          amount: phpAmount,
          description: `GC Travel ${bookingType} Booking`,
          successUrl: `${window.location.origin}${createPageUrl('PaymentSuccess')}?booking_id=${bookingId}&booking_type=${bookingType}`,
          cancelUrl: `${window.location.origin}${createPageUrl('PaymentCancelled')}?booking_id=${bookingId}`
        });
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        return;
      }

      // ── PAYPAL ────────────────────────────────────────────────────────────
      if (selected === 'paypal') {
        const { data } = await base44.functions.invoke('createPayPalOrder', {
          amount,
          currency: 'USD',
          bookingData: { bookingType, bookingId }
        });
        if (data.id) {
          // Redirect to PayPal approval
          const approvalUrl = `https://www.paypal.com/checkoutnow?token=${data.id}`;
          // Store in session for capture on return
          sessionStorage.setItem('paypal_order', JSON.stringify({ orderId: data.id, bookingType, bookingId, amount }));
          window.location.href = approvalUrl;
        }
        return;
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={disabled}
        className={`bg-amber-500 hover:bg-amber-600 text-white gap-2 ${className}`}
      >
        <CreditCard className="w-4 h-4" />
        {label}
      </Button>

      {error && !open && (
        <Alert className="mt-2 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-500" />
              Select Payment Method
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            {/* USD section */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">International</p>
            {PAYMENT_METHODS.filter(m => m.currency === 'USD').map(method => (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selected === method.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{method.name}</p>
                  <p className="text-xs text-slate-500">{method.description}</p>
                </div>
                <p className="text-xs font-bold text-slate-700">${amount.toFixed(2)}</p>
              </button>
            ))}

            {/* PHP section */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-1">Philippines (PHP)</p>
            {PAYMENT_METHODS.filter(m => m.currency === 'PHP').map(method => (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selected === method.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{method.name}</p>
                  <p className="text-xs text-slate-500">{method.description}</p>
                </div>
                <p className="text-xs font-bold text-slate-700">₱{phpAmount.toLocaleString()}</p>
              </button>
            ))}
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200 mt-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-slate-900">
                {selected && PAYMENT_METHODS.find(m => m.id === selected)?.currency === 'PHP'
                  ? `₱${phpAmount.toLocaleString()}`
                  : `$${amount.toFixed(2)}`}
              </p>
            </div>
            <Button
              onClick={handlePay}
              disabled={!selected || loading}
              className="bg-amber-500 hover:bg-amber-600 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-1">
            🔒 Secured by Stripe · PayMongo · PayPal
          </p>
        </DialogContent>
      </Dialog>
      <GCashQRModal
        open={gcashQROpen}
        onClose={() => setGcashQROpen(false)}
        amount={phpAmount}
        bookingType={bookingType}
        bookingId={bookingId}
      />
    </>
  );
}
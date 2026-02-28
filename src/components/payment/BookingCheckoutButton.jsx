import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/pages/utils';

export default function BookingCheckoutButton({ 
  bookingType, 
  bookingId, 
  amount, 
  customerEmail,
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!bookingType || !bookingId || !amount || !customerEmail) {
      setError('Missing required booking information');
      return;
    }

    // Check if running in iframe (test mode)
    if (window.self !== window.top) {
      setError('Checkout is only available from the published app. Please open in full browser.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('createBookingCheckout', {
        bookingType,
        bookingId,
        customerEmail,
        amount,
        successUrl: `${window.location.origin}${createPageUrl('PaymentSuccess')}?booking_id=${bookingId}&booking_type=${bookingType}`,
        cancelUrl: `${window.location.origin}${createPageUrl('PaymentCancelled')}?booking_id=${bookingId}`
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`bg-blue-600 hover:bg-blue-700 ${className}`}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <CreditCard className="w-4 h-4 mr-2" />
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>

      {error && (
        <Alert className="mt-3 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeCheckout({ bookingType, bookingId, amount, currency = 'USD', onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const functionName = bookingType === 'flight' ? 'createFlightCheckout' :
                          bookingType === 'hotel' ? 'createHotelCheckout' :
                          bookingType === 'train' ? 'createTrainCheckout' :
                          bookingType === 'ferry' ? 'createFerryCheckout' :
                          bookingType === 'cruise' ? 'createCruiseCheckout' :
                          bookingType === 'tour' ? 'createTourCheckout' :
                          'createStripeCheckout';
                          
      const { data } = await base44.functions.invoke(functionName, {
        bookingType,
        bookingId,
        amount,
        currency
      });

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Pay with Credit/Debit Card</h3>
            <p className="text-sm text-slate-600 mb-4">
              Secure payment powered by Stripe. We accept Visa, Mastercard, American Express, and more.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Amount to Pay:</span>
                <span className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: currency 
                  }).format(amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-green-600" />
                <span>PCI Compliant</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay Now with Stripe
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-500 mt-3">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackPurchase } from '@/components/analytics/GoogleAdsTracking';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    const sessionId = urlParams.get('session_id');
    
    if (paymentId) {
      base44.entities.Payment.filter({ id: paymentId })
        .then(payments => {
          if (payments.length > 0) {
            const paymentData = payments[0];
            setPayment(paymentData);
            
            // Track Google Ads conversion
            trackPurchase(
              paymentData.amount,
              paymentData.id,
              paymentData.currency || 'PHP'
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (sessionId) {
      // Try to find payment by session ID
      base44.entities.Payment.filter({ stripe_session_id: sessionId })
        .then(payments => {
          if (payments.length > 0) {
            const paymentData = payments[0];
            setPayment(paymentData);
            
            // Track Google Ads conversion
            trackPurchase(
              paymentData.amount,
              paymentData.id,
              paymentData.currency || 'PHP'
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
            <p className="text-lg text-slate-600 mb-8">
              Your payment has been processed successfully. Thank you for booking with GC Travel & Tours!
            </p>

            {payment && (
              <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-500" />
                  Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-slate-900">{payment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: payment.currency || 'USD'
                      }).format(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Booking Type:</span>
                    <span className="font-medium text-slate-900 capitalize">{payment.booking_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Method:</span>
                    <span className="font-medium text-slate-900">Stripe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                📧 A confirmation email with your booking details has been sent to your email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(createPageUrl('MyBookings'))}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                size="lg"
              >
                <Receipt className="w-5 h-5 mr-2" />
                View My Bookings
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('Home'))}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
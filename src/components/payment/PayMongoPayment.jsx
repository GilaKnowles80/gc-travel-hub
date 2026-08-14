import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Building2, Wallet, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePayMongoConfig } from "@/hooks/usePayMongoConfig";

export default function PayMongoPayment({ amount, description, bookingId, bookingType, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const { data: paymongoConfig } = usePayMongoConfig();

  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: Wallet,
      color: 'bg-blue-600',
      description: 'Pay with GCash QR Code'
    },
    {
      id: 'paymaya',
      name: 'PayMaya',
      icon: Wallet,
      color: 'bg-green-600',
      description: 'Pay with PayMaya QR Code'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building2,
      color: 'bg-purple-600',
      description: 'InstaPay / PESONet'
    },
    {
      id: 'grabpay',
      name: 'GrabPay',
      icon: CreditCard,
      color: 'bg-emerald-600',
      description: 'Pay with GrabPay'
    }
  ];

  const handlePayment = async (method) => {
    setLoading(true);
    setSelectedMethod(method);

    try {
      const response = await base44.functions.invoke('createPayMongoPayment', {
        amount,
        description,
        bookingId,
        bookingType,
        paymentMethod: method
      });

      if (response.data.success) {
        const { payment } = response.data;

        if (payment.checkout_url) {
          // For QR code payments
          setQrCodeUrl(payment.checkout_url);
          
          // Open in new window for scanning
          window.open(payment.checkout_url, '_blank', 'width=600,height=700');
          
          toast.success('Payment QR code generated! Scan to complete payment.');
          
          // Poll for payment status
          const pollInterval = setInterval(async () => {
            // You can implement a status check here
            // For now, assume success after user confirms
          }, 3000);

          setTimeout(() => clearInterval(pollInterval), 300000); // 5 minutes timeout
        } else {
          toast.error('Failed to generate payment');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePayment(method.id)}
                disabled={loading}
                className={`${method.color} text-white p-6 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <method.icon className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="font-bold text-lg">{method.name}</h3>
                    <p className="text-xs opacity-90">{method.description}</p>
                  </div>
                </div>
                {loading && selectedMethod === method.id && (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-2">Payment Amount</h4>
            <p className="text-3xl font-bold text-amber-600">₱{amount.toLocaleString()}</p>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          </div>

          <div className="mt-4 text-sm text-slate-600 space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Secure payment powered by PayMongo{paymongoConfig ? ` · ${paymongoConfig.mode === 'live' ? 'Live' : 'Test'} mode` : ''}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Instant confirmation upon payment</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>All transactions are encrypted and secure</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">QR Code Generated!</h3>
            <p className="text-slate-700 mb-4">
              A new window has opened with your payment QR code. Scan it with your e-wallet app to complete the payment.
            </p>
            <a 
              href={qrCodeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-blue-600 hover:bg-blue-700">
                Open QR Code Again
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
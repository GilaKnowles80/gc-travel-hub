import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function PayPalPayment({ amount, currency = "USD", onSuccess, onError, bookingData }) {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientId, setClientId] = useState(null);

  React.useEffect(() => {
    base44.functions.invoke("getPayPalConfig")
      .then((res) => setClientId(res.data?.clientId))
      .catch(() => setClientId(null));
  }, []);

  const initialOptions = {
    clientId: clientId || "sb",
    currency: currency,
    intent: "capture",
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
            alt="PayPal" 
            className="h-6"
          />
          Pay with PayPal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        {processing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Processing payment...</span>
          </div>
        )}

        {!clientId && !processing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-600">Loading PayPal...</span>
          </div>
        )}

        {clientId && (
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
            disabled={processing}
            createOrder={async (data, actions) => {
              try {
                setProcessing(true);
                setError(null);
                
                const response = await fetch("/api/functions/createPayPalOrder", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    bookingData: bookingData,
                  }),
                });

                const order = await response.json();
                
                if (!response.ok) {
                  throw new Error(order.error || "Failed to create PayPal order");
                }

                return order.id;
              } catch (err) {
                setError(err.message);
                setProcessing(false);
                throw err;
              }
            }}
            onApprove={async (data, actions) => {
              try {
                const response = await fetch("/api/functions/capturePayPalOrder", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    bookingData: bookingData,
                  }),
                });

                const details = await response.json();

                if (!response.ok) {
                  throw new Error(details.error || "Failed to capture payment");
                }

                toast.success("Payment successful!");
                setProcessing(false);
                
                if (onSuccess) {
                  onSuccess(details);
                }
              } catch (err) {
                setError(err.message);
                setProcessing(false);
                if (onError) {
                  onError(err);
                }
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setError("PayPal payment failed. Please try again.");
              setProcessing(false);
              if (onError) {
                onError(err);
              }
            }}
            onCancel={() => {
              toast.info("Payment cancelled");
              setProcessing(false);
            }}
          />
        </PayPalScriptProvider>
        )}

        <div className="mt-4 text-xs text-slate-500 space-y-1">
          <p>• Secure payment powered by PayPal</p>
          <p>• Pay with your PayPal balance, bank, or card</p>
          <p>• Buyer protection included</p>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";
import PayMongoPayment from "./PayMongoPayment";

export default function PaymentMethodSelector({ 
  amount, 
  currency = "PHP", 
  bookingData,
  onSuccess,
  onError 
}) {
  const [selectedMethod, setSelectedMethod] = useState("paymongo");

  const paymentMethods = [
    {
      id: "paymongo",
      name: "PayMongo",
      icon: Smartphone,
      description: "GCash, Maya, Credit/Debit Cards",
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => method.available && setSelectedMethod(method.id)}
                disabled={!method.available}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMethod === method.id
                    ? "border-amber-500 bg-amber-50"
                    : method.available
                    ? "border-slate-200 hover:border-slate-300"
                    : "border-slate-100 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-3">
                  <method.icon className={`w-5 h-5 mt-0.5 ${
                    selectedMethod === method.id ? "text-amber-600" : "text-slate-600"
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{method.name}</p>
                    <p className="text-sm text-slate-600">{method.description}</p>
                    {!method.available && (
                      <p className="text-xs text-red-600 mt-1">Not available</p>
                    )}
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Forms */}
      <div>
        {selectedMethod === "paymongo" && (
          <PayMongoPayment
            amount={amount}
            bookingData={bookingData}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}
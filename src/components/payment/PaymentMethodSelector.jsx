import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Building2, Globe } from "lucide-react";
import StripeCheckout from "./StripeCheckout";
import PayMongoPayment from "./PayMongoPayment";
import PayPalPayment from "./PayPalPayment";
import BankTransferPayment from "./BankTransferPayment";
import XenditPayment from "./XenditPayment";

export default function PaymentMethodSelector({ 
  amount, 
  currency = "PHP", 
  bookingData,
  bankAccount,
  onSuccess,
  onError 
}) {
  const [selectedMethod, setSelectedMethod] = useState("stripe");

  const paymentMethods = [
    {
      id: "stripe",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, Amex",
      available: true,
    },
    {
      id: "paymongo",
      name: "E-Wallets",
      icon: Smartphone,
      description: "GCash, PayMaya, GrabPay",
      available: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: Globe,
      description: "PayPal balance or card",
      available: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: Building2,
      description: "Philippine banks",
      available: !!bankAccount,
    },
  ];

  const convertToUSD = (phpAmount) => {
    // Convert PHP to USD (approximate rate: 1 USD = 56 PHP)
    return (phpAmount / 56).toFixed(2);
  };

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
        {selectedMethod === "stripe" && (
          <StripeCheckout
            amount={amount}
            bookingData={bookingData}
            onSuccess={onSuccess}
          />
        )}

        {selectedMethod === "paymongo" && (
          <PayMongoPayment
            amount={amount}
            bookingData={bookingData}
            onSuccess={onSuccess}
          />
        )}

        {selectedMethod === "paypal" && (
          <PayPalPayment
            amount={parseFloat(convertToUSD(amount))}
            currency="USD"
            bookingData={bookingData}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}

        {selectedMethod === "bank" && bankAccount && (
          <BankTransferPayment
            bankAccount={bankAccount}
            bookingReference={bookingData?.bookingId || "N/A"}
          />
        )}
      </div>
    </div>
  );
}
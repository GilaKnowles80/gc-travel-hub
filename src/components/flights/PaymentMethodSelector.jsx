import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Wallet, QrCode, DollarSign } from "lucide-react";

const PaymentMethodSelector = ({ onSelect, selectedMethod }) => {
  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      provider: "Direct",
      icon: Smartphone,
      color: "bg-amber-600",
      description: "InstaPay / PESONet",
      recommended: true
    },
    {
      id: "gcash_qr",
      name: "GCash QR",
      provider: "PayMongo",
      icon: QrCode,
      color: "bg-blue-600",
      description: "Scan QR code instantly"
    },
    {
      id: "paymaya_qr",
      name: "PayMaya QR",
      provider: "PayMongo",
      icon: QrCode,
      color: "bg-green-600",
      description: "Scan QR code instantly"
    },
    {
      id: "grabpay",
      name: "GrabPay",
      provider: "PayMongo",
      icon: Wallet,
      color: "bg-emerald-600",
      description: "Pay with GrabPay"
    },
    {
      id: "dragonpay",
      name: "DragonPay",
      provider: "Multiple Banks",
      icon: Smartphone,
      color: "bg-orange-600",
      description: "Online banking & OTC"
    },
    {
      id: "stripe_card",
      name: "Credit/Debit Card",
      provider: "Stripe",
      icon: CreditCard,
      color: "bg-indigo-600",
      description: "Visa, Mastercard, Amex"
    },
    {
      id: "stripe_cashapp",
      name: "CashApp",
      provider: "Stripe",
      icon: DollarSign,
      color: "bg-purple-600",
      description: "US customers only"
    },
    {
      id: "paypal",
      name: "PayPal",
      provider: "Stripe",
      icon: Wallet,
      color: "bg-blue-500",
      description: "PayPal balance or linked card"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 mb-3 text-lg">Choose Payment Method</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`${method.color} text-white p-4 rounded-xl transition-all transform hover:scale-105 relative ${
                isSelected ? 'ring-4 ring-amber-400 ring-offset-2' : ''
              }`}
            >
              {method.recommended && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  Recommended
                </div>
              )}
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-bold text-sm mb-1">{method.name}</h4>
              <p className="text-xs opacity-90 mb-1">{method.provider}</p>
              <p className="text-xs opacity-75">{method.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-semibold mb-1">🏆 Recommended: Bank Transfer</p>
            <p>Secure direct bank transfer via InstaPay or PESONet. No extra fees, just transfer to our account and we'll confirm your booking within 24 hours.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <p className="flex items-start gap-2">
          <span className="font-semibold">🔒 Secure:</span>
          <span>All transactions encrypted via Stripe & PayMongo (BSP-registered)</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-semibold">💳 No Hidden Fees:</span>
          <span>Final price shown is what you pay</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-semibold">📧 Instant Confirmation:</span>
          <span>Booking confirmation sent immediately</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
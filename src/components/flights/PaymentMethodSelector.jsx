import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, Smartphone, Wallet } from "lucide-react";

const PaymentMethodSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const paymentMethods = [
    {
      category: "Cards",
      icon: CreditCard,
      methods: ["Credit Card", "Debit Card"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      category: "E-Wallets (Philippines)",
      icon: Smartphone,
      methods: ["GCash", "Maya", "PayMongo"],
      color: "bg-green-50 border-green-200"
    },
    {
      category: "International E-Wallets",
      icon: Wallet,
      methods: ["PayPal", "Alipay", "WeChat Pay"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      category: "Other Payment Options",
      icon: Wallet,
      methods: ["DragonPay", "Over-the-Counter Banking"],
      color: "bg-amber-50 border-amber-200"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Available Payment Methods
        </h3>
        <p className="text-sm text-slate-600">
          Choose from various payment options on the next page to complete your booking securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((category) => (
          <Card 
            key={category.category} 
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.category 
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : category.color
            }`}
            onClick={() => setSelectedCategory(category.category)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg">
                <category.icon className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm mb-2">
                  {category.category}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {category.methods.map((method) => (
                    <span
                      key={method}
                      className="text-xs bg-white px-2 py-1 rounded-md text-slate-600 font-medium"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <p className="flex items-start gap-2">
          <span className="font-semibold">🔒 Secure Payment:</span>
          <span>All transactions are encrypted and processed through Stripe's secure payment gateway.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-semibold">💳 No Hidden Fees:</span>
          <span>The total price shown is the final amount you'll pay.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="font-semibold">📧 Instant Confirmation:</span>
          <span>You'll receive a booking confirmation via email immediately after payment.</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
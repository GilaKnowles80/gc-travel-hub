import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, Percent, AlertCircle } from "lucide-react";

export default function PaymentSplitSummary({ totalAmount, supplier = "Third-party" }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Only show split payment details to admins
  if (!user?.role === 'admin') {
    return null;
  }

  const merchantAmount = totalAmount * 0.75;
  const markupAmount = totalAmount * 0.20;
  const taxFeesAmount = totalAmount * 0.05;
  const userTotal = markupAmount + taxFeesAmount;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Percent className="w-4 h-4 text-blue-600" />
          Payment Breakdown
        </h3>
        <p className="text-xs text-slate-500 mt-1">Total Amount: {totalAmount.toLocaleString()} PHP</p>
      </div>

      <div className="space-y-3">
        {/* Merchant Payment */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
          <div>
            <p className="text-sm font-medium text-slate-700">{supplier}</p>
            <p className="text-xs text-slate-500">Merchant Payment (75%)</p>
          </div>
          <p className="text-lg font-bold text-blue-600">{merchantAmount.toLocaleString()}</p>
        </div>

        {/* Markup */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
          <div>
            <p className="text-sm font-medium text-slate-700">Your Markup</p>
            <p className="text-xs text-slate-500">Commission (20%)</p>
          </div>
          <p className="text-lg font-bold text-green-600">+{markupAmount.toLocaleString()}</p>
        </div>

        {/* Taxes & Fees */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
          <div>
            <p className="text-sm font-medium text-slate-700">Taxes & Fees</p>
            <p className="text-xs text-slate-500">Processing (5%)</p>
          </div>
          <p className="text-lg font-bold text-amber-600">+{taxFeesAmount.toLocaleString()}</p>
        </div>

        {/* Your Total */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300 mt-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Your Earnings
            </p>
            <p className="text-xs text-slate-600">Deposited to Wallet</p>
          </div>
          <p className="text-xl font-bold text-green-700">{userTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          Your earnings ({(userTotal / totalAmount * 100).toFixed(0)}%) are automatically deposited to your wallet and can be withdrawn to your GCash account anytime.
        </p>
      </div>
    </Card>
  );
}
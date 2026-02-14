import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BankTransferPayment({ bankAccount, bookingReference }) {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!bankAccount) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No bank account configured. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          Bank Transfer Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Transfer to the account below and keep your proof of payment</p>
              <p className="mt-1">Use your booking reference as payment reference</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Bank Name</p>
              <p className="font-semibold text-slate-900">{bankAccount.bank_name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankAccount.bank_name, "Bank name")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Account Name</p>
              <p className="font-semibold text-slate-900">{bankAccount.account_name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankAccount.account_name, "Account name")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Account Number</p>
              <p className="font-semibold text-slate-900 font-mono">{bankAccount.account_number}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankAccount.account_number, "Account number")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Account Type</p>
              <p className="font-semibold text-slate-900 capitalize">{bankAccount.account_type}</p>
            </div>
          </div>

          {bankAccount.branch && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Branch</p>
                <p className="font-semibold text-slate-900">{bankAccount.branch}</p>
              </div>
            </div>
          )}

          {bankAccount.swift_code && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">SWIFT Code</p>
                <p className="font-semibold text-slate-900 font-mono">{bankAccount.swift_code}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(bankAccount.swift_code, "SWIFT code")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <p className="text-xs text-amber-700">Payment Reference</p>
              <p className="font-bold text-amber-900 font-mono">{bookingReference}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bookingReference, "Reference")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {bankAccount.payment_instructions && (
          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-2">Additional Instructions:</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{bankAccount.payment_instructions}</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-semibold mb-2">Important:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Transfer the exact amount shown in your booking summary</li>
            <li>Use the payment reference above when making the transfer</li>
            <li>Your booking will be confirmed once we verify your payment</li>
            <li>Keep your transfer receipt for your records</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
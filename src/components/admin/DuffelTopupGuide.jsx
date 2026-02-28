import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DuffelTopupGuide = () => {
  const bankDetails = {
    beneficiary: 'Duffel Travel US Incorporated',
    accountNumber: '40048674',
    abaRouting: '021000089',
    bankAddress: 'Citibank N.A. New York, 388 Greenwich Street, New York, NY 10013, USA',
    swift: 'CITIUS33',
    paymentReference: 'GCTRILDS4R',
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-5 h-5" />
          Duffel Account Top-up Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-white border-amber-300">
          <AlertDescription className="text-amber-900">
            To top up your Duffel balance, send a bank transfer using the details below. 
            The reference must match exactly for processing.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Bank Details</h4>
            <div className="grid gap-3">
              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <div className="text-xs text-slate-500 uppercase font-semibold">Beneficiary</div>
                <div className="text-sm font-mono text-slate-900 mt-1">{bankDetails.beneficiary}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Account Number</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-mono text-slate-900">{bankDetails.accountNumber}</div>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="p-1 hover:bg-amber-100 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-xs text-slate-500 uppercase font-semibold">ABA Routing</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-mono text-slate-900">{bankDetails.abaRouting}</div>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.abaRouting)}
                      className="p-1 hover:bg-amber-100 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <div className="text-xs text-slate-500 uppercase font-semibold">Bank Address</div>
                <div className="text-sm text-slate-900 mt-1">{bankDetails.bankAddress}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-xs text-slate-500 uppercase font-semibold">SWIFT/BIC</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-mono text-slate-900">{bankDetails.swift}</div>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.swift)}
                      className="p-1 hover:bg-amber-100 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Payment Reference</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-mono font-bold text-amber-700">{bankDetails.paymentReference}</div>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.paymentReference)}
                      className="p-1 hover:bg-amber-100 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-200">
            <p className="text-sm text-slate-700 mb-3">
              After sending the transfer:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
              <li>Email <span className="font-mono bg-white px-2 py-1 rounded border border-amber-200">accountsreceivable@duffel.com</span></li>
              <li>Provide your payment reference and amount transferred</li>
              <li>This helps Duffel process your top-up quickly</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DuffelTopupGuide;
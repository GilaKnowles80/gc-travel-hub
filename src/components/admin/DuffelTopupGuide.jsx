import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, AlertCircle, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const DuffelTopupGuide = () => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['duffel-payment-settings'],
    queryFn: async () => {
      const results = await base44.entities.DuffelPaymentSettings.list();
      return results[0] || null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DuffelPaymentSettings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duffel-payment-settings'] });
      setEditing(false);
      toast.success('Bank details saved!');
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const startEdit = () => {
    setForm({
      duffel_beneficiary: settings?.duffel_beneficiary || '',
      duffel_account_number: settings?.duffel_account_number || '',
      duffel_aba_routing: settings?.duffel_aba_routing || '',
      duffel_bank_address: settings?.duffel_bank_address || '',
      duffel_swift: settings?.duffel_swift || '',
      duffel_payment_reference: settings?.duffel_payment_reference || '',
    });
    setEditing(true);
  };

  const bankDetails = {
    beneficiary: settings?.duffel_beneficiary || '—',
    accountNumber: settings?.duffel_account_number || '—',
    abaRouting: settings?.duffel_aba_routing || '—',
    bankAddress: settings?.duffel_bank_address || '—',
    swift: settings?.duffel_swift || '—',
    paymentReference: settings?.duffel_payment_reference || '—',
  };

  if (isLoading) return <div className="text-sm text-slate-500 p-4">Loading bank details...</div>;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-5 h-5" />
            Duffel Account Top-up Instructions
          </CardTitle>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={startEdit} className="gap-1">
              <Pencil className="w-3 h-3" /> Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="gap-1 bg-green-600 hover:bg-green-700">
                <Save className="w-3 h-3" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1">
                <X className="w-3 h-3" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-white border-amber-300">
          <AlertDescription className="text-amber-900">
            To top up your Duffel balance, send a bank transfer using the details below.
            The reference must match exactly for processing.
          </AlertDescription>
        </Alert>

        {editing ? (
          <div className="grid gap-3">
            {[
              { label: 'Beneficiary', key: 'duffel_beneficiary' },
              { label: 'Account Number', key: 'duffel_account_number' },
              { label: 'ABA Routing', key: 'duffel_aba_routing' },
              { label: 'Bank Address', key: 'duffel_bank_address' },
              { label: 'SWIFT/BIC', key: 'duffel_swift' },
              { label: 'Payment Reference', key: 'duffel_payment_reference' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-slate-500 uppercase font-semibold mb-1 block">{label}</label>
                <Input
                  value={form[key] || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="bg-white font-mono text-sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900">Bank Details</h4>
            <div className="grid gap-3">
              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <div className="text-xs text-slate-500 uppercase font-semibold">Beneficiary</div>
                <div className="text-sm font-mono text-slate-900 mt-1">{bankDetails.beneficiary}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: 'Account Number', value: bankDetails.accountNumber },
                  { label: 'ABA Routing', value: bankDetails.abaRouting },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-3 rounded-lg border border-amber-200">
                    <div className="text-xs text-slate-500 uppercase font-semibold">{label}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm font-mono text-slate-900">{value}</div>
                      <button onClick={() => copyToClipboard(value)} className="p-1 hover:bg-amber-100 rounded">
                        <Copy className="w-4 h-4 text-amber-600" />
                      </button>
                    </div>
                  </div>
                ))}
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
                    <button onClick={() => copyToClipboard(bankDetails.swift)} className="p-1 hover:bg-amber-100 rounded">
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Payment Reference</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-mono font-bold text-amber-700">{bankDetails.paymentReference}</div>
                    <button onClick={() => copyToClipboard(bankDetails.paymentReference)} className="p-1 hover:bg-amber-100 rounded">
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200">
              <p className="text-sm text-slate-700 mb-3">After sending the transfer:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                <li>Email <span className="font-mono bg-white px-2 py-1 rounded border border-amber-200">accountsreceivable@duffel.com</span></li>
                <li>Provide your payment reference and amount transferred</li>
                <li>This helps Duffel process your top-up quickly</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DuffelTopupGuide;
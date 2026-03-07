import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Pencil, Trash2, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SUPPLIER_PRESETS = {
  "12go": {
    account_name: "12Go Asia Co., Ltd.",
    account_number: "",
    bank_name: "Kasikornbank (Thailand)",
    bank_code: "kasikornbank",
    swift_code: "KASITHBK",
    aba_routing: "",
    bank_address: "Kasikornbank PCL, 1 Soi Ratburana 27/1, Ratburana Rd., Bangkok 10140, Thailand",
    payment_reference: "",
  },
  duffel: {
    account_name: "Duffel Travel US Incorporated",
    account_number: "40048674",
    bank_name: "Citibank N.A. New York",
    bank_code: "CITIUS33",
    aba_routing: "021000089",
    swift_code: "CITIUS33",
    bank_address: "Citibank N.A. New York, 388 Greenwich Street, New York, NY 10013, USA",
    payment_reference: "GCTRILDS4R",
  },
};

const SUPPLIERS = [
  { value: "biyaheko", label: "Biyaheko" },
  { value: "wanderlinx", label: "Wanderlinx" },
  { value: "tripzynx", label: "Tripzynx" },
  { value: "12go", label: "12Go Asia" },
  { value: "duffel", label: "Duffel" },
  { value: "direct", label: "Direct" },
];

const BANKS = [
  { code: "bdo", name: "BDO Unibank" },
  { code: "bpi", name: "Bank of the Philippine Islands" },
  { code: "ubp", name: "Union Bank of the Philippines" },
  { code: "mb", name: "Metrobank" },
  { code: "rcbc", name: "RCBC" },
  { code: "secb", name: "Security Bank" },
  { code: "pnb", name: "Philippine National Bank" },
  { code: "chinabank", name: "China Bank" },
  { code: "aub", name: "Asia United Bank" },
  { code: "gcash", name: "GCash" },
  { code: "kasikornbank", name: "Kasikornbank (Thailand)" },
  { code: "CITIUS33", name: "Citibank N.A." },
  { code: "paypal", name: "PayPal" },
  { code: "wise", name: "Wise (TransferWise)" },
];

const EMPTY_FORM = {
  supplier_name: "",
  account_name: "",
  account_number: "",
  bank_name: "",
  bank_code: "",
  aba_routing: "",
  swift_code: "",
  bank_address: "",
  payment_reference: "",
  is_active: true,
  is_autopay: false,
};

export default function AdminSupplierBankAccounts() {
  const [editingAccount, setEditingAccount] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["supplier-bank-accounts"],
    queryFn: () => base44.entities.SupplierBankAccount.list(),
    enabled: user?.role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingAccount) {
        return base44.entities.SupplierBankAccount.update(editingAccount.id, data);
      }
      return base44.entities.SupplierBankAccount.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-bank-accounts"]);
      setShowDialog(false);
      setEditingAccount(null);
      toast.success(editingAccount ? "Account updated" : "Account added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierBankAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-bank-accounts"]);
      toast.success("Account deleted");
    },
  });

  const openNew = () => {
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setForm({
      supplier_name: account.supplier_name || "",
      account_name: account.account_name || "",
      account_number: account.account_number || "",
      bank_name: account.bank_name || "",
      bank_code: account.bank_code || "",
      aba_routing: account.aba_routing || "",
      swift_code: account.swift_code || "",
      bank_address: account.bank_address || "",
      payment_reference: account.payment_reference || "",
      is_active: account.is_active ?? true,
      is_autopay: account.is_autopay ?? false,
    });
    setShowDialog(true);
  };

  const handleSupplierChange = (value) => {
    const preset = SUPPLIER_PRESETS[value];
    if (preset) {
      setForm(prev => ({ ...prev, supplier_name: value, ...preset }));
      toast.success(`Auto-filled known details for ${SUPPLIERS.find(s => s.value === value)?.label}!`);
    } else {
      setForm(prev => ({ ...prev, supplier_name: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500" />
              Supplier Bank Accounts
            </h1>
            <p className="text-slate-500 mt-1">Configure bank accounts for automated payouts to suppliers</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Supplier Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit" : "Add"} Supplier Bank Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Supplier</Label>
                  <Select value={form.supplier_name} onValueChange={handleSupplierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIERS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            {s.label}
                            {SUPPLIER_PRESETS[s.value] && (
                              <span className="text-xs text-amber-500 font-medium">⚡ auto-fill</span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {SUPPLIER_PRESETS[form.supplier_name] && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Known supplier details auto-populated below
                    </p>
                  )}
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input value={form.account_name} onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input value={form.account_number} onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))} required placeholder={form.supplier_name === "12go" ? "Enter your 12Go account/payment number" : ""} />
                </div>
                <div>
                  <Label>Bank</Label>
                  <Select value={form.bank_code} onValueChange={v => setForm(p => ({ ...p, bank_code: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank Name (for display)</Label>
                  <Input value={form.bank_name} onChange={e => setForm(p => ({ ...p, bank_name: e.target.value }))} required />
                </div>
                <div>
                  <Label>ABA Routing Number</Label>
                  <Input value={form.aba_routing} onChange={e => setForm(p => ({ ...p, aba_routing: e.target.value }))} placeholder="e.g. 021000089" />
                </div>
                <div>
                  <Label>SWIFT / BIC Code</Label>
                  <Input value={form.swift_code} onChange={e => setForm(p => ({ ...p, swift_code: e.target.value }))} placeholder="e.g. CITIUS33" />
                </div>
                <div>
                  <Label>Bank Address</Label>
                  <Input value={form.bank_address} onChange={e => setForm(p => ({ ...p, bank_address: e.target.value }))} placeholder="Full bank branch address" />
                </div>
                <div>
                  <Label>Payment Reference</Label>
                  <Input value={form.payment_reference} onChange={e => setForm(p => ({ ...p, payment_reference: e.target.value }))} placeholder={form.supplier_name === "12go" ? "Your 12Go Reseller ID" : "Must match exactly"} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_autopay"
                    checked={form.is_autopay}
                    onChange={e => setForm(p => ({ ...p, is_autopay: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_autopay" className="cursor-pointer">Enable Auto-Pay after booking</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No supplier bank accounts configured</p>
              <Button onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-xl capitalize">
                          {SUPPLIERS.find(s => s.value === account.supplier_name)?.label || account.supplier_name}
                        </CardTitle>
                        {account.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                        {account.is_autopay && (
                          <Badge className="bg-purple-500 gap-1"><Zap className="w-3 h-3" />Auto-Pay</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{account.bank_name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(account)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(account.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Account Name:</span>
                      <p className="font-medium">{account.account_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Account Number:</span>
                      <p className="font-medium font-mono">{account.account_number || "—"}</p>
                    </div>
                    {account.aba_routing && (
                      <div>
                        <span className="text-slate-500">ABA Routing:</span>
                        <p className="font-medium font-mono">{account.aba_routing}</p>
                      </div>
                    )}
                    {account.swift_code && (
                      <div>
                        <span className="text-slate-500">SWIFT/BIC:</span>
                        <p className="font-medium font-mono">{account.swift_code}</p>
                      </div>
                    )}
                    {account.payment_reference && (
                      <div>
                        <span className="text-slate-500">Payment Reference:</span>
                        <p className="font-medium font-mono text-amber-700">{account.payment_reference}</p>
                      </div>
                    )}
                    {account.bank_address && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Bank Address:</span>
                        <p className="font-medium">{account.bank_address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
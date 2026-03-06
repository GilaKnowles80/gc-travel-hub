import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminSupplierBankAccounts() {
  const [editingAccount, setEditingAccount] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      supplier_name: formData.get("supplier_name"),
      account_name: formData.get("account_name"),
      account_number: formData.get("account_number"),
      bank_code: formData.get("bank_code"),
      bank_name: formData.get("bank_name"),
      aba_routing: formData.get("aba_routing"),
      swift_code: formData.get("swift_code"),
      bank_address: formData.get("bank_address"),
      payment_reference: formData.get("payment_reference"),
      is_active: formData.get("is_active") === "on",
      is_autopay: formData.get("is_autopay") === "on",
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  const philippineBanks = [
    { code: "bdo", name: "BDO Unibank" },
    { code: "bpi", name: "Bank of the Philippine Islands" },
    { code: "ubp", name: "Union Bank of the Philippines" },
    { code: "mb", name: "Metrobank" },
    { code: "rcbc", name: "RCBC" },
    { code: "secb", name: "Security Bank" },
    { code: "pnb", name: "Philippine National Bank" },
    { code: "chinabank", name: "China Bank" },
    { code: "aub", name: "Asia United Bank" },
  ];

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
              <Button onClick={() => setEditingAccount(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Supplier Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit" : "Add"} Supplier Bank Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Supplier</Label>
                  <Select name="supplier_name" defaultValue={editingAccount?.supplier_name}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biyaheko">Biyaheko</SelectItem>
                      <SelectItem value="wanderlinx">Wanderlinx</SelectItem>
                      <SelectItem value="tripzynx">Tripzynx</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input name="account_name" defaultValue={editingAccount?.account_name} required />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input name="account_number" defaultValue={editingAccount?.account_number} required />
                </div>
                <div>
                  <Label>Bank</Label>
                  <Select name="bank_code" defaultValue={editingAccount?.bank_code}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {philippineBanks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank Name (for display)</Label>
                  <Input name="bank_name" defaultValue={editingAccount?.bank_name} required />
                </div>
                <div>
                  <Label>ABA Routing Number</Label>
                  <Input name="aba_routing" defaultValue={editingAccount?.aba_routing} placeholder="e.g. 021000089" />
                </div>
                <div>
                  <Label>SWIFT / BIC Code</Label>
                  <Input name="swift_code" defaultValue={editingAccount?.swift_code} placeholder="e.g. CITIUS33" />
                </div>
                <div>
                  <Label>Bank Address</Label>
                  <Input name="bank_address" defaultValue={editingAccount?.bank_address} placeholder="Full bank branch address" />
                </div>
                <div>
                  <Label>Payment Reference</Label>
                  <Input name="payment_reference" defaultValue={editingAccount?.payment_reference} placeholder="Must match exactly" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingAccount?.is_active ?? true}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_autopay"
                    name="is_autopay"
                    defaultChecked={editingAccount?.is_autopay ?? false}
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
              <Button onClick={() => setShowDialog(true)}>
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
                        <CardTitle className="text-xl capitalize">{account.supplier_name}</CardTitle>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAccount(account);
                          setShowDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(account.id)}
                      >
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
                      <p className="font-medium font-mono">{account.account_number}</p>
                    </div>
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
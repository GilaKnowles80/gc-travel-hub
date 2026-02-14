import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminBankAccounts() {
  const [editingAccount, setEditingAccount] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => base44.entities.BankAccount.list(),
    enabled: user?.role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingAccount) {
        return base44.entities.BankAccount.update(editingAccount.id, data);
      }
      return base44.entities.BankAccount.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bank-accounts"]);
      setShowDialog(false);
      setEditingAccount(null);
      toast.success(editingAccount ? "Account updated" : "Account added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BankAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["bank-accounts"]);
      toast.success("Account deleted");
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (accountId) => {
      // Set all to non-primary
      await Promise.all(
        accounts.map((acc) =>
          base44.entities.BankAccount.update(acc.id, { is_primary: false })
        )
      );
      // Set selected as primary
      await base44.entities.BankAccount.update(accountId, { is_primary: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bank-accounts"]);
      toast.success("Primary account updated");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      bank_name: formData.get("bank_name"),
      account_name: formData.get("account_name"),
      account_number: formData.get("account_number"),
      account_type: formData.get("account_type"),
      swift_code: formData.get("swift_code"),
      branch: formData.get("branch"),
      payment_instructions: formData.get("payment_instructions"),
      is_primary: formData.get("is_primary") === "on",
    });
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
              Bank Accounts for Payments
            </h1>
            <p className="text-slate-500 mt-1">Manage your bank accounts for receiving customer payments</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAccount(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Bank Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit" : "Add"} Bank Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input name="bank_name" defaultValue={editingAccount?.bank_name} placeholder="BDO, BPI, MetroBank, etc." required />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select name="account_type" defaultValue={editingAccount?.account_type || "savings"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input name="account_name" defaultValue={editingAccount?.account_name} placeholder="GC Travel & Tours" required />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input name="account_number" defaultValue={editingAccount?.account_number} placeholder="1234567890" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Branch (Optional)</Label>
                    <Input name="branch" defaultValue={editingAccount?.branch} placeholder="Imus Branch" />
                  </div>
                  <div>
                    <Label>SWIFT Code (Optional)</Label>
                    <Input name="swift_code" defaultValue={editingAccount?.swift_code} placeholder="For international transfers" />
                  </div>
                </div>
                <div>
                  <Label>Payment Instructions</Label>
                  <Textarea 
                    name="payment_instructions" 
                    defaultValue={editingAccount?.payment_instructions}
                    placeholder="Additional instructions for customers (e.g., 'Please use booking reference as payment reference')"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    name="is_primary"
                    defaultChecked={editingAccount?.is_primary}
                    className="rounded"
                  />
                  <Label htmlFor="is_primary" className="cursor-pointer">Set as primary account</Label>
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
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No bank accounts configured yet</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className={account.is_primary ? "border-2 border-blue-500" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{account.bank_name}</CardTitle>
                        {account.is_primary && (
                          <Badge className="bg-blue-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">{account.account_type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 font-mono">{account.account_number}</p>
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
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Account Name:</span>
                      <p className="font-medium">{account.account_name}</p>
                    </div>
                    {account.branch && (
                      <div>
                        <span className="text-slate-500">Branch:</span>
                        <p className="font-medium">{account.branch}</p>
                      </div>
                    )}
                    {account.swift_code && (
                      <div>
                        <span className="text-slate-500">SWIFT:</span>
                        <p className="font-medium font-mono">{account.swift_code}</p>
                      </div>
                    )}
                  </div>
                  {account.payment_instructions && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Payment Instructions:</p>
                      <p className="text-sm text-slate-700">{account.payment_instructions}</p>
                    </div>
                  )}
                  {!account.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimaryMutation.mutate(account.id)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      Set as Primary Account
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
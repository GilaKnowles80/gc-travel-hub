import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Send, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function BankTransferForm({ user, kycVerified }) {
  const [transferType, setTransferType] = useState("wallet_to_bank");
  const [formData, setFormData] = useState({
    amount: "",
    recipient_name: "",
    recipient_bank: "",
    recipient_account: "",
    notes: "",
  });
  const [success, setSuccess] = useState(false);

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BankTransfer.create({
        ...data,
        user_email: user.email,
        transfer_type: transferType,
        status: "pending",
        fee: parseFloat(data.amount) * 0.01, // 1% fee
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ amount: "", recipient_name: "", recipient_bank: "", recipient_account: "", notes: "" });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.recipient_name) return;
    transferMutation.mutate(formData);
  };

  if (!kycVerified) {
    return (
      <Card className="p-6 border-amber-200 bg-amber-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">KYC Required</h3>
            <p className="text-sm text-amber-800">Complete KYC verification to enable bank transfers.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex gap-2"
        >
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Transfer Initiated</p>
            <p className="text-sm text-green-800">Your bank transfer is being processed.</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Transfer Type</label>
          <Select value={transferType} onValueChange={setTransferType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wallet_to_bank">Withdraw to Bank</SelectItem>
              <SelectItem value="bank_to_wallet">Deposit from Bank</SelectItem>
              <SelectItem value="wallet_to_wallet">Send to User Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Amount (PHP)</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="5000"
              min="100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Recipient Name</label>
            <Input
              value={formData.recipient_name}
              onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>

          {transferType !== "wallet_to_wallet" && (
            <>
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <Select value={formData.recipient_bank} onValueChange={(val) => setFormData({...formData, recipient_bank: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bdo">BDO</SelectItem>
                    <SelectItem value="bpi">BPI</SelectItem>
                    <SelectItem value="metrobank">Metrobank</SelectItem>
                    <SelectItem value="unionbank">UnionBank</SelectItem>
                    <SelectItem value="maybank">Maybank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Account Number</label>
                <Input
                  value={formData.recipient_account}
                  onChange={(e) => setFormData({...formData, recipient_account: e.target.value})}
                  placeholder="123456789012"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Input
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Reference or description"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-blue-900">💰 Transfer Details</p>
          <p className="text-sm text-blue-800">Amount: PHP {formData.amount || "0"}</p>
          <p className="text-sm text-blue-800">Fee (1%): PHP {formData.amount ? (parseFloat(formData.amount) * 0.01).toFixed(2) : "0"}</p>
          <p className="text-sm font-semibold text-blue-900">Total: PHP {formData.amount ? (parseFloat(formData.amount) * 1.01).toFixed(2) : "0"}</p>
        </div>

        <Button
          type="submit"
          disabled={!formData.amount || !formData.recipient_name || transferMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4 mr-2" />
          {transferMutation.isPending ? "Processing..." : "Send Transfer"}
        </Button>
      </form>
    </Card>
  );
}
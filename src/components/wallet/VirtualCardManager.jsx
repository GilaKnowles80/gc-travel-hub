import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

export default function VirtualCardManager({ user, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState("virtual");
  const [cardName, setCardName] = useState("");
  const [dailyLimit, setDailyLimit] = useState("50000");

  const createCardMutation = useMutation({
    mutationFn: async (cardData) => {
      return await base44.entities.WalletCard.create(cardData);
    },
    onSuccess: () => {
      setOpen(false);
      setCardName("");
      setDailyLimit("50000");
      onSuccess?.();
    },
  });

  const handleCreateCard = async () => {
    if (!cardName.trim()) return;

    const cardData = {
      user_email: user.email,
      card_type: cardType,
      card_number: `•••• •••• •••• ${Math.random().toString().slice(2, 6)}`,
      card_holder_name: cardName,
      expiry_date: "12/28",
      status: "active",
      daily_limit: parseFloat(dailyLimit),
      balance: 0,
      is_primary: false,
      kyc_verified: false,
    };

    createCardMutation.mutate(cardData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create New Card
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payment Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Card Type</label>
            <Select value={cardType} onValueChange={setCardType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual Card</SelectItem>
                <SelectItem value="physical_visa">Physical Visa Card</SelectItem>
                <SelectItem value="physical_mastercard">Physical Mastercard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Card Holder Name</label>
            <Input
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Daily Spending Limit (PHP)</label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              min="1000"
              max="500000"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              💡 Virtual cards are instant and perfect for online purchases. Physical cards arrive in 5-7 business days.
            </p>
          </div>

          <Button 
            onClick={handleCreateCard} 
            disabled={!cardName.trim() || createCardMutation.isPending}
            className="w-full"
          >
            {createCardMutation.isPending ? "Creating..." : "Create Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
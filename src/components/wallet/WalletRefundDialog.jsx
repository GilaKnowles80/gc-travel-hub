import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function WalletRefundDialog({ open, onOpenChange }) {
  const [userEmail, setUserEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingType, setBookingType] = useState("flight");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reset = () => {
    setUserEmail("");
    setAmount("");
    setBookingId("");
    setBookingType("flight");
    setReason("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail || !amount) return;
    setLoading(true);
    try {
      await base44.functions.invoke("processWalletEscrow", {
        action: "refund",
        user_email: userEmail,
        amount: parseFloat(amount),
        booking_id: bookingId || undefined,
        booking_type: bookingType,
        reason: reason || undefined,
      });
      toast({ title: "Refund issued to wallet" });
      reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["all-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    } catch (err) {
      toast({ title: "Refund failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Wallet Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>User Email</Label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="customer@example.com"
              required
            />
          </div>
          <div>
            <Label>Refund Amount (₱)</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Booking Type</Label>
              <Select value={bookingType} onValueChange={setBookingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="ferry">Ferry</SelectItem>
                  <SelectItem value="cruise">Cruise</SelectItem>
                  <SelectItem value="car_rental">Car Rental</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Booking ID (optional)</Label>
              <Input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Booking reference"
              />
            </div>
          </div>
          <div>
            <Label>Reason (optional)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for refund"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Issue Refund"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
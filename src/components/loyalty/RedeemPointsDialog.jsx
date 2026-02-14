import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RedeemPointsDialog({ open, onOpenChange, account, settings, onRedeem }) {
  const [pointsToRedeem, setPointsToRedeem] = useState("");

  const maxRedeemable = account?.points_balance || 0;
  const minPoints = settings?.min_redemption_points || 100;
  const pesoPerPoint = settings?.peso_per_point || 0.5;

  const discount = parseFloat(pointsToRedeem || 0) * pesoPerPoint;

  const handleRedeem = () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points < minPoints) {
      toast.error(`Minimum ${minPoints} points required`);
      return;
    }
    if (points > maxRedeemable) {
      toast.error("Insufficient points");
      return;
    }
    onRedeem(points);
    setPointsToRedeem("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Redeem Points
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Available: {maxRedeemable.toLocaleString()} points</p>
                <p>Each point = ₱{pesoPerPoint.toFixed(2)} discount</p>
                <p>Minimum redemption: {minPoints} points</p>
              </div>
            </div>
          </div>

          <div>
            <Label>Points to Redeem</Label>
            <Input
              type="number"
              min={minPoints}
              max={maxRedeemable}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder={`Min: ${minPoints}`}
            />
          </div>

          {discount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 mb-1">Discount Value</p>
              <p className="text-3xl font-bold text-green-700">₱{discount.toFixed(2)}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRedeem} className="flex-1" disabled={!pointsToRedeem || discount === 0}>
              Apply Discount
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
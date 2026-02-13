import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PriceAlertDialog({ flight, cabinClass, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const selectedCabin = flight.cabin_classes?.find(c => c.class === cabinClass);
  const currentPrice = selectedCabin?.price || 0;
  
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));

  const createAlertMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.PriceAlert.create({
        ...data,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceAlerts"] });
      toast.success("Price alert created! We'll notify you when the price drops.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to create price alert");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (targetPrice >= currentPrice) {
      toast.error("Target price must be lower than current price");
      return;
    }

    createAlertMutation.mutate({
      flight_id: flight.id,
      flight_number: flight.flight_number,
      route: `${flight.origin} - ${flight.destination}`,
      cabin_class: cabinClass,
      target_price: targetPrice,
      current_price: currentPrice,
      is_active: true,
      notified: false,
      last_checked: new Date().toISOString(),
    });
  };

  const savingsAmount = currentPrice - targetPrice;
  const savingsPercent = Math.round((savingsAmount / currentPrice) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Set Price Alert
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Flight</span>
              <span className="font-semibold text-slate-900">{flight.flight_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Route</span>
              <span className="font-semibold text-slate-900">{flight.origin} → {flight.destination}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Class</span>
              <span className="font-semibold text-slate-900 capitalize">{cabinClass.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-600">Current Price</span>
              <span className="font-bold text-slate-900">${currentPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice">Alert me when price drops to:</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="pl-7 rounded-xl"
                min={0}
                max={currentPrice - 1}
                required
              />
            </div>
            {targetPrice < currentPrice && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  You'll save <strong>${savingsAmount.toLocaleString()}</strong> ({savingsPercent}%) if the price drops to your target!
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>We'll check prices every 6 hours</li>
              <li>You'll get an email when price drops to or below your target</li>
              <li>Alert stays active until you delete it</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAlertMutation.isPending || targetPrice >= currentPrice}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl"
            >
              {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
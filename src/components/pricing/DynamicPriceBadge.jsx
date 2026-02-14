import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function DynamicPriceBadge({ pricing, showSavings = true }) {
  if (!pricing) return null;

  const priceIncrease = pricing.price_multiplier > 1;
  const hasDiscount = pricing.discount_percent > 0;
  const badgeColor = priceIncrease
    ? "bg-red-100 text-red-800 border-red-200"
    : hasDiscount
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-slate-900">
          ₱{pricing.current_price.toLocaleString()}
        </div>
        {pricing.base_price !== pricing.current_price && (
          <div className="text-sm text-slate-500 line-through">
            ₱{pricing.base_price.toLocaleString()}
          </div>
        )}
      </div>

      {hasDiscount && showSavings && (
        <Badge className="bg-green-100 text-green-800 border-green-200 border gap-1">
          <TrendingDown className="w-3 h-3" />
          Save {pricing.discount_percent}%
        </Badge>
      )}

      {priceIncrease && (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 border gap-1">
          <TrendingUp className="w-3 h-3" />
          High Demand
        </Badge>
      )}

      {pricing.price_multiplier === 1 && !hasDiscount && (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 border gap-1">
          <Zap className="w-3 h-3" />
          Standard Price
        </Badge>
      )}
    </div>
  );
}
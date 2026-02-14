import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PriceTrackingBadge({ priceTracking }) {
  if (!priceTracking?.last_checked) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="w-3 h-3" />
        <span className="text-xs">Never checked</span>
      </Badge>
    );
  }

  const lastChecked = new Date(priceTracking.last_checked);
  const timeAgo = formatDistanceToNow(lastChecked, { addSuffix: true });

  const hasBestPrice = priceTracking.best_price?.price;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="gap-1">
        <Clock className="w-3 h-3" />
        <span className="text-xs">Checked {timeAgo}</span>
      </Badge>
      
      {hasBestPrice && (
        <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-200">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs">
            Best: ₱{priceTracking.best_price.price.toFixed(2)} @ {priceTracking.best_price.supplier}
          </span>
        </Badge>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingDown, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function PriceTrackingBadge({ priceTracking, listingPrice }) {
  const [markup, setMarkup] = useState(15);

  useEffect(() => {
    base44.functions.invoke('getMarkup', {}).then(res => {
      setMarkup(res.data.markup);
    }).catch(() => setMarkup(15));
  }, []);

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
  
  // Calculate profit margin
  let profitMargin = null;
  let profitAmount = null;
  if (hasBestPrice && listingPrice) {
    const supplierPrice = priceTracking.best_price.price;
    const expectedSellingPrice = supplierPrice * (1 + markup / 100);
    profitAmount = listingPrice - supplierPrice;
    profitMargin = ((listingPrice - supplierPrice) / supplierPrice) * 100;
  }

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

      {profitMargin !== null && (
        <Badge className={`gap-1 ${
          profitMargin >= markup 
            ? 'bg-emerald-600 text-white' 
            : profitMargin > 0 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <DollarSign className="w-3 h-3" />
          <span className="text-xs font-semibold">
            Profit: ₱{profitAmount.toFixed(2)} ({profitMargin.toFixed(1)}%)
          </span>
        </Badge>
      )}
    </div>
  );
}
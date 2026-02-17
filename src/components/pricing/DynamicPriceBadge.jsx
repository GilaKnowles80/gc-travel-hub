import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export default function DynamicPriceBadge({ itemType, itemId, basePrice, departureDate, showAdjustments = false }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculatePrice = async () => {
      try {
        const { data } = await base44.functions.invoke('calculateDynamicPrice', {
          itemType,
          itemId,
          basePrice,
          departureDate,
          bookingDate: new Date().toISOString()
        });
        setPricing(data);
      } catch (error) {
        console.error('Dynamic price calculation error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (basePrice) {
      calculatePrice();
    }
  }, [itemType, itemId, basePrice, departureDate]);

  if (loading || !pricing) return null;

  const hasAdjustment = pricing.final_price !== pricing.base_price;
  if (!hasAdjustment) return null;

  const isIncrease = pricing.final_price > pricing.base_price;
  const percentChange = Math.abs(((pricing.final_price - pricing.base_price) / pricing.base_price) * 100);

  return (
    <div className="space-y-2">
      <Badge className={isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
        {isIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {isIncrease ? '+' : '-'}${Math.abs(pricing.total_adjustment).toFixed(2)} ({percentChange.toFixed(1)}%)
      </Badge>
      
      {showAdjustments && pricing.adjustments.length > 0 && (
        <div className="text-xs text-slate-600 space-y-1">
          {pricing.adjustments.map((adj, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{adj.rule_name}: {adj.is_increase ? '+' : '-'}${adj.adjustment.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function DynamicPricingBadge({ pricing }) {
  if (!pricing) return null;

  const { 
    base_price, 
    dynamic_price, 
    price_change_percent, 
    is_discounted, 
    demand_level,
    reason 
  } = pricing;

  const color = is_discounted 
    ? 'bg-green-100 text-green-800' 
    : 'bg-orange-100 text-orange-800';
  
  const icon = is_discounted ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge className={`${color} flex items-center gap-1 cursor-help`}>
              {icon}
              {Math.abs(price_change_percent)}% {is_discounted ? 'Off' : 'Premium'}
            </Badge>
            <div className="text-sm">
              <p className="text-slate-500 line-through">${base_price}</p>
              <p className="text-lg font-bold text-slate-900">${dynamic_price}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="font-medium">{demand_level.charAt(0).toUpperCase() + demand_level.slice(1)} Demand</span>
            </div>
            <p className="text-sm">{reason}</p>
            <div className="pt-2 border-t border-slate-700 text-xs">
              <p>Base: ${base_price} → Dynamic: ${dynamic_price}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
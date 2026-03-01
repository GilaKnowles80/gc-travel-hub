import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicPricingBadge from './DynamicPricingBadge';
import { Zap } from 'lucide-react';

export default function PricingComparisonPanel({ productType, productId, basePrice, date, destination }) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (basePrice && date && destination) {
      fetchDynamicPricing();
    }
  }, [productType, productId, basePrice, date, destination]);

  const fetchDynamicPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('calculateDynamicPrices', {
        product_type: productType,
        product_id: productId,
        base_price: basePrice,
        date,
        destination
      });
      setPricing(response.data);
    } catch (err) {
      setError('Unable to calculate dynamic pricing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!basePrice || !date) return null;

  if (loading) return <Skeleton className="h-16 w-full rounded-lg" />;
  if (error || !pricing) return (
    <div className="text-right">
      <p className="text-3xl font-bold text-amber-600">₱{basePrice?.toLocaleString()}</p>
    </div>
  );

  return (
    <div>
      <DynamicPricingBadge pricing={pricing} />
      {pricing.is_discounted && (
        <p className="text-xs text-green-600 mt-1">
          {Math.abs(pricing.price_change_percent)}% below market average
        </p>
      )}
      {pricing.demand_level === 'very_high' && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <Zap className="w-3 h-3" /> High demand – price may rise
        </p>
      )}
    </div>
  );
}
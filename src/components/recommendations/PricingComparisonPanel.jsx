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

  return (
    <div className="space-y-4">
      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pricing && !loading && (
        <>
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <CardTitle>Dynamic Pricing Analysis</CardTitle>
                </div>
              </div>
              <CardDescription>
                Real-time market adjustment based on demand and competitor prices
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-slate-500 mb-1">Your Price</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${pricing.dynamic_price}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Base: ${pricing.base_price}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-slate-500 mb-1">Market Average</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${pricing.avg_competitor_price}
                  </p>
                  <p className={`text-xs mt-2 font-medium ${pricing.competitiveness === 'competitive' ? 'text-green-600' : 'text-amber-600'}`}>
                    {pricing.competitiveness === 'competitive' ? '✓ Competitive' : '△ Premium'}
                  </p>
                </div>
              </div>

              <DynamicPricingBadge pricing={pricing} />

              {pricing.demand_level === 'very_high' && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Very high demand detected. Prices may increase further.
                  </AlertDescription>
                </Alert>
              )}

              {pricing.is_discounted && (
                <Alert className="bg-green-50 border-green-200">
                  <Zap className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Great deal! This price is {Math.abs(pricing.price_change_percent)}% lower than market average.
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-2">Why This Price?</p>
                <p className="text-sm text-slate-600">{pricing.reason}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
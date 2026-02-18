import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPricingSuggestions({ supplierId }) {
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['ai-pricing-suggestions', supplierId],
    queryFn: () => base44.entities.AIPricingSuggestion.filter({ 
      supplier_id: supplierId,
      status: 'pending'
    }, '-created_date')
  });

  const acceptMutation = useMutation({
    mutationFn: async (suggestion) => {
      // Update inventory price
      await base44.entities.SupplierInventory.update(suggestion.inventory_id, {
        current_price: suggestion.suggested_price
      });
      // Update suggestion status
      await base44.entities.AIPricingSuggestion.update(suggestion.id, {
        status: 'accepted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-pricing-suggestions']);
      queryClient.invalidateQueries(['supplier-inventory']);
      toast.success('Price updated successfully');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (suggestionId) => {
      return base44.entities.AIPricingSuggestion.update(suggestionId, {
        status: 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-pricing-suggestions']);
      toast.success('Suggestion rejected');
    }
  });

  const getDemandColor = (demand) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-amber-100 text-amber-700',
      very_high: 'bg-red-100 text-red-700'
    };
    return colors[demand] || colors.medium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Pricing Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No AI suggestions available</p>
            <p className="text-sm text-slate-400">Enable AI pricing and run analysis to get suggestions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{suggestion.item_name}</span>
                      <Badge className="capitalize">{suggestion.item_type}</Badge>
                      <Badge className={getDemandColor(suggestion.demand_forecast)}>
                        {suggestion.demand_forecast} demand
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500">Current Price</p>
                        <p className="text-lg font-bold">${suggestion.current_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Suggested Price</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-blue-600">${suggestion.suggested_price}</p>
                          {suggestion.price_change_percentage > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm ${suggestion.price_change_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {suggestion.price_change_percentage > 0 ? '+' : ''}{suggestion.price_change_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${suggestion.confidence_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{suggestion.confidence_score}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium mb-1">AI Reasoning:</p>
                      <p className="text-sm text-slate-700">{suggestion.reasoning}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-slate-600">Seasonality</p>
                        <p className="font-medium">{suggestion.seasonality_factor}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs text-slate-600">Market Insights</p>
                        <p className="font-medium">{suggestion.competitor_insights}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-xs text-slate-600">Revenue Impact</p>
                        <p className="font-medium">{suggestion.revenue_impact > 0 ? '+' : ''}{suggestion.revenue_impact}%</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded">
                        <p className="text-xs text-slate-600">Booking Impact</p>
                        <p className="font-medium">{suggestion.booking_impact > 0 ? '+' : ''}{suggestion.booking_impact}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <Clock className="w-3 h-3" />
                      Valid until: {new Date(suggestion.valid_until).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => acceptMutation.mutate(suggestion)}
                    disabled={acceptMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Apply
                  </Button>
                  <Button 
                    onClick={() => rejectMutation.mutate(suggestion.id)}
                    disabled={rejectMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
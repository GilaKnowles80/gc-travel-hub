import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertCircle } from 'lucide-react';
import AIRecommendationCard from './AIRecommendationCard';

export default function AIRecommendationsPanel({ searchType, destination, onSelectProduct }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async (preferences = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('aiTravelRecommendations', {
        searchType,
        destination,
        preferences
      });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError('Unable to load recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (destination && searchType) {
      fetchRecommendations();
    }
  }, [destination, searchType]);

  if (!destination || !searchType) return null;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </div>
            {!loading && recommendations.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchRecommendations()}
              >
                Refresh
              </Button>
            )}
          </div>
          <CardDescription>
            Personalized suggestions based on your preferences and travel history
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, idx) => (
                <AIRecommendationCard
                  key={idx}
                  recommendation={rec}
                  onSelect={() => {
                    onSelectProduct?.(rec.product_id, rec.full_product);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500">
              No recommendations available for this destination.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
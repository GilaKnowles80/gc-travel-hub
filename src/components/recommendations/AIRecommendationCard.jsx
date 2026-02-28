import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Zap } from 'lucide-react';

export default function AIRecommendationCard({ recommendation, onSelect }) {
  if (!recommendation) return null;

  const { name, reason, price, confidence, image_url, rating } = recommendation;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="text-xs mt-1">AI Recommended</CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {confidence}% Match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {image_url && (
          <img 
            src={image_url} 
            alt={name}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}
        
        <p className="text-sm text-slate-600 leading-relaxed">{reason}</p>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {confidence > 85 ? 'Top Pick' : 'Recommended'}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">From</p>
            <p className="text-lg font-bold text-slate-900">${price}</p>
          </div>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
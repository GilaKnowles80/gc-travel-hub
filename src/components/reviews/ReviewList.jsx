import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";
import moment from "moment";

export default function ReviewList({ itemType, itemId }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", itemType, itemId],
    queryFn: async () => {
      return base44.entities.Review.filter({
        item_type: itemType,
        item_id: itemId,
        status: "approved",
      }, "-created_date");
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-600">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold text-amber-600">{averageRating}</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-slate-700">
            <p className="font-semibold">Based on {reviews.length} reviews</p>
            <p className="text-sm">
              {reviews.filter(r => r.is_verified_booking).length} verified bookings
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6 rounded-xl border-0 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{review.user_name}</span>
                  {review.is_verified_booking && (
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-slate-500">
                {moment(review.created_date).fromNow()}
              </span>
            </div>
            
            {review.title && (
              <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
            )}
            <p className="text-slate-700 leading-relaxed">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
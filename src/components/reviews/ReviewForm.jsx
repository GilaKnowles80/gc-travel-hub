import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReviewForm({ itemType, itemId, itemName, bookingId, onSuccess }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const submitReviewMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Review.create({
        ...data,
        user_email: user.email,
        user_name: user.full_name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review submitted successfully!");
      setRating(0);
      setTitle("");
      setComment("");
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to submit review");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    submitReviewMutation.mutate({
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      booking_id: bookingId,
      rating,
      title,
      comment,
      status: "approved",
      is_verified_booking: !!bookingId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Write a Review</h3>
      
      <div className="space-y-2">
        <Label>Your Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review *</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details of your experience..."
          className="rounded-xl h-32"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={submitReviewMutation.isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl"
      >
        {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
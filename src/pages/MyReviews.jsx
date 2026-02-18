import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Edit, Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "react-hot-toast";
import PullToRefresh from "@/components/mobile/PullToRefresh";

export default function MyReviews() {
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", comment: "", rating: 0 });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Review.filter({ user_email: user.email }, "-created_date");
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => base44.entities.Review.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Review.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated");
      setEditingReview(null);
    },
  });

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditForm({
      title: review.title || "",
      comment: review.comment,
      rating: review.rating,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateReviewMutation.mutate({
      id: editingReview.id,
      data: editForm,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-amber-500" />
            My Reviews
          </h1>
          <p className="text-slate-600">Manage your reviews and ratings</p>
        </div>

        {reviews.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl border-0 shadow-sm">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No reviews yet</h3>
            <p className="text-slate-500">
              Complete a booking and share your experience!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 rounded-2xl border-0 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="capitalize">{review.item_type}</Badge>
                        <Badge
                          variant={
                            review.status === "approved"
                              ? "default"
                              : review.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {review.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{review.item_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
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
                        <span className="text-sm text-slate-500">
                          {moment(review.created_date).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(review)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-slate-700">{review.comment}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review</label>
                <Textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="rounded-xl h-32"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingReview(null)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateReviewMutation.isPending}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl"
                >
                  {updateReviewMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </PullToRefresh>
  );
}
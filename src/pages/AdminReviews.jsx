import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, CheckCircle, XCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "react-hot-toast";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => base44.entities.Review.list("-created_date"),
    enabled: user?.role === "admin",
  });

  const moderateReviewMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Review.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review moderated");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((r) => r.status === activeTab);

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-500" />
            Review Moderation
          </h1>
          <p className="text-slate-600">Manage and moderate user reviews</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredReviews.length === 0 ? (
              <Card className="p-12 text-center rounded-2xl border-0 shadow-sm">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No {activeTab === "all" ? "" : activeTab} reviews
                </h3>
              </Card>
            ) : (
              filteredReviews.map((review) => (
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
                          {review.is_verified_booking && (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              Verified Booking
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">
                            {review.user_name}
                          </span>
                          <span className="text-sm text-slate-500">
                            {review.user_email}
                          </span>
                          <span className="text-sm text-slate-400">
                            {moment(review.created_date).format("MMM D, YYYY")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {review.item_name}
                        </h3>
                        <div className="flex gap-1 mb-3">
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
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
                    )}
                    <p className="text-slate-700 mb-4">{review.comment}</p>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      {review.status !== "approved" && (
                        <Button
                          onClick={() =>
                            moderateReviewMutation.mutate({ id: review.id, status: "approved" })
                          }
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          onClick={() =>
                            moderateReviewMutation.mutate({ id: review.id, status: "rejected" })
                          }
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
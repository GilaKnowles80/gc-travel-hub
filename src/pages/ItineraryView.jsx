import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { toast } from "sonner";
import ItineraryDayView from "../components/itinerary/ItineraryDayView";
import AddToItineraryDialog from "../components/itinerary/AddToItineraryDialog";
import EditItineraryDialog from "../components/itinerary/EditItineraryDialog";

export default function ItineraryView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const itineraryId = urlParams.get("id");

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ["itinerary", itineraryId],
    queryFn: async () => await base44.entities.Itinerary.get(itineraryId),
    enabled: !!itineraryId,
  });

  // Real-time: invalidate this itinerary whenever it changes so the view
  // updates live (e.g. when a newly confirmed flight is auto-attached).
  useEffect(() => {
    if (!itineraryId) return;
    const unsubscribe = base44.entities.Itinerary.subscribe((event) => {
      if (!event || event.id === itineraryId) {
        queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      }
    });
    return unsubscribe;
  }, [itineraryId, queryClient]);

  const shareMutation = useMutation({
    mutationFn: async () => {
      const token = Math.random().toString(36).substring(2);
      await base44.entities.Itinerary.update(itineraryId, {
        share_token: token,
        is_shared: true,
      });
      return token;
    },
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      const shareUrl = `${window.location.origin}${createPageUrl(`SharedItinerary?token=${token}`)}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await base44.entities.Itinerary.delete(itineraryId),
    onSuccess: () => {
      toast.success("Itinerary deleted");
      navigate(createPageUrl("Itineraries"));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Itinerary not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Itineraries"))}
          className="mb-6 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Itineraries
        </Button>

        <Card className="rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{itinerary.title}</h1>
                <p className="text-slate-600">{itinerary.destination}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEdit(true)}
                  className="rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shareMutation.mutate()}
                  className="rounded-xl"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this itinerary?")) deleteMutation.mutate();
                  }}
                  className="rounded-xl text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {itinerary.notes && (
              <p className="text-sm text-slate-600 mt-4 p-4 bg-slate-50 rounded-xl">
                {itinerary.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Day by Day</h2>
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-amber-500 hover:bg-amber-600 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Booking
          </Button>
        </div>

        <ItineraryDayView itinerary={itinerary} />

        <AddToItineraryDialog
          open={showAdd}
          onClose={() => setShowAdd(false)}
          itineraryId={itineraryId}
        />

        <EditItineraryDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          itinerary={itinerary}
        />
      </div>
    </div>
  );
}
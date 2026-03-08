import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ItineraryDayView from "../components/itinerary/ItineraryDayView";

export default function SharedItinerary() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ["shared-itinerary", token],
    queryFn: async () => {
      const itineraries = await base44.entities.Itinerary.filter({ share_token: token, is_shared: true });
      return itineraries[0] || null;
    },
    enabled: !!token,
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
        <p className="text-slate-600">Itinerary not found or not shared</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="rounded-2xl mb-6">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{itinerary.title}</h1>
            <p className="text-slate-600">{itinerary.destination}</p>
            {itinerary.notes && (
              <p className="text-sm text-slate-600 mt-4 p-4 bg-slate-50 rounded-xl">
                {itinerary.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-slate-900 mb-6">Day by Day</h2>
        <ItineraryDayView itinerary={itinerary} />
      </div>
    </div>
  );
}
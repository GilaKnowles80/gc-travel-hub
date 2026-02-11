import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Route, Calendar, MapPin, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import moment from "moment";

export default function SavedItinerariesTab({ user }) {
  const { data: itineraries, isLoading } = useQuery({
    queryKey: ["user-itineraries", user?.email],
    queryFn: async () => {
      return await base44.entities.Itinerary.filter({
        user_email: user?.email,
      });
    },
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!itineraries || itineraries.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-16 text-center">
          <Route className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Saved Itineraries</h3>
          <p className="text-slate-500 mb-6">Start planning your next adventure!</p>
          <Link to={createPageUrl("Itineraries")}>
            <Button className="bg-amber-500 hover:bg-amber-600 rounded-xl">
              Create Itinerary
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {itineraries.map((itinerary) => (
        <Card key={itinerary.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Route className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{itinerary.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {itinerary.destination}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {moment(itinerary.start_date).format("MMM D")} -{" "}
                        {moment(itinerary.end_date).format("MMM D, YYYY")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-lg">
                    {itinerary.items?.length || 0} bookings
                  </Badge>
                  {itinerary.is_shared && (
                    <Badge className="bg-green-100 text-green-700 rounded-lg border-green-200">
                      <Share2 className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                </div>
              </div>

              <Link to={`${createPageUrl("ItineraryView")}?id=${itinerary.id}`}>
                <Button className="bg-amber-500 hover:bg-amber-600 rounded-xl">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
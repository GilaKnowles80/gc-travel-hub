import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import moment from "moment";
import CreateItineraryDialog from "../components/itinerary/CreateItineraryDialog";

export default function Itineraries() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ["user-itineraries"],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Itinerary.filter({ user_email: user.email }, "-created_date");
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Itineraries</h1>
            <p className="text-slate-600 mt-2">Plan and organize your trips</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-amber-500 hover:bg-amber-600 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Itinerary
          </Button>
        </div>

        {itineraries.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-16 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No itineraries yet</h3>
              <p className="text-slate-600 mb-6">Start planning your next adventure</p>
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-amber-500 hover:bg-amber-600 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Itinerary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <Link key={itinerary.id} to={createPageUrl(`ItineraryView?id=${itinerary.id}`)}>
                <Card className="rounded-2xl hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{itinerary.title}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {itinerary.destination}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        {moment(itinerary.start_date).format("MMM D")} - {moment(itinerary.end_date).format("MMM D, YYYY")}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-slate-500">{itinerary.items?.length || 0} items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <CreateItineraryDialog open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </div>
  );
}
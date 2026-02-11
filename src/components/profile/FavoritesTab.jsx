import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { toast } from "sonner";

export default function FavoritesTab({ user }) {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => await base44.entities.Favorite.filter({ user_email: user.email }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.Favorite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success("Removed from favorites");
    },
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No favorites saved yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {favorites.map((fav) => (
        <Card key={fav.id} className="rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                {fav.item_type === "flight" && <Plane className="w-5 h-5 text-amber-600" />}
                {(fav.item_type === "tour" || fav.item_type === "hotel") && (
                  <MapPin className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1 truncate">
                  {fav.item_title}
                </h3>
                <Badge variant="outline" className="mb-2 capitalize">
                  {fav.item_type}
                </Badge>
                <div className="flex gap-2">
                  <Link
                    to={createPageUrl(
                      fav.item_type === "flight"
                        ? `FlightDetail?id=${fav.item_id}`
                        : fav.item_type === "tour"
                        ? `TourDetail?id=${fav.item_id}`
                        : `HotelDetail?id=${fav.item_id}`
                    )}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full rounded-lg">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(fav.id)}
                    className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function FavoriteButton({ itemType, itemId, itemTitle, itemData, className = "" }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Favorite.filter({ user_email: user.email });
    },
    enabled: !!user,
  });

  const isFavorite = favorites.some(
    (fav) => fav.item_id === itemId && fav.item_type === itemType
  );

  const addMutation = useMutation({
    mutationFn: async () =>
      await base44.entities.Favorite.create({
        user_email: user.email,
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        item_data: itemData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success("Added to favorites");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const fav = favorites.find(
        (f) => f.item_id === itemId && f.item_type === itemType
      );
      if (fav) await base44.entities.Favorite.delete(fav.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast.success("Removed from favorites");
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }
    if (isFavorite) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`rounded-full ${className}`}
    >
      <Heart
        className={`w-5 h-5 ${
          isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
        }`}
      />
    </Button>
  );
}
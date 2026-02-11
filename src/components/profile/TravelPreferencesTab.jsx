import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";

export default function TravelPreferencesTab({ user }) {
  const [preferences, setPreferences] = useState({
    preferred_cabin_class: user?.preferred_cabin_class || "economy",
    meal_preference: user?.meal_preference || "regular",
    seat_preference: user?.seat_preference || "no_preference",
    travel_style: user?.travel_style || "leisure",
    interests: user?.interests || [],
  });

  const queryClient = useQueryClient();

  const availableInterests = [
    "Beach & Relaxation",
    "Adventure & Sports",
    "Culture & History",
    "Food & Culinary",
    "Wildlife & Nature",
    "Shopping",
    "Photography",
    "Nightlife",
    "Wellness & Spa",
    "Family Activities",
  ];

  const toggleInterest = (interest) => {
    const current = preferences.interests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setPreferences({ ...preferences, interests: updated });
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => await base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Preferences updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(preferences);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          Travel Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Travel Style</Label>
            <Select
              value={preferences.travel_style}
              onValueChange={(value) => setPreferences({ ...preferences, travel_style: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leisure">Leisure & Relaxation</SelectItem>
                <SelectItem value="adventure">Adventure & Exploration</SelectItem>
                <SelectItem value="luxury">Luxury & Premium</SelectItem>
                <SelectItem value="budget">Budget-Friendly</SelectItem>
                <SelectItem value="business">Business Travel</SelectItem>
                <SelectItem value="family">Family Vacation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Travel Interests</Label>
            <p className="text-xs text-slate-500 mb-3">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={preferences.interests?.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer rounded-xl transition-colors ${
                    preferences.interests?.includes(interest)
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Cabin Class</Label>
              <Select
                value={preferences.preferred_cabin_class}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, preferred_cabin_class: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first_class">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Meal Preference</Label>
              <Select
                value={preferences.meal_preference}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, meal_preference: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="kosher">Kosher</SelectItem>
                  <SelectItem value="gluten_free">Gluten Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seat Preference</Label>
              <Select
                value={preferences.seat_preference}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, seat_preference: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="window">Window</SelectItem>
                  <SelectItem value="aisle">Aisle</SelectItem>
                  <SelectItem value="no_preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 rounded-xl"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
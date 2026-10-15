import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Label } from "@/components/ui/label";
import { Users, Home, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ACTIVITIES = [
  { id: "hiking", label: "Hiking", priceAdd: 30 },
  { id: "snorkeling", label: "Snorkeling", priceAdd: 45 },
  { id: "cultural_tour", label: "Cultural Tour", priceAdd: 25 },
  { id: "food_tasting", label: "Food Tasting", priceAdd: 35 },
  { id: "adventure_sports", label: "Adventure Sports", priceAdd: 50 },
  { id: "wildlife_safari", label: "Wildlife Safari", priceAdd: 60 },
  { id: "night_experience", label: "Night Experience", priceAdd: 40 },
  { id: "relaxation_spa", label: "Relaxation & Spa", priceAdd: 55 },
];

const ACCOMMODATION_TYPES = {
  budget: { label: "Budget Hostel", priceAdd: 0 },
  standard: { label: "3-Star Hotel", priceAdd: 50 },
  comfort: { label: "4-Star Hotel", priceAdd: 120 },
  luxury: { label: "5-Star Resort", priceAdd: 250 },
};

export default function TourCustomizer({ tour, onPriceChange }) {
  const [travelers, setTravelers] = useState(1);
  const [duration, setDuration] = useState(tour.duration_days);
  const [accommodation, setAccommodation] = useState("standard");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculatePrice();
  }, [travelers, duration, accommodation, selectedActivities]);

  const calculatePrice = async () => {
    setLoading(true);
    const activityCost = selectedActivities.reduce((sum, actId) => {
      const activity = ACTIVITIES.find(a => a.id === actId);
      return sum + (activity?.priceAdd || 0);
    }, 0);

    const accommodationCost = ACCOMMODATION_TYPES[accommodation]?.priceAdd || 0;
    const basePricePerDay = tour.price_per_person / tour.duration_days;
    
    const durationCost = basePricePerDay * duration;
    const activitiesCost = activityCost * duration;
    const accommodationTotalCost = accommodationCost * duration;
    
    const finalPrice = (durationCost + activitiesCost + accommodationTotalCost) * travelers;
    
    setTotalPrice(finalPrice);
    onPriceChange(finalPrice);
    setLoading(false);
  };

  const toggleActivity = (actId) => {
    setSelectedActivities(prev =>
      prev.includes(actId) ? prev.filter(a => a !== actId) : [...prev, actId]
    );
  };

  const priceBreakdown = {
    basePrice: tour.price_per_person,
    activityAddOns: selectedActivities.reduce((sum, actId) => {
      const activity = ACTIVITIES.find(a => a.id === actId);
      return sum + (activity?.priceAdd || 0);
    }, 0),
    accommodationAddOn: ACCOMMODATION_TYPES[accommodation]?.priceAdd || 0,
  };

  return (
    <div className="space-y-6">
      {/* Travelers & Duration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Travelers & Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Number of Travelers</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setTravelers(num)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      travelers === num
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                {travelers > 5 && (
                  <span className="text-sm text-slate-600 self-center">+{travelers}</span>
                )}
              </div>
            </div>

            <div>
              <Label>Tour Duration</Label>
              <MobileSelect value={String(duration)} onValueChange={(v) => setDuration(Number(v))} placeholder="Tour Duration">
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[tour.duration_days, ...Array.from({ length: 5 }, (_, i) => tour.duration_days + (i + 1) * 2)].map(d => (
                      <SelectItem key={d} value={String(d)}>
                        {d} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileSelect>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accommodation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-500" />
              Accommodation Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(ACCOMMODATION_TYPES).map(([key, { label, priceAdd }]) => (
                <div
                  key={key}
                  onClick={() => setAccommodation(key)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    accommodation === key
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900">{label}</span>
                    {priceAdd > 0 && (
                      <Badge variant="outline" className="bg-slate-50">
                        +${priceAdd}/night
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activities */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Activities (Select Multiple)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACTIVITIES.map(activity => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedActivities.includes(activity.id)
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedActivities.includes(activity.id)}
                      onCheckedChange={() => toggleActivity(activity.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{activity.label}</p>
                      <p className="text-xs text-slate-500">+${activity.priceAdd}/day</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <TrendingUp className="w-5 h-5" />
              Price Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Base Price ({duration} days × {travelers} travelers)</span>
                <span className="font-semibold">${((tour.price_per_person / tour.duration_days) * duration * travelers).toFixed(2)}</span>
              </div>
              {priceBreakdown.activityAddOns > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Activities ({duration} days)</span>
                  <span className="font-semibold text-green-600">+${(priceBreakdown.activityAddOns * duration).toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.accommodationAddOn > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Accommodation ({duration} nights)</span>
                  <span className="font-semibold text-green-600">+${(priceBreakdown.accommodationAddOn * duration).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-amber-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-lg text-amber-900">Total Price</span>
              <span className="text-3xl font-bold text-amber-600">${totalPrice.toFixed(2)}</span>
            </div>
            {selectedActivities.length > 0 && (
              <p className="text-xs text-amber-700 bg-white/50 rounded p-2">
                ✓ {selectedActivities.length} {selectedActivities.length === 1 ? 'activity' : 'activities'} added
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
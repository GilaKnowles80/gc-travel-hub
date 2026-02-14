import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, MapPin, Calendar, DollarSign, Heart } from "lucide-react";
import { motion } from "framer-motion";
import AssistantChat from "../components/assistant/AssistantChat";

export default function TravelAssistant() {
  const [preferences, setPreferences] = useState({
    budget: "",
    interests: "",
    dates: "",
    destination: ""
  });

  const interestOptions = [
    "Adventure", "Beach", "Culture", "Food", "Wildlife", "History", "Relaxation", "Shopping", "Photography"
  ];

  const budgetOptions = [
    { label: "Budget ($1-2k)", value: "1000-2000" },
    { label: "Moderate ($2-5k)", value: "2000-5000" },
    { label: "Comfortable ($5-10k)", value: "5000-10000" },
    { label: "Luxury ($10k+)", value: "10000+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">AI Travel Assistant</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get personalized travel recommendations, plan your itinerary, and discover your next adventure with our intelligent travel companion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24 border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Your Preferences
              </h2>

              <div className="space-y-4">
                {/* Budget */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </label>
                  <Select value={preferences.budget} onValueChange={(value) => setPreferences({ ...preferences, budget: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Travel Dates */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    When
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Next month, March 2026"
                    value={preferences.dates}
                    onChange={(e) => setPreferences({ ...preferences, dates: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <Button
                        key={interest}
                        onClick={() => setPreferences({
                          ...preferences,
                          interests: preferences.interests === interest ? "" : interest
                        })}
                        variant={preferences.interests === interest ? "default" : "outline"}
                        className={`text-xs rounded-full ${
                          preferences.interests === interest
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : ""
                        }`}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2">Destination (optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g., Philippines, Southeast Asia"
                    value={preferences.destination}
                    onChange={(e) => setPreferences({ ...preferences, destination: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <AssistantChat context={{
              budget: preferences.budget,
              interests: preferences.interests,
              dates: preferences.dates,
              destination: preferences.destination
            }} />
          </motion.div>
        </div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: "🎯", title: "Get Recommendations", desc: "Tell us your budget and interests for personalized suggestions" },
            { icon: "📅", title: "Plan Itineraries", desc: "Create detailed day-by-day plans for your perfect trip" },
            { icon: "❓", title: "Ask Questions", desc: "Get answers about visas, packing, best times to visit, and more" }
          ].map((tip, i) => (
            <Card key={i} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{tip.title}</h3>
              <p className="text-sm text-slate-600">{tip.desc}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
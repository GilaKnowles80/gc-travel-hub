import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Heart, Settings, History, Loader2 } from "lucide-react";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import TravelPreferencesTab from "../components/profile/TravelPreferencesTab";
import BookingHistoryTab from "../components/profile/BookingHistoryTab";
import FavoritesTab from "../components/profile/FavoritesTab";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me(),
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your account and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab user={user} />
          </TabsContent>

          <TabsContent value="preferences">
            <TravelPreferencesTab user={user} />
          </TabsContent>

          <TabsContent value="history">
            <BookingHistoryTab user={user} />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
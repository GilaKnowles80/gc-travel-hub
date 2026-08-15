import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Heart, Settings, History, Loader2, MapPin, Route, Plane, Hotel, Shield, Wallet, FileText } from "lucide-react";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import TravelPreferencesTab from "../components/profile/TravelPreferencesTab";
import BookingHistoryTab from "../components/profile/BookingHistoryTab";
import FavoritesTab from "../components/profile/FavoritesTab";
import SavedItinerariesTab from "../components/profile/SavedItinerariesTab";
import SavedTravelersTab from "../components/profile/SavedTravelersTab";
import SavedGuestsTab from "../components/profile/SavedGuestsTab";
import PrivacySecurityTab from "../components/profile/PrivacySecurityTab";
import WalletCard from "../components/wallet/WalletCard";
import BusinessDocuments from "../components/profile/BusinessDocuments";

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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-10 gap-2 bg-white p-1 rounded-xl shadow-sm overflow-x-auto">
            <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Wallet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="travelers" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Plane className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Travelers</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Hotel className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="trips" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Trips</span>
            </TabsTrigger>
            <TabsTrigger value="itineraries" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Route className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Itineraries</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white whitespace-nowrap">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab user={user} />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletCard userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="travelers">
            <SavedTravelersTab user={user} />
          </TabsContent>

          <TabsContent value="guests">
            <SavedGuestsTab user={user} />
          </TabsContent>

          <TabsContent value="preferences">
            <TravelPreferencesTab user={user} />
          </TabsContent>

          <TabsContent value="history">
            <BookingHistoryTab user={user} />
          </TabsContent>

          <TabsContent value="trips">
            <BookingHistoryTab user={user} isPastTrips={true} />
          </TabsContent>

          <TabsContent value="itineraries">
            <SavedItinerariesTab user={user} />
          </TabsContent>

          <TabsContent value="security">
            <PrivacySecurityTab user={user} />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab user={user} />
          </TabsContent>

          <TabsContent value="documents">
            <BusinessDocuments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
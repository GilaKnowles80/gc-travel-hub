import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MapPin, Heart, Settings } from "lucide-react";
import AIRecommendations from "./AIRecommendations";

export default function DiscoverFlights({ onSelectFlight }) {
    const [activeTab, setActiveTab] = useState("personalized");
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState({
        interests: [],
        budget: { min: 0, max: 5000 },
        preferred_cabin_class: 'economy',
        flexible_dates: true,
        dream_destinations: []
    });

    React.useEffect(() => {
        base44.auth.me().then(async (userData) => {
            setUser(userData);
            // Load existing preferences
            const prefs = await base44.entities.UserFlightPreferences.filter({ 
                user_email: userData.email 
            });
            if (prefs[0]) {
                setPreferences(prefs[0]);
            }
        }).catch(() => setUser(null));
    }, []);

    const interestOptions = [
        "Beach & Relaxation",
        "Adventure & Hiking",
        "Culture & History",
        "Food & Cuisine",
        "Shopping",
        "Nightlife",
        "Nature & Wildlife",
        "Art & Museums",
        "Sports",
        "Family Fun"
    ];

    const handleSavePreferences = async () => {
        if (!user) return;

        const existing = await base44.entities.UserFlightPreferences.filter({ 
            user_email: user.email 
        });

        const prefData = {
            ...preferences,
            user_email: user.email,
            last_updated: new Date().toISOString()
        };

        if (existing[0]) {
            await base44.entities.UserFlightPreferences.update(existing[0].id, prefData);
        } else {
            await base44.entities.UserFlightPreferences.create(prefData);
        }
    };

    const toggleInterest = (interest) => {
        setPreferences(prev => ({
            ...prev,
            interests: prev.interests?.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...(prev.interests || []), interest]
        }));
    };

    const addDreamDestination = (destination) => {
        if (destination && !preferences.dream_destinations?.includes(destination)) {
            setPreferences(prev => ({
                ...prev,
                dream_destinations: [...(prev.dream_destinations || []), destination]
            }));
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI-Powered Flight Discovery
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        Let AI help you discover amazing flight deals and destinations tailored to your preferences
                    </p>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personalized">
                        <Sparkles className="w-4 h-4 mr-2" />
                        For You
                    </TabsTrigger>
                    <TabsTrigger value="discover">
                        <MapPin className="w-4 h-4 mr-2" />
                        Discover
                    </TabsTrigger>
                    <TabsTrigger value="dream">
                        <Heart className="w-4 h-4 mr-2" />
                        Dream Trips
                    </TabsTrigger>
                    <TabsTrigger value="preferences">
                        <Settings className="w-4 h-4 mr-2" />
                        Preferences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personalized">
                    <AIRecommendations
                        type="personalized"
                        preferences={preferences}
                        budget={preferences.budget}
                        onSelectFlight={onSelectFlight}
                    />
                </TabsContent>

                <TabsContent value="discover">
                    <AIRecommendations
                        type="discover"
                        preferences={preferences}
                        budget={preferences.budget}
                        onSelectFlight={onSelectFlight}
                    />
                </TabsContent>

                <TabsContent value="dream">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Dream Destinations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a dream destination..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addDreamDestination(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>

                                {preferences.dream_destinations?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.dream_destinations.map((dest, idx) => (
                                            <div key={idx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                                                {dest}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <AIRecommendations
                            type="dream"
                            preferences={preferences}
                            budget={preferences.budget}
                            onSelectFlight={onSelectFlight}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Travel Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold mb-3 block">Travel Interests</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {interestOptions.map((interest) => (
                                        <div key={interest} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={preferences.interests?.includes(interest)}
                                                onCheckedChange={() => toggleInterest(interest)}
                                            />
                                            <Label className="text-sm cursor-pointer">
                                                {interest}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-semibold mb-3 block">Budget Range (USD)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm">Minimum</Label>
                                        <Input
                                            type="number"
                                            value={preferences.budget?.min || 0}
                                            onChange={(e) => setPreferences(prev => ({
                                                ...prev,
                                                budget: { ...prev.budget, min: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm">Maximum</Label>
                                        <Input
                                            type="number"
                                            value={preferences.budget?.max || 5000}
                                            onChange={(e) => setPreferences(prev => ({
                                                ...prev,
                                                budget: { ...prev.budget, max: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={preferences.flexible_dates}
                                    onCheckedChange={(checked) => setPreferences(prev => ({
                                        ...prev,
                                        flexible_dates: checked
                                    }))}
                                />
                                <Label>I'm flexible with travel dates</Label>
                            </div>

                            <Button
                                onClick={handleSavePreferences}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                                Save Preferences
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
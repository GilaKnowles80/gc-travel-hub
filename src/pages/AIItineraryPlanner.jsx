import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, MapPin, Calendar, DollarSign, Users, Compass, Check } from "lucide-react";
import { toast } from "sonner";
import AIItineraryDisplay from "@/components/itinerary/AIItineraryDisplay";

const interestOptions = [
    "Culture & History", "Adventure", "Beach & Relaxation", "Food & Cuisine",
    "Nature & Wildlife", "Shopping", "Nightlife", "Photography",
    "Art & Museums", "Sports", "Wellness & Spa", "Local Experiences"
];

const travelStyleOptions = [
    { value: "luxury", label: "Luxury - Premium experiences" },
    { value: "comfort", label: "Comfort - Balance of quality and value" },
    { value: "budget", label: "Budget - Cost-effective travel" },
    { value: "backpacker", label: "Backpacker - Authentic local experiences" }
];

export default function AIItineraryPlanner() {
    const [user, setUser] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItinerary, setGeneratedItinerary] = useState(null);
    const [formData, setFormData] = useState({
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        interests: [],
        travelStyle: "comfort",
        travelers: 1
    });

    React.useEffect(() => {
        base44.auth.me().then(setUser).catch(() => setUser(null));
    }, []);

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.interests.length === 0) {
            toast.error('Please select at least one interest');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await base44.functions.invoke('generateAIItinerary', formData);
            
            if (response.data.success) {
                setGeneratedItinerary(response.data.itinerary);
                toast.success('Itinerary generated successfully!');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate itinerary: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Sparkles className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                        <p className="text-slate-600">Please log in to use the AI Itinerary Planner</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (generatedItinerary) {
        return (
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <Button 
                        onClick={() => setGeneratedItinerary(null)}
                        variant="outline"
                        className="mb-6"
                    >
                        ← Create New Itinerary
                    </Button>
                    <AIItineraryDisplay itinerary={generatedItinerary} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4 bg-white px-6 py-3 rounded-full shadow-lg">
                        <Sparkles className="w-8 h-8 text-amber-600" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            AI Itinerary Planner
                        </h1>
                    </div>
                    <p className="text-lg text-slate-600">
                        Let AI craft your perfect trip itinerary in seconds
                    </p>
                </div>

                <Card className="border-2 border-amber-200 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                        <CardTitle>Plan Your Dream Trip</CardTitle>
                        <CardDescription>
                            Tell us about your travel preferences and we'll create a personalized itinerary
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleGenerate} className="space-y-6">
                            {/* Destination */}
                            <div>
                                <Label htmlFor="destination" className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                    Destination *
                                </Label>
                                <Input
                                    id="destination"
                                    placeholder="e.g., Paris, Tokyo, Bali"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate" className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-amber-600" />
                                        Start Date *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate" className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-amber-600" />
                                        End Date *
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Budget & Travelers */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="budget" className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-amber-600" />
                                        Budget per Person (USD) *
                                    </Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="2000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="travelers" className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-amber-600" />
                                        Number of Travelers
                                    </Label>
                                    <Input
                                        id="travelers"
                                        type="number"
                                        min="1"
                                        value={formData.travelers}
                                        onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Travel Style */}
                            <div>
                                <Label htmlFor="travelStyle" className="flex items-center gap-2 mb-2">
                                    <Compass className="w-4 h-4 text-amber-600" />
                                    Travel Style
                                </Label>
                                <Select
                                    value={formData.travelStyle}
                                    onValueChange={(value) => setFormData({ ...formData, travelStyle: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {travelStyleOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Interests */}
                            <div>
                                <Label className="mb-3 block">
                                    Interests * (Select at least one)
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {interestOptions.map(interest => (
                                        <Badge
                                            key={interest}
                                            onClick={() => handleInterestToggle(interest)}
                                            className={`cursor-pointer transition-all ${
                                                formData.interests.includes(interest)
                                                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {formData.interests.includes(interest) && (
                                                <Check className="w-3 h-3 mr-1" />
                                            )}
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-lg py-6"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Your Perfect Itinerary...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate AI Itinerary
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>AI-powered itineraries include flights, hotels, activities, restaurants, and local tips</p>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Heart, Loader2, MapPin, DollarSign, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AIRecommendations({ type, preferences, budget, onSelectFlight }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { data: recommendations, isLoading, refetch } = useQuery({
        queryKey: ['ai-recommendations', type, preferences, budget],
        queryFn: async () => {
            const response = await base44.functions.invoke('aiFlightRecommendations', {
                type,
                preferences,
                budget
            });
            return response.data;
        },
        enabled: false
    });

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await refetch();
        setIsAnalyzing(false);
    };

    const getIcon = () => {
        if (type === 'personalized') return <Sparkles className="w-5 h-5" />;
        if (type === 'discover') return <MapPin className="w-5 h-5" />;
        if (type === 'dream') return <Heart className="w-5 h-5" />;
        return <TrendingUp className="w-5 h-5" />;
    };

    const getTitle = () => {
        if (type === 'personalized') return "✨ Personalized for You";
        if (type === 'discover') return "🗺️ Discover New Places";
        if (type === 'dream') return "💭 Dream Destinations";
        return "AI Recommendations";
    };

    return (
        <div className="space-y-4">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getIcon()}
                            <CardTitle>{getTitle()}</CardTitle>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || isLoading}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                            {isAnalyzing || isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Get AI Recommendations
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                {recommendations && (
                    <CardContent className="space-y-4">
                        {recommendations.insights && (
                            <div className="p-4 bg-white rounded-lg border border-amber-200">
                                <p className="text-sm text-slate-600">{recommendations.insights}</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {recommendations.recommendations?.map((rec, index) => (
                                <motion.div
                                    key={rec.flight_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-amber-400">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                            {Math.round(rec.match_score || 85)}% Match
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">{rec.reason}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {rec.highlights?.map((highlight, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                                                        <span className="text-sm text-slate-700">{highlight}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {rec.savings && (
                                                <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-700">{rec.savings}</span>
                                                </div>
                                            )}

                                            <Button
                                                onClick={() => onSelectFlight(rec.flight_id)}
                                                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                            >
                                                View Flight Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Plane, Hotel, MapPin, DollarSign, Calendar, Clock, 
    Utensils, Backpack, Lightbulb, Bus, Download, Share2
} from "lucide-react";
import moment from "moment";
import { toast } from "sonner";

export default function AIItineraryDisplay({ itinerary }) {
    const handleShare = () => {
        const text = `Check out my ${itinerary.title}!`;
        if (navigator.share) {
            navigator.share({ title: itinerary.title, text });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const handleDownload = () => {
        const content = JSON.stringify(itinerary, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `itinerary-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Itinerary downloaded');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-3xl mb-3">{itinerary.title}</CardTitle>
                            <p className="text-slate-700 text-lg mb-4">{itinerary.summary}</p>
                            <div className="flex flex-wrap gap-3">
                                <Badge className="bg-amber-600 text-white text-sm px-3 py-1">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    Total: ${itinerary.total_estimated_cost}
                                </Badge>
                                <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {itinerary.daily_itinerary.length} Days
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleShare} variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                            </Button>
                            <Button onClick={handleDownload} variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Flight Recommendation */}
            {itinerary.recommended_flight && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-blue-600" />
                            Recommended Flights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-900">Outbound</p>
                                <p className="text-slate-600">{itinerary.recommended_flight.outbound}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                                ${itinerary.recommended_flight.estimated_cost / 2}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-900">Return</p>
                                <p className="text-slate-600">{itinerary.recommended_flight.return}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                                ${itinerary.recommended_flight.estimated_cost / 2}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hotel Recommendation */}
            {itinerary.recommended_hotel && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5 text-purple-600" />
                            Recommended Accommodation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-900 text-lg">
                                    {itinerary.recommended_hotel.name}
                                </p>
                                <p className="text-slate-600 flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {itinerary.recommended_hotel.location}
                                </p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">
                                ${itinerary.recommended_hotel.estimated_cost}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Daily Itinerary */}
            <div className="space-y-4">
                {itinerary.daily_itinerary.map((day) => (
                    <Card key={day.day} className="border-l-4 border-l-amber-500">
                        <CardHeader className="bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">
                                        Day {day.day}: {day.title}
                                    </CardTitle>
                                    <p className="text-slate-600 text-sm mt-1">
                                        {moment(day.date).format('dddd, MMMM D, YYYY')}
                                    </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    ${day.estimated_daily_cost}/day
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {/* Activities */}
                            <div className="space-y-3">
                                {day.activities.map((activity, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-amber-700">
                                                <Clock className="w-4 h-4" />
                                                {activity.time}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="font-semibold text-slate-900">{activity.activity}</p>
                                                {activity.estimated_cost > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        ${activity.estimated_cost}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-slate-600 text-sm">{activity.description}</p>
                                            {activity.location && (
                                                <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {activity.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Meals */}
                            {day.meals && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-orange-600" />
                                        Meal Recommendations
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        {day.meals.breakfast && (
                                            <div className="bg-orange-50 p-2 rounded">
                                                <p className="font-medium text-orange-900">Breakfast</p>
                                                <p className="text-orange-700">{day.meals.breakfast}</p>
                                            </div>
                                        )}
                                        {day.meals.lunch && (
                                            <div className="bg-orange-50 p-2 rounded">
                                                <p className="font-medium text-orange-900">Lunch</p>
                                                <p className="text-orange-700">{day.meals.lunch}</p>
                                            </div>
                                        )}
                                        {day.meals.dinner && (
                                            <div className="bg-orange-50 p-2 rounded">
                                                <p className="font-medium text-orange-900">Dinner</p>
                                                <p className="text-orange-700">{day.meals.dinner}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Packing List */}
                {itinerary.packing_list && itinerary.packing_list.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Backpack className="w-5 h-5 text-green-600" />
                                Packing List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1.5">
                                {itinerary.packing_list.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Local Tips */}
                {itinerary.local_tips && itinerary.local_tips.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                Local Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1.5">
                                {itinerary.local_tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-yellow-600 mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Transportation */}
            {itinerary.transportation_tips && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bus className="w-5 h-5 text-blue-600" />
                            Transportation Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700">{itinerary.transportation_tips}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
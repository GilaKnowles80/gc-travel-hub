import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Hotel, Calendar, Clock } from "lucide-react";
import moment from "moment";

export default function ItineraryDayView({ itinerary }) {
  const startDate = moment(itinerary.start_date);
  const endDate = moment(itinerary.end_date);
  const days = endDate.diff(startDate, "days") + 1;

  const daysList = Array.from({ length: days }, (_, i) => {
    const date = moment(startDate).add(i, "days");
    const dateStr = date.format("YYYY-MM-DD");
    
    const dayItems = (itinerary.items || []).filter((item) => {
      const itemStart = moment(item.start_date).format("YYYY-MM-DD");
      const itemEnd = item.end_date ? moment(item.end_date).format("YYYY-MM-DD") : itemStart;
      return dateStr >= itemStart && dateStr <= itemEnd;
    });

    return { date, dateStr, items: dayItems };
  });

  const getIcon = (type) => {
    switch (type) {
      case "flight":
        return <Plane className="w-5 h-5 text-amber-500" />;
      case "hotel":
        return <Hotel className="w-5 h-5 text-amber-500" />;
      case "tour":
        return <MapPin className="w-5 h-5 text-amber-500" />;
      default:
        return <Calendar className="w-5 h-5 text-amber-500" />;
    }
  };

  if (!itinerary.items || itinerary.items.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No bookings added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {daysList.map((day, idx) => (
        <div key={idx}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              {idx + 1}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{day.date.format("dddd")}</h3>
              <p className="text-sm text-slate-600">{day.date.format("MMMM D, YYYY")}</p>
            </div>
          </div>

          {day.items.length === 0 ? (
            <Card className="rounded-2xl ml-16 mb-4">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">No activities scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 ml-16">
              {day.items.map((item, itemIdx) => (
                <Card key={itemIdx} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        {getIcon(item.booking_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {item.booking_type === "flight" && item.booking_data?.route}
                              {item.booking_type === "tour" && item.booking_data?.tour_title}
                              {item.booking_type === "hotel" && item.booking_data?.hotel_name}
                            </h4>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {item.booking_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          {item.booking_type === "flight" && (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {item.booking_data?.departure_time && 
                                  moment(item.booking_data.departure_time).format("h:mm A")}
                              </div>
                              <div>Flight {item.booking_data?.flight_number}</div>
                            </>
                          )}
                          {item.booking_type === "hotel" && (
                            <>
                              <div>Check-in: {moment(item.start_date).format("MMM D")}</div>
                              {item.end_date && (
                                <div>Check-out: {moment(item.end_date).format("MMM D")}</div>
                              )}
                              <div>Room: {item.booking_data?.room_type}</div>
                            </>
                          )}
                          {item.booking_type === "tour" && (
                            <>
                              <div>{item.booking_data?.destination}</div>
                              <div>{item.booking_data?.number_of_travelers} traveler(s)</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
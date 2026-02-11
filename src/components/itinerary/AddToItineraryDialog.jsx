import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AddToItineraryDialog({ open, onClose, itineraryId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("flights");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: itinerary } = useQuery({
    queryKey: ["itinerary", itineraryId],
    queryFn: async () => await base44.entities.Itinerary.get(itineraryId),
    enabled: !!itineraryId,
  });

  const { data: flightBookings = [] } = useQuery({
    queryKey: ["user-flight-bookings"],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.FlightBooking.filter({ created_by: user.email, status: "confirmed" });
    },
    enabled: !!user && open,
  });

  const { data: tourBookings = [] } = useQuery({
    queryKey: ["user-tour-bookings"],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Booking.filter({ created_by: user.email, status: "confirmed" });
    },
    enabled: !!user && open,
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ["user-hotel-bookings"],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.HotelBooking.filter({ created_by: user.email, status: "confirmed" });
    },
    enabled: !!user && open,
  });

  const addMutation = useMutation({
    mutationFn: async ({ booking, type }) => {
      const existingItems = itinerary.items || [];
      const newItem = {
        booking_type: type,
        booking_id: booking.id,
        booking_data: booking,
        start_date: type === "flight" ? booking.departure_time : 
                    type === "hotel" ? booking.check_in_date : booking.departure_date,
        end_date: type === "hotel" ? booking.check_out_date : null,
      };
      await base44.entities.Itinerary.update(itineraryId, {
        items: [...existingItems, newItem],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      toast.success("Added to itinerary");
      onClose();
    },
  });

  const existingBookingIds = (itinerary?.items || []).map(item => item.booking_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Booking to Itinerary</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
          </TabsList>

          <TabsContent value="flights" className="space-y-3 mt-4">
            {flightBookings.filter(b => !existingBookingIds.includes(b.id)).map((booking) => (
              <Card key={booking.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.route}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {booking.departure_time && moment(booking.departure_time).format("MMM D, YYYY")}
                      </p>
                      <Badge variant="outline" className="mt-2">{booking.cabin_class}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addMutation.mutate({ booking, type: "flight" })}
                      disabled={addMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 rounded-lg"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {flightBookings.filter(b => !existingBookingIds.includes(b.id)).length === 0 && (
              <p className="text-center text-slate-500 py-8">No available flight bookings</p>
            )}
          </TabsContent>

          <TabsContent value="tours" className="space-y-3 mt-4">
            {tourBookings.filter(b => !existingBookingIds.includes(b.id)).map((booking) => (
              <Card key={booking.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.tour_title}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {booking.departure_date && moment(booking.departure_date).format("MMM D, YYYY")}
                      </p>
                      <Badge variant="outline" className="mt-2">{booking.number_of_travelers} travelers</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addMutation.mutate({ booking, type: "tour" })}
                      disabled={addMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 rounded-lg"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tourBookings.filter(b => !existingBookingIds.includes(b.id)).length === 0 && (
              <p className="text-center text-slate-500 py-8">No available tour bookings</p>
            )}
          </TabsContent>

          <TabsContent value="hotels" className="space-y-3 mt-4">
            {hotelBookings.filter(b => !existingBookingIds.includes(b.id)).map((booking) => (
              <Card key={booking.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.hotel_name}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {booking.check_in_date && moment(booking.check_in_date).format("MMM D")} - {booking.check_out_date && moment(booking.check_out_date).format("MMM D, YYYY")}
                      </p>
                      <Badge variant="outline" className="mt-2">{booking.room_type}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addMutation.mutate({ booking, type: "hotel" })}
                      disabled={addMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 rounded-lg"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hotelBookings.filter(b => !existingBookingIds.includes(b.id)).length === 0 && (
              <p className="text-center text-slate-500 py-8">No available hotel bookings</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import moment from "moment";
import LocationMap from "../components/shared/LocationMap";
import ReviewList from "../components/reviews/ReviewList";
import ReviewForm from "../components/reviews/ReviewForm";

export default function HotelDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get("id");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    trip_type: "roundtrip",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    check_in_date: "",
    check_out_date: "",
    number_of_rooms: 1,
    number_of_guests: 1,
    special_requests: "",
  });

  const queryClient = useQueryClient();

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: () => base44.entities.Hotel.filter({ id: hotelId }),
    select: (data) => data?.[0],
    enabled: !!hotelId,
  });

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.HotelBooking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel-bookings"] });
      setBookingStep(3);
    },
  });

  const handleBooking = (roomType) => {
    setSelectedRoom(roomType);
    setShowBooking(true);
    setBookingStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingStep === 1) {
      setBookingStep(2);
    } else if (bookingStep === 2) {
      const nights = moment(formData.check_out_date).diff(moment(formData.check_in_date), "days");
      const tripMultiplier = formData.trip_type === "roundtrip" ? 2 : 1;
      bookingMutation.mutate({
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        room_type: selectedRoom.type,
        total_price: selectedRoom.price_per_night * nights * formData.number_of_rooms * tripMultiplier,
        ...formData,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-600">Hotel not found</h2>
        <Link to={createPageUrl("Hotels")}>
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link to={createPageUrl("Hotels")}>
            <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: hotel.star_rating || 3 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">{hotel.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-white/80">
              <MapPin className="w-4 h-4" />
              {hotel.location}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Hotel</h2>
              <p className="text-slate-600 leading-relaxed">
                {hotel.description || "Experience comfort and luxury at this wonderful hotel."}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Location
              </h3>
              <p className="text-slate-600 mb-4">{hotel.address || hotel.location}</p>
              <LocationMap
                lat={14.5995}
                lng={120.9842}
                title={hotel.name}
                className="h-80 border border-slate-200"
              />
            </motion.div>

            {hotel.amenities?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, i) => (
                    <Badge key={i} variant="outline" className="rounded-xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Available Rooms</h3>
              <div className="space-y-4">
                {hotel.room_types?.map((room, i) => (
                  <Card key={i} className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">{room.type}</h4>
                        <p className="text-sm text-slate-500 mb-3">Up to {room.capacity} guests</p>
                        {room.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 3).map((amenity, j) => (
                              <Badge key={j} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 mb-1">
                          ${room.price_per_night?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mb-3">per night</p>
                        <Button
                          onClick={() => handleBooking(room)}
                          className="bg-amber-500 hover:bg-amber-600 rounded-xl"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
              >
                <h3 className="font-bold text-slate-900 mb-4">Location</h3>
                <div className="flex items-start gap-2 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-amber-500" />
                  <p>{hotel.address || hotel.location}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Book {selectedRoom?.type}</DialogTitle>
          </DialogHeader>
          {bookingStep === 3 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
              <p className="text-slate-600 mb-6">Your hotel reservation has been created.</p>
              <Button onClick={() => setShowBooking(false)} className="bg-amber-500 hover:bg-amber-600 rounded-xl">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {bookingStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Trip Type *</Label>
                    <Select value={formData.trip_type} onValueChange={(value) => setFormData({ ...formData, trip_type: value })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roundtrip">Round Trip</SelectItem>
                        <SelectItem value="one_way">One Way</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      required
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.guest_email}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      required
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Check-in *</Label>
                      <Input
                        type="date"
                        required
                        value={formData.check_in_date}
                        onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out *</Label>
                      <Input
                        type="date"
                        required
                        value={formData.check_out_date}
                        onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Rooms *</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={formData.number_of_rooms}
                        onChange={(e) => setFormData({ ...formData, number_of_rooms: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guests *</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={formData.number_of_guests}
                        onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Special Requests</Label>
                    <Textarea
                      placeholder="Early check-in, extra towels, etc..."
                      value={formData.special_requests}
                      onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                      className="rounded-xl h-24"
                    />
                  </div>
                  {formData.check_in_date && formData.check_out_date && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Trip Type:</span>
                        <span className="font-medium">{formData.trip_type === "roundtrip" ? "Round Trip" : "One Way"}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Nights:</span>
                        <span className="font-medium">
                          {moment(formData.check_out_date).diff(moment(formData.check_in_date), "days")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Price per night:</span>
                        <span className="font-medium">${selectedRoom?.price_per_night?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Rooms:</span>
                        <span className="font-medium">{formData.number_of_rooms}</span>
                      </div>
                      <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-amber-600">
                          $
                          {(
                            selectedRoom?.price_per_night *
                            moment(formData.check_out_date).diff(moment(formData.check_in_date), "days") *
                            formData.number_of_rooms *
                            (formData.trip_type === "roundtrip" ? 2 : 1)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                {bookingStep === 2 && (
                  <Button type="button" variant="outline" onClick={() => setBookingStep(1)} className="flex-1 rounded-xl">
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : bookingStep === 1 ? (
                    "Continue"
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews & Ratings</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ReviewList itemType="hotel" itemId={hotel.id} />
          </div>
          <div>
            <ReviewForm
              itemType="hotel"
              itemId={hotel.id}
              itemName={hotel.name}
              bookingId={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
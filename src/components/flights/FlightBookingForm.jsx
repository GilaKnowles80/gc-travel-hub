import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";

export default function FlightBookingForm({ flight, cabinClass, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    trip_type: "round_trip",
    return_date: "",
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    passport_number: "",
    date_of_birth: "",
    number_of_passengers: 1,
    special_requests: "",
  });

  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.FlightBooking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      setStep(3);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const selectedClass = flight.cabin_classes?.find((c) => c.class === cabinClass);
      const tripMultiplier = formData.trip_type === "round_trip" ? 2 : 1;
      bookingMutation.mutate({
        flight_id: flight.id,
        flight_number: flight.flight_number,
        route: `${flight.origin} - ${flight.destination}`,
        cabin_class: cabinClass,
        trip_type: formData.trip_type,
        return_date: formData.return_date || null,
        total_price: (selectedClass?.price || 0) * formData.number_of_passengers * tripMultiplier,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: formData.passenger_phone,
        passport_number: formData.passport_number,
        date_of_birth: formData.date_of_birth,
        number_of_passengers: formData.number_of_passengers,
        special_requests: formData.special_requests,
      });
    }
  };

  if (step === 3) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
        <p className="text-slate-600 mb-6">
          Your flight reservation has been created. Check your email for confirmation details.
        </p>
        <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 rounded-xl">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
        <>
          <div className="space-y-2">
            <Label>Trip Type *</Label>
            <Select value={formData.trip_type} onValueChange={(value) => setFormData({ ...formData, trip_type: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_trip">Round Trip</SelectItem>
                <SelectItem value="one_way">One Way</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.trip_type === "round_trip" && (
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              required
              value={formData.passenger_name}
              onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              required
              value={formData.passenger_email}
              onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              required
              value={formData.passenger_phone}
              onChange={(e) => setFormData({ ...formData, passenger_phone: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Passport Number</Label>
            <Input
              value={formData.passport_number}
              onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="space-y-2">
            <Label>Number of Passengers *</Label>
            <Input
              type="number"
              min="1"
              required
              value={formData.number_of_passengers}
              onChange={(e) => setFormData({ ...formData, number_of_passengers: parseInt(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Special Requests</Label>
            <Textarea
              placeholder="Meal preferences, seat requests, accessibility needs..."
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="rounded-xl h-24"
            />
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Trip Type:</span>
              <span className="font-medium capitalize">{formData.trip_type === "round_trip" ? "Round Trip" : "One Way"}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Cabin Class:</span>
              <span className="font-medium capitalize">{cabinClass.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Price per person:</span>
              <span className="font-medium">
                ${flight.cabin_classes?.find((c) => c.class === cabinClass)?.price?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Passengers:</span>
              <span className="font-medium">{formData.number_of_passengers}</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-amber-600">
                $
                {(
                  (flight.cabin_classes?.find((c) => c.class === cabinClass)?.price || 0) *
                  formData.number_of_passengers *
                  (formData.trip_type === "round_trip" ? 2 : 1)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        {step === 2 && (
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
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
          ) : step === 1 ? (
            "Continue"
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
    </form>
  );
}
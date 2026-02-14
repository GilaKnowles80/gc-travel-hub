import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import SeatMap from "./SeatMap";
import PaymentMethodSelector from "./PaymentMethodSelector";

export default function FlightBookingForm({ flight, cabinClass, onClose }) {
  const [step, setStep] = useState(1); // 1: Flight Details, 2: Passenger Details, 3: Payment
  const [formData, setFormData] = useState({
    trip_type: "round_trip",
    return_date: "",
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    passport_number: "",
    date_of_birth: "",
    adults: 1,
    children: 0,
    seniors: 0,
    infants: 0,
    pwd: 0,
    special_requests: "",
    selected_seats: [],
  });

  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: async (data) => {
      // Check if running in iframe
      if (window.self !== window.top) {
        throw new Error('Payment checkout is only available in the published app. Please open the app in a new tab.');
      }

      try {
        const response = await base44.functions.invoke('createFlightCheckout', data);
        return response.data;
      } catch (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }
    },
    onSuccess: (data) => {
      if (!data.url) {
        alert('Invalid checkout session. Please try again.');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Payment error:', error);
      alert(error.message || 'Payment processing failed. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate flight details step
      if (formData.trip_type === "round_trip" && !formData.return_date) {
        alert("Please select a return date");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate passenger details
      const totalPassengers = formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd;
      if (totalPassengers === 0) {
        alert("Please add at least one passenger");
        return;
      }
      if (formData.selected_seats.length !== totalPassengers) {
        alert("Please select seats for all passengers");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Proceed to payment
      const selectedClass = flight.cabin_classes?.find((c) => c.class === cabinClass);
      const tripMultiplier = formData.trip_type === "round_trip" ? 2 : 1;
      const basePrice = selectedClass?.price || 0;
      
      // Calculate total with discounts
      const totalPassengers = formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd;
      const adultsPrice = formData.adults * basePrice;
      const childrenPrice = formData.children * basePrice;
      const seniorsPrice = formData.seniors * (basePrice * 0.9); // 10% off
      const infantsPrice = formData.infants * (basePrice * 0.5); // 50% off for infants
      const pwdPrice = formData.pwd * (basePrice * 0.9); // 10% off
      const totalPrice = (adultsPrice + childrenPrice + seniorsPrice + infantsPrice + pwdPrice) * tripMultiplier;
      
      bookingMutation.mutate({
        bookingData: {
          flight_id: flight.id,
          flight_number: flight.flight_number,
          route: `${flight.origin} - ${flight.destination}`,
          cabin_class: cabinClass,
          trip_type: formData.trip_type,
          return_date: formData.return_date || null,
          total_price: totalPrice,
          passenger_name: formData.passenger_name,
          passenger_email: formData.passenger_email,
          passenger_phone: formData.passenger_phone,
          passport_number: formData.passport_number,
          date_of_birth: formData.date_of_birth,
          number_of_passengers: totalPassengers,
          selected_seats: formData.selected_seats,
          special_requests: formData.special_requests,
        },
        flightDetails: {
          route: `${flight.origin} - ${flight.destination}`,
          airline: flight.airline_name,
          flightNumber: flight.flight_number,
          cabinClass: cabinClass.replace(/_/g, " "),
        }
      });
    }
  };



  // Progress indicator
  const stepLabels = ['Flight Details', 'Passenger Details', 'Payment'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-amber-500 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className="text-xs mt-2 font-medium">{label}</span>
              </div>
              {index < stepLabels.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > index + 1 ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">1. Flight Details</h3>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Airline:</span>
                <span className="font-medium">{flight.airline_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Flight Number:</span>
                <span className="font-medium">{flight.flight_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Route:</span>
                <span className="font-medium">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cabin Class:</span>
                <span className="font-medium capitalize">{cabinClass.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip-type">Trip Type *</Label>
            <Select value={formData.trip_type} onValueChange={(value) => setFormData({ ...formData, trip_type: value })}>
              <SelectTrigger id="trip-type" className="rounded-xl">
                <SelectValue placeholder="Select trip type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_trip">Round Trip</SelectItem>
                <SelectItem value="one_way">One Way</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.trip_type === "round_trip" && (
            <div className="space-y-2">
              <Label htmlFor="return-date">Return Date</Label>
              <Input
                id="return-date"
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="passenger-name">Full Name *</Label>
            <Input
              id="passenger-name"
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4">2. Passenger Details</h3>
        
          <div className="space-y-3">
            <Label className="text-base font-semibold">Number of Travelers *</Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Adults (18-59 years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Children (2-17 years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Infants (Under 2 years) - 50% off</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.infants}
                  onChange={(e) => setFormData({ ...formData, infants: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Senior Citizens (60+ years) - 10% off</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.seniors}
                  onChange={(e) => setFormData({ ...formData, seniors: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">PWD (Persons with Disability) - 10% off</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.pwd}
                  onChange={(e) => setFormData({ ...formData, pwd: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Select Your Seats</h3>
            <p className="text-sm text-slate-600 mb-4">
              Choose {formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd} seat{(formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd) > 1 ? 's' : ''} for your flight
            </p>
            
            <SeatMap
              cabinClass={cabinClass}
              numberOfPassengers={formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd}
              onSeatsSelected={(seats) => setFormData({ ...formData, selected_seats: seats })}
            />
          </div>

          <div className="space-y-2">
            <Label>Special Requests (Optional)</Label>
            <Textarea
              placeholder="Meal preferences, accessibility needs..."
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="rounded-xl h-24"
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">3. Payment Details</h3>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-slate-900 mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Flight:</span>
                <span className="font-medium">{flight.airline_name} {flight.flight_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Route:</span>
                <span className="font-medium">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Passenger:</span>
                <span className="font-medium">{formData.passenger_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Seats:</span>
                <span className="font-medium">{formData.selected_seats.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Price Breakdown</h3>
            {(() => {
              const basePrice = flight.cabin_classes?.find((c) => c.class === cabinClass)?.price || 0;
              const tripMultiplier = formData.trip_type === "round_trip" ? 2 : 1;
              const adultsPrice = formData.adults * basePrice * tripMultiplier;
              const childrenPrice = formData.children * basePrice * tripMultiplier;
              const seniorsPrice = formData.seniors * (basePrice * 0.9) * tripMultiplier;
              const infantsPrice = formData.infants * (basePrice * 0.5) * tripMultiplier;
              const pwdPrice = formData.pwd * (basePrice * 0.9) * tripMultiplier;
              const totalPrice = adultsPrice + childrenPrice + seniorsPrice + infantsPrice + pwdPrice;
              const totalPassengers = formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd;

              return (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Trip Type:</span>
                    <span className="font-medium">{formData.trip_type === "round_trip" ? "Round Trip" : "One Way"}</span>
                  </div>
                  {formData.adults > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{formData.adults} Adult(s):</span>
                      <span>${adultsPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.children > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{formData.children} Child(ren):</span>
                      <span>${childrenPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.seniors > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{formData.seniors} Senior(s) (10% off):</span>
                      <span>${seniorsPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.pwd > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{formData.pwd} PWD (10% off):</span>
                      <span>${pwdPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.infants > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{formData.infants} Infant(s) (50% off):</span>
                      <span>${infantsPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-300 pt-2 mt-2 flex justify-between font-bold text-base">
                    <span>Total ({totalPassengers} passenger{totalPassengers !== 1 ? 's' : ''}):</span>
                    <span className="text-amber-600">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-6">
            <PaymentMethodSelector />
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> After payment, your e-ticket will be generated and can be sent via email, SMS, or printed.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl">
            Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            bookingMutation.isPending || 
            (step === 2 && formData.selected_seats.length !== (formData.adults + formData.children + formData.seniors + formData.infants + formData.pwd))
          }
          className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl"
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : step === 3 ? (
            "Pay Now"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </form>
  );
}
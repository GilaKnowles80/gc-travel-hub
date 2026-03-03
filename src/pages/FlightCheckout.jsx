import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import BookingSummary from "@/components/checkout/BookingSummary";
import PaymentGuarantee from "@/components/checkout/PaymentGuarantee";
import PriceDisplay from "@/components/currency/PriceDisplay";
import { createPageUrl } from "@/pages/utils";

export default function FlightCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: Details, 2: Addons, 3: Passenger, 4: Review, 5: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutStartTime] = useState(Date.now());

  // Flight data from query params
  const flightId = searchParams.get("flightId");
  const cabinClass = searchParams.get("cabin");
  const departure = searchParams.get("departure");
  const passengers = parseInt(searchParams.get("passengers") || "1");

  const [booking, setBooking] = useState({
    flight_id: flightId,
    cabin_class: cabinClass,
    trip_type: "roundtrip",
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    number_of_passengers: passengers,
    total_price: 0,
  });

  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const ADDON_OPTIONS = [
    { id: "baggage", name: "Extra Baggage (23kg)", price: 2500, description: "Add 23kg extra baggage per passenger" },
    { id: "seat", name: "Premium Seat Selection", price: 1500, description: "Choose your preferred seat" },
    { id: "meal", name: "Extra Meal Service", price: 800, description: "Complimentary meal and beverage" },
    { id: "insurance", name: "Travel Insurance", price: 3500, description: "Full trip protection coverage", popular: true },
  ];

  // Step 1: Passenger Details
  const StepPassengerDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Passenger Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name (Primary Passenger)</Label>
            <Input
              id="name"
              value={booking.passenger_name}
              onChange={(e) => setBooking({ ...booking, passenger_name: e.target.value })}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={booking.passenger_email}
              onChange={(e) => setBooking({ ...booking, passenger_email: e.target.value })}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={booking.passenger_phone}
              onChange={(e) => setBooking({ ...booking, passenger_phone: e.target.value })}
              placeholder="+63 9xx xxx xxxx"
              className="mt-1"
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              For {booking.number_of_passengers > 1 ? `${booking.number_of_passengers} passengers` : "1 passenger"}, you'll enter additional details in the next step.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Step 2: Add-ons
  const StepAddons = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Add-ons (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           {ADDON_OPTIONS.map((addon) => (
             <div key={addon.id} className={`flex items-start gap-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer ${addon.popular ? "border-amber-300 bg-amber-50" : ""}`}>
               <Checkbox
                 id={addon.id}
                 checked={selectedAddons.some((a) => a.id === addon.id)}
                 onCheckedChange={(checked) => {
                   if (checked) {
                     setSelectedAddons([...selectedAddons, addon]);
                   } else {
                     setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
                   }
                 }}
               />
               <div className="flex-1">
                 <div className="flex items-center gap-2">
                   <label htmlFor={addon.id} className="font-medium text-sm cursor-pointer">
                     {addon.name}
                   </label>
                   {addon.popular && <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">Popular</span>}
                 </div>
                 <p className="text-xs text-slate-500 mt-1">{addon.description}</p>
                 <p className="text-sm font-semibold text-amber-600 mt-2">+₱{addon.price.toLocaleString()}</p>
               </div>
             </div>
           ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Step 3: Review
  const StepReview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <BookingSummary booking={booking} type="flight" addons={selectedAddons} />
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Booking Type:</span>
              <span className="font-medium">{booking.trip_type}</span>
            </div>
            <div className="flex justify-between">
              <span>Passenger Name:</span>
              <span className="font-medium">{booking.passenger_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{booking.passenger_email}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const handleNext = () => {
    setError("");
    if (step === 1 && (!booking.passenger_name || !booking.passenger_email)) {
      setError("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      // Check if running in iframe
      if (window.self !== window.top) {
        setError("Checkout must be accessed from the published app. Please click the preview link to access the full app.");
        setLoading(false);
        return;
      }

      // Calculate total with add-ons
      const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
      const totalPrice = booking.total_price + addonsTotal;

      // Save checkout to localStorage for abandonment recovery
      localStorage.setItem("pending_flight_checkout", JSON.stringify({
        ...booking,
        addons: selectedAddons,
        total_price: totalPrice,
        timestamp: Date.now(),
      }));

      const { data } = await base44.functions.invoke("createFlightCheckout", {
        flight_id: booking.flight_id,
        cabin_class: booking.cabin_class,
        passenger_name: booking.passenger_name,
        passenger_email: booking.passenger_email,
        passenger_phone: booking.passenger_phone,
        number_of_passengers: booking.number_of_passengers,
        addons: selectedAddons,
        trip_type: booking.trip_type,
        total_price: totalPrice,
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-amber-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-6">
             {step === 1 && <StepPassengerDetails />}
             {step === 2 && <StepAddons />}
             {step === 3 && <StepReview />}
             {step >= 2 && <PaymentGuarantee />}
           </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <BookingSummary booking={booking} type="flight" addons={selectedAddons} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 max-w-4xl mx-auto">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 && (
            <Button onClick={handleNext} className="flex-1 bg-amber-600 hover:bg-amber-700">
              Next
            </Button>
          )}
          {step === 3 && (
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
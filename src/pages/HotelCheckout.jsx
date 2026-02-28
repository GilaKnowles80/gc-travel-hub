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
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function HotelCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hotelId = searchParams.get("hotelId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const roomType = searchParams.get("roomType");
  const rooms = parseInt(searchParams.get("rooms") || "1");

  const [booking, setBooking] = useState({
    hotel_id: hotelId,
    room_type: roomType,
    check_in_date: checkIn,
    check_out_date: checkOut,
    number_of_rooms: rooms,
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    total_price: 0,
  });

  const [selectedAddons, setSelectedAddons] = useState([]);

  const ADDON_OPTIONS = [
    { id: "breakfast", name: "Daily Breakfast", price: 1500 },
    { id: "parking", name: "Parking Service", price: 800 },
    { id: "wifi", name: "Premium WiFi", price: 500 },
    { id: "late_checkout", name: "Late Checkout (2 PM)", price: 2000 },
  ];

  const StepGuestDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={booking.guest_name}
              onChange={(e) => setBooking({ ...booking, guest_name: e.target.value })}
              placeholder="Jane Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={booking.guest_email}
              onChange={(e) => setBooking({ ...booking, guest_email: e.target.value })}
              placeholder="jane@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={booking.guest_phone}
              onChange={(e) => setBooking({ ...booking, guest_phone: e.target.value })}
              placeholder="+63 9xx xxx xxxx"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StepAddons = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Services & Add-ons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ADDON_OPTIONS.map((addon) => (
            <div key={addon.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
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
                <label htmlFor={addon.id} className="font-medium text-sm cursor-pointer">
                  {addon.name}
                </label>
                <p className="text-xs text-slate-500 mt-1">₱{addon.price.toLocaleString()}/night</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  const StepReview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <BookingSummary booking={booking} type="hotel" addons={selectedAddons} />
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Guest Name:</span>
              <span className="font-medium">{booking.guest_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-in:</span>
              <span className="font-medium">{booking.check_in_date}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out:</span>
              <span className="font-medium">{booking.check_out_date}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const handleNext = () => {
    setError("");
    if (step === 1 && (!booking.guest_name || !booking.guest_email)) {
      setError("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await base44.functions.invoke("createHotelCheckout", {
        hotel_id: booking.hotel_id,
        room_type: booking.room_type,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        number_of_rooms: booking.number_of_rooms,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        addons: selectedAddons,
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
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-amber-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && <StepGuestDetails />}
            {step === 2 && <StepAddons />}
            {step === 3 && <StepReview />}
          </div>

          <div className="lg:col-span-1">
            <BookingSummary booking={booking} type="hotel" addons={selectedAddons} />
          </div>
        </div>

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
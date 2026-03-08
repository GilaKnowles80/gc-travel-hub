import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import BookingSummary from "@/components/checkout/BookingSummary";
import PriceDisplay from "@/components/currency/PriceDisplay";
import { createPageUrl } from "@/pages/utils";

const PRODUCT_TYPES = {
  flight: "Flight",
  hotel: "Hotel",
  tour: "Tour",
  bus: "Bus",
  ferry: "Ferry",
  cruise: "Cruise",
  visa: "Visa",
  car_rental: "Car Rental",
  train: "Train",
};

const ADDON_OPTIONS = {
  flight: [
    { id: "baggage", name: "Extra Baggage (23kg)", price: 2500 },
    { id: "seat", name: "Premium Seat Selection", price: 1500 },
    { id: "meal", name: "Extra Meal Service", price: 800 },
    { id: "insurance", name: "Travel Insurance", price: 3500 },
  ],
  hotel: [
    { id: "breakfast", name: "Breakfast Included", price: 1500 },
    { id: "wifi", name: "High-Speed WiFi", price: 500 },
    { id: "parking", name: "Parking", price: 800 },
    { id: "insurance", name: "Travel Insurance", price: 3500 },
  ],
  default: [
    { id: "insurance", name: "Travel Insurance", price: 3500 },
    { id: "assistance", name: "24/7 Assistance", price: 1000 },
  ],
};

export default function UnifiedCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: Details, 2: Addons, 3: Payment, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnr, setPnr] = useState("");

  // Extract product type and data from params
  const productType = searchParams.get("type") || "flight";
  const itemId = searchParams.get("itemId");
  const basePrice = parseFloat(searchParams.get("price") || "0");
  const itemName = searchParams.get("itemName") || "";

  const [booking, setBooking] = useState({
    product_type: productType,
    item_id: itemId,
    item_name: itemName,
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    number_of_travelers: parseInt(searchParams.get("travelers") || "1"),
    base_price: basePrice,
    total_price: basePrice,
    payment_method: "stripe",
  });

  const [selectedAddons, setSelectedAddons] = useState([]);

  const addonsForProduct = ADDON_OPTIONS[productType] || ADDON_OPTIONS.default;

  // Calculate total price
  useEffect(() => {
    const addonTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    setBooking((prev) => ({
      ...prev,
      total_price: prev.base_price + addonTotal,
    }));
  }, [selectedAddons]);

  // Step 1: Customer Details
  const StepCustomerDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={booking.customer_name}
              onChange={(e) => setBooking({ ...booking, customer_name: e.target.value })}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={booking.customer_email}
              onChange={(e) => setBooking({ ...booking, customer_email: e.target.value })}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={booking.customer_phone}
              onChange={(e) => setBooking({ ...booking, customer_phone: e.target.value })}
              placeholder="+63 9xx xxx xxxx"
              className="mt-1"
            />
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
          <CardTitle>Add-ons (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addonsForProduct.map((addon) => (
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
                <p className="text-xs text-slate-500 mt-1">₱{addon.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Step 3: Payment Method
  const StepPayment = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payment">Select Payment Method</Label>
            <Select value={booking.payment_method} onValueChange={(value) => setBooking({ ...booking, payment_method: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paymongo">PayMongo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Product:</span>
            <span className="font-medium">{PRODUCT_TYPES[productType]} - {booking.item_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Base Price:</span>
            <span>₱<PriceDisplay amount={booking.base_price} fromCurrency="PHP" /></span>
          </div>
          {selectedAddons.length > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Add-ons:</span>
              <span>₱{selectedAddons.reduce((sum, a) => sum + a.price, 0).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-bold text-base">
            <span>Total:</span>
            <span>₱{booking.total_price.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Step 4: Confirmation
  const StepConfirmation = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex gap-4 pt-6">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Booking Confirmed!</h3>
            <p className="text-sm text-green-800 mt-1">
              Your PNR (Passenger Name Record): <span className="font-mono font-bold">{pnr}</span>
            </p>
            <p className="text-sm text-green-800 mt-2">
              A confirmation email has been sent to {booking.customer_email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Name:</span>
            <span className="font-medium">{booking.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="font-medium">{booking.customer_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Product:</span>
            <span className="font-medium">{PRODUCT_TYPES[productType]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Paid:</span>
            <span className="font-medium">₱{booking.total_price.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const handleNext = () => {
    setError("");
    if (step === 1 && (!booking.customer_name || !booking.customer_email || !booking.customer_phone)) {
      setError("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await base44.functions.invoke("processUnifiedCheckout", {
        product_type: booking.product_type,
        item_id: booking.item_id,
        item_name: booking.item_name,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        number_of_travelers: booking.number_of_travelers,
        base_price: booking.base_price,
        total_price: booking.total_price,
        addons: selectedAddons,
        payment_method: booking.payment_method,
      });

      if (data.pnr) {
        setPnr(data.pnr);
        setStep(4);
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Complete Your Booking</h1>
            <p className="text-slate-600 mt-1">{PRODUCT_TYPES[productType]} - {booking.item_name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
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
          <div className="lg:col-span-2">
            {step === 1 && <StepCustomerDetails />}
            {step === 2 && <StepAddons />}
            {step === 3 && <StepPayment />}
            {step === 4 && <StepConfirmation />}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₱{booking.base_price.toLocaleString()}</span>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-slate-600">
                    <span>{addon.name}:</span>
                    <span>₱{addon.price.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-amber-600">₱{booking.total_price.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 max-w-4xl mx-auto">
          {step > 1 && step < 4 && (
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
                "Complete Booking"
              )}
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={() => navigate(createPageUrl("MyBookings"))}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              View My Bookings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/pages/utils";

export default function VisaCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnr, setPnr] = useState("");

  const visaId = searchParams.get("visaId");
  const country = searchParams.get("country");
  const visaType = searchParams.get("type");
  const basePrice = parseFloat(searchParams.get("price") || "0");

  const [booking, setBooking] = useState({
    visa_id: visaId,
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    passport_number: "",
    base_price: basePrice,
    total_price: basePrice,
  });

  const [selectedAddons, setSelectedAddons] = useState([]);

  const ADDON_OPTIONS = [
    { id: "express", name: "Express Processing (3 days)", price: 5000 },
    { id: "assistance", name: "Application Assistance", price: 2500 },
    { id: "courier", name: "Courier Service", price: 1500 },
  ];

  useEffect(() => {
    const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    setBooking((prev) => ({ ...prev, total_price: prev.base_price + addonTotal }));
  }, [selectedAddons]);

  const StepApplicantDetails = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={booking.applicant_name} onChange={(e) => setBooking({ ...booking, applicant_name: e.target.value })} placeholder="John Doe" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="passport">Passport Number</Label>
            <Input id="passport" value={booking.passport_number} onChange={(e) => setBooking({ ...booking, passport_number: e.target.value })} placeholder="XX1234567" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={booking.applicant_email} onChange={(e) => setBooking({ ...booking, applicant_email: e.target.value })} placeholder="john@example.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={booking.applicant_phone} onChange={(e) => setBooking({ ...booking, applicant_phone: e.target.value })} placeholder="+63 9xx xxx xxxx" className="mt-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StepAddons = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Services & Add-ons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ADDON_OPTIONS.map((addon) => (
            <div key={addon.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox id={addon.id} checked={selectedAddons.some((a) => a.id === addon.id)} onCheckedChange={(checked) => { if (checked) setSelectedAddons([...selectedAddons, addon]); else setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id)); }} />
              <div className="flex-1">
                <label htmlFor={addon.id} className="font-medium text-sm cursor-pointer">{addon.name}</label>
                <p className="text-xs text-slate-500 mt-1">₱{addon.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  const StepReview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-600">Destination:</span>
            <span className="font-medium">{country}</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-600">Visa Type:</span>
            <span className="font-medium capitalize">{visaType}</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-600">Applicant:</span>
            <span className="font-medium">{booking.applicant_name}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-amber-600">
            <span>Total:</span>
            <span>₱{booking.total_price.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StepConfirmation = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex gap-4 pt-6">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Application Received!</h3>
            <p className="text-sm text-green-800 mt-1">
              Your Application ID: <span className="font-mono font-bold">{pnr}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const handleNext = () => {
    setError("");
    if (step === 1 && (!booking.applicant_name || !booking.applicant_email || !booking.passport_number)) {
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
        product_type: "visa",
        item_id: booking.visa_id,
        item_name: `${country} - ${visaType}`,
        customer_name: booking.applicant_name,
        customer_email: booking.applicant_email,
        customer_phone: booking.applicant_phone,
        number_of_travelers: 1,
        base_price: booking.base_price,
        total_price: booking.total_price,
        addons: selectedAddons,
        payment_method: "stripe",
      });
      setPnr(data.pnr);
      setStep(4);
    } catch (err) {
      setError(err.message || "Payment processing failed");
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Apply for Visa</h1>
            <p className="text-slate-600 mt-1">{country} - {visaType}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full transition-all ${s <= step ? "bg-amber-500" : "bg-slate-200"}`} />
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
            {step === 1 && <StepApplicantDetails />}
            {step === 2 && <StepAddons />}
            {step === 3 && <StepReview />}
            {step === 4 && <StepConfirmation />}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Application Fee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Base Fee:</span>
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
            <Button onClick={handlePayment} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Complete Application"}
            </Button>
          )}
          {step === 4 && (
            <Button onClick={() => navigate(createPageUrl("MyBookings"))} className="flex-1 bg-blue-600 hover:bg-blue-700">
              View My Applications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
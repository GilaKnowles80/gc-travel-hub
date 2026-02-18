import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2, Users, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";

export default function BookingForm({ tour, onClose }) {
  const [step, setStep] = useState(1);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    trip_type: "roundtrip",
    title: "MR",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    customer_email: "",
    customer_phone: "",
    date_of_birth: "",
    nationality: "PH",
    government_id_type: "PASSPORT",
    government_id_number: "",
    passport_number: "",
    number_of_travelers: 1,
    departure_date: "",
    special_requests: "",
  });

  const tripMultiplier = form.trip_type === "roundtrip" ? 2 : 1;
  const totalPrice = (form.number_of_travelers || 1) * (tour.price_per_person || 0) * tripMultiplier;

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: (booking) => {
      setBookingId(booking.id);
      setStep(4);
      toast.success("Booking created! Please proceed to payment.");
    },
  });

  const handleSubmit = () => {
    const customer_name = `${form.title} ${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}${form.suffix ? ' ' + form.suffix : ''}`.trim();
    mutation.mutate({
      ...form,
      customer_name,
      tour_id: tour.id,
      tour_title: tour.title,
      total_price: totalPrice,
      status: "pending",
      payment_status: "unpaid",
    });
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  if (booked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
  We've received your booking request for <strong>{tour.title}</strong>. 
          A confirmation email will be sent to <strong>{form.customer_email}</strong>.
        </p>
        <Button onClick={onClose} className="mt-6 bg-amber-500 hover:bg-amber-600 rounded-xl">
          Done
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-0.5 ${step > s ? "bg-amber-500" : "bg-slate-200"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Users className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Select value={form.title} onValueChange={(v) => update("title", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MR">Mr.</SelectItem>
                    <SelectItem value="MRS">Mrs.</SelectItem>
                    <SelectItem value="MS">Ms.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="Juan" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Middle Name</Label>
                <Input value={form.middle_name} onChange={(e) => update("middle_name", e.target.value)} placeholder="Santos" className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Dela Cruz" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input value={form.suffix} onChange={(e) => update("suffix", e.target.value)} placeholder="Jr., Sr., III" className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Birthdate *</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Nationality *</Label>
                <Input value={form.nationality} onChange={(e) => update("nationality", e.target.value)} placeholder="PH" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input type="email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} placeholder="juan@example.com" className="rounded-xl" />
            </div>
            
            <div className="space-y-2">
              <Label>Contact Number *</Label>
              <Input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} placeholder="+63 912 345 6789" className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Government ID *</Label>
                <Select value={form.government_id_type} onValueChange={(v) => update("government_id_type", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                    <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                    <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                    <SelectItem value="SSS">SSS ID</SelectItem>
                    <SelectItem value="UMID">UMID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Government ID Number *</Label>
                <Input value={form.government_id_number} onChange={(e) => update("government_id_number", e.target.value)} placeholder="ID Number" className="rounded-xl" />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!form.first_name || !form.last_name || !form.customer_email || !form.date_of_birth || !form.government_id_number}
              className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl mt-2"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Trip Details</h3>
            </div>
            <div className="space-y-2">
              <Label>Trip Type *</Label>
              <Select value={form.trip_type} onValueChange={(v) => update("trip_type", v)}>
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
              <Label>Number of Travelers</Label>
              <Select value={String(form.number_of_travelers)} onValueChange={(v) => update("number_of_travelers", Number(v))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: tour.group_size_max || 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "traveler" : "travelers"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tour.departure_dates?.length > 0 ? (
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Select value={form.departure_date} onValueChange={(v) => update("departure_date", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {tour.departure_dates.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Preferred Departure Date</Label>
                <Input type="date" value={form.departure_date} onChange={(e) => update("departure_date", e.target.value)} className="rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Special Requests</Label>
              <Textarea value={form.special_requests} onChange={(e) => update("special_requests", e.target.value)} placeholder="Dietary restrictions, accessibility needs, etc." className="rounded-xl" rows={3} />
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl">Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Users className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Review & Confirm</h3>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tour</span>
                <span className="font-medium text-slate-900">{tour.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Trip Type</span>
                <span className="font-medium capitalize">{form.trip_type === "roundtrip" ? "Round Trip" : "One Way"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Name</span>
                <span className="font-medium">{form.title} {form.first_name} {form.middle_name} {form.last_name} {form.suffix}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-medium">{form.customer_email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Travelers</span>
                <span className="font-medium">{form.number_of_travelers}</span>
              </div>
              {form.departure_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium">{form.departure_date}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-slate-500 text-sm">Price per person</span>
                <span className="font-medium">${tour.price_per_person?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-amber-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">Back</Button>
              <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl"
              >
                {mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Booking
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Payment</h3>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 text-center mb-6">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-amber-600">${totalPrice.toLocaleString()}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="tour"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="USD"
                  onSuccess={() => setBooked(true)}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice * 56}
                  description={`Tour Booking - ${tour.title}`}
                  bookingId={bookingId}
                  bookingType="tour"
                  onSuccess={() => setBooked(true)}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
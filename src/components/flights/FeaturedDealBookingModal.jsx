import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, CreditCard, Wallet, CheckCircle2, Loader2, Lock, QrCode } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const STEPS = ["Passenger Info", "Payment", "Confirmed"];

export default function FeaturedDealBookingModal({ deal, user, onClose }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    passenger_name: user?.full_name || "",
    passenger_email: user?.email || "",
    passenger_phone: "",
    passport_number: "",
    date_of_birth: "",
    special_requests: "",
    number_of_passengers: 1,
    departure_date: deal.departure_date || "",
    return_date: deal.return_date || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [showQR, setShowQR] = useState(false);

  const totalPrice = deal.price_php * form.number_of_passengers;

  const handleSubmitPassenger = (e) => {
    e.preventDefault();
    if (!form.passenger_name || !form.passenger_email || !form.passenger_phone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!form.departure_date) {
      toast.error("Please select a departure date");
      return;
    }
    if (deal.trip_type === "roundtrip" && !form.return_date) {
      toast.error("Please select a return date for roundtrip booking");
      return;
    }
    setStep(1);
  };

  const handlePayWithGCash = async () => {
    if (window.self !== window.top) {
      toast.error("Payment must be completed from the published app, not inside an iframe.");
      return;
    }
    setLoading(true);
    try {
      // Save booking first
      const bookingRecord = await base44.entities.FlightBooking.create({
        flight_id: deal.id,
        flight_number: deal.flight_number || deal.airline,
        route: `${deal.origin_code} → ${deal.destination_code}`,
        trip_type: deal.trip_type || "roundtrip",
        passenger_name: form.passenger_name,
        passenger_email: form.passenger_email,
        passenger_phone: form.passenger_phone,
        passport_number: form.passport_number,
        date_of_birth: form.date_of_birth,
        cabin_class: deal.cabin_class || "economy",
        number_of_passengers: form.number_of_passengers,
        total_price: totalPrice,
        special_requests: form.special_requests,
        status: "pending",
        payment_status: "unpaid",
        supplier: deal.supplier || "biyaheko",
        supplier_reference: deal.supplier_reference || "",
      });

      // Create PayMongo payment
      const res = await base44.functions.invoke("createPayMongoPayment", {
        amount: totalPrice,
        description: `Flight: ${deal.origin_code} → ${deal.destination_code} | ${deal.airline} | ${form.passenger_name}`,
        bookingId: bookingRecord.id,
        bookingType: "flight",
        paymentMethod: "gcash",
      });

      if (res.data?.success && res.data?.payment?.checkout_url) {
        setBooking(bookingRecord);
        window.open(res.data.payment.checkout_url, "_blank", "width=600,height=700");
        setStep(2);
        toast.success("GCash QR opened! Complete payment in the new window.");
      } else {
        toast.error("Failed to create GCash payment. Please try Stripe.");
      }
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithQR = async () => {
    setLoading(true);
    try {
      const bookingRecord = await base44.entities.FlightBooking.create({
        flight_id: deal.id,
        flight_number: deal.flight_number || deal.airline,
        route: `${deal.origin_code} → ${deal.destination_code}`,
        trip_type: deal.trip_type || "roundtrip",
        passenger_name: form.passenger_name,
        passenger_email: form.passenger_email,
        passenger_phone: form.passenger_phone,
        passport_number: form.passport_number,
        date_of_birth: form.date_of_birth,
        cabin_class: deal.cabin_class || "economy",
        number_of_passengers: form.number_of_passengers,
        total_price: totalPrice,
        special_requests: form.special_requests,
        status: "pending",
        payment_status: "partial",
        supplier: deal.supplier || "biyaheko",
        supplier_reference: deal.supplier_reference || "",
        price_comparison_notes: "QR Ph payment — pending admin verification",
      });
      setBooking(bookingRecord);
      setStep(2);
      toast.success("Booking submitted! Our team will verify your QR payment shortly.");
    } catch (err) {
      toast.error(err.message || "Failed to record booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithStripe = async () => {
    if (window.self !== window.top) {
      toast.error("Payment must be completed from the published app, not inside an iframe.");
      return;
    }
    setLoading(true);
    try {
      const bookingRecord = await base44.entities.FlightBooking.create({
        flight_id: deal.id,
        flight_number: deal.flight_number || deal.airline,
        route: `${deal.origin_code} → ${deal.destination_code}`,
        trip_type: deal.trip_type || "roundtrip",
        passenger_name: form.passenger_name,
        passenger_email: form.passenger_email,
        passenger_phone: form.passenger_phone,
        passport_number: form.passport_number,
        date_of_birth: form.date_of_birth,
        cabin_class: deal.cabin_class || "economy",
        number_of_passengers: form.number_of_passengers,
        total_price: totalPrice,
        special_requests: form.special_requests,
        status: "pending",
        payment_status: "unpaid",
        supplier: deal.supplier || "biyaheko",
        supplier_reference: deal.supplier_reference || "",
      });

      const amountUSD = deal.price_usd ? deal.price_usd * form.number_of_passengers : Math.round(totalPrice / 56);
      const res = await base44.functions.invoke("createFlightCheckout", {
        bookingId: bookingRecord.id,
        amount: amountUSD,
        currency: "usd",
        description: `Flight: ${deal.origin_code} → ${deal.destination_code} | ${deal.airline}`,
        customerEmail: form.passenger_email,
      });

      if (res.data?.url) {
        setBooking(bookingRecord);
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to create Stripe checkout.");
      }
    } catch (err) {
      toast.error(err.message || "Stripe checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-500" />
            Book Your Flight
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= i ? "text-amber-600" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? "bg-amber-500 text-white" : step === i ? "bg-amber-100 text-amber-600 border-2 border-amber-500" : "bg-slate-100 text-slate-400"}`}>
                  {step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${step > i ? "bg-amber-500" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Flight Summary */}
        <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 text-lg">{deal.origin_code} → {deal.destination_code}</p>
              <p className="text-xs text-slate-500">{deal.airline} · {deal.cabin_class?.replace(/_/g, ' ')} · {deal.trip_type?.replace(/_/g, ' ')}</p>
              {deal.departure_date && (
              <p className="text-xs text-slate-500">
                {moment(deal.departure_date).format("MMM DD, YYYY")}
                {deal.trip_type === "roundtrip" && deal.return_date && ` → ${moment(deal.return_date).format("MMM DD, YYYY")}`}
              </p>
            )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">₱{deal.price_php.toLocaleString()}</p>
              <p className="text-xs text-slate-400">per person</p>
            </div>
          </div>
        </div>

        {/* Step 0: Passenger Info */}
        {step === 0 && (
          <form onSubmit={handleSubmitPassenger} className="space-y-4">
            <div>
              <Label>Number of Passengers</Label>
              <Select value={String(form.number_of_passengers)} onValueChange={v => setForm(p => ({ ...p, number_of_passengers: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(n => <SelectItem key={n} value={String(n)}>{n} Passenger{n > 1 ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Full Name (as in passport) *</Label>
                <Input value={form.passenger_name} onChange={e => setForm(p => ({ ...p, passenger_name: e.target.value }))} required placeholder="e.g. JUAN DELA CRUZ" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.passenger_email} onChange={e => setForm(p => ({ ...p, passenger_email: e.target.value }))} required />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input value={form.passenger_phone} onChange={e => setForm(p => ({ ...p, passenger_phone: e.target.value }))} required placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Passport / ID Number</Label>
                  <Input value={form.passport_number} onChange={e => setForm(p => ({ ...p, passport_number: e.target.value }))} placeholder="P1234567A" />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Departure Date *</Label>
                  <Input type="date" value={form.departure_date} onChange={e => setForm(p => ({ ...p, departure_date: e.target.value }))} required min={new Date().toISOString().split("T")[0]} />
                </div>
                {deal.trip_type === "roundtrip" && (
                  <div>
                    <Label>Return Date *</Label>
                    <Input type="date" value={form.return_date} onChange={e => setForm(p => ({ ...p, return_date: e.target.value }))} required min={form.departure_date || new Date().toISOString().split("T")[0]} />
                  </div>
                )}
              </div>
              <div>
                <Label>Special Requests</Label>
                <Input value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} placeholder="Meal preference, wheelchair, etc." />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-slate-600">Total ({form.number_of_passengers} pax)</span>
              <span className="text-xl font-bold text-amber-600">₱{totalPrice.toLocaleString()}</span>
            </div>

            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Continue to Payment →
            </Button>
          </form>
        )}

        {/* Step 1: Payment */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-2xl font-bold text-amber-600">₱{totalPrice.toLocaleString()}</span>
            </div>

            <p className="text-sm font-semibold text-slate-700">Select Payment Method:</p>

            {/* GCash */}
            <button
              onClick={handlePayWithGCash}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-800">GCash / PayMaya / GrabPay</p>
                <p className="text-xs text-slate-500">Philippine e-wallet — instant QR payment</p>
              </div>
              {loading && paymentMethod === "gcash" && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            </button>

            {/* QR Ph / PayMongo Static QR */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-800">QR Ph — Scan to Pay</p>
                <p className="text-xs text-slate-500">Banks, e-wallets & more • No fees • Powered by PayMongo</p>
              </div>
              <span className="text-xs text-green-600 font-semibold">{showQR ? "Hide" : "Show QR"}</span>
            </button>

            {showQR && (
              <div className="bg-white border-2 border-green-200 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-1">GC Travel and Tours Agency</p>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/c493ff053_PayMongoQRCode.jpg"
                  alt="PayMongo QR Ph"
                  className="w-56 mx-auto rounded-xl"
                />
                <p className="text-xs text-slate-600 mt-2 font-medium">Total: <span className="text-amber-600 font-bold">₱{totalPrice.toLocaleString()}</span></p>
                <p className="text-xs text-slate-500 mt-1">Scan with your bank app or e-wallet, then tap the button below after paying.</p>
                <p className="text-xs text-green-600 font-semibold mt-1">✓ No fees • Works with all Philippine banks & e-wallets</p>
                <Button
                  onClick={handlePayWithQR}
                  disabled={loading}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  I've Paid — Confirm Booking
                </Button>
              </div>
            )}

            {/* Stripe */}
            <button
              onClick={handlePayWithStripe}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-800">Credit / Debit Card (Stripe)</p>
                <p className="text-xs text-slate-500">Visa, Mastercard, AMEX — international cards accepted</p>
              </div>
              {loading && paymentMethod === "stripe" && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
            </button>

            <div className="flex items-center gap-1 text-xs text-slate-400 justify-center mt-2">
              <Lock className="w-3 h-3" />
              <span>All payments are secure and encrypted</span>
            </div>

            <Button variant="outline" onClick={() => setStep(0)} className="w-full">← Back</Button>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Booking Submitted!</h3>
            <p className="text-slate-600 text-sm">
              {booking?.price_comparison_notes?.includes("QR Ph")
                ? <>Your booking is recorded. Our team will verify your QR payment and send your e-ticket to <strong>{form.passenger_email}</strong> within a few hours.</>
                : <>Complete the payment in the window that opened. Once confirmed, you'll receive your e-ticket via email at <strong>{form.passenger_email}</strong>.</>
              }
            </p>
            {booking && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                <p>Booking Ref: <strong className="text-amber-600">{booking.id?.slice(-8).toUpperCase()}</strong></p>
                <p>Route: <strong>{deal.origin_code} → {deal.destination_code}</strong></p>
                <p>Passenger: <strong>{form.passenger_name}</strong></p>
              </div>
            )}
            <Button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
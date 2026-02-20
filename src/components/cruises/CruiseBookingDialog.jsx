import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function CruiseBookingDialog({ cruise, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    number_of_guests: 2,
    cabin_category: cruise.cabin_categories?.[0]?.category || "interior",
    special_requests: ""
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const cabinPrice = cruise.cabin_categories?.find(c => c.category === form.cabin_category)?.price_per_person || 0;
  const totalPrice = cabinPrice * form.number_of_guests;

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.CruiseBooking.create(data),
    onSuccess: (booking) => {
      setBookingId(booking.id);
      setStep(2);
      toast.success("Booking created! Please proceed to payment.");
    }
  });

  const handleCreateBooking = () => {
    if (!form.guest_name || !form.guest_email) {
      toast.error("Please fill in all required fields");
      return;
    }

    createBookingMutation.mutate({
      cruise_id: cruise.id,
      cruise_name: cruise.itinerary_name,
      guest_name: form.guest_name,
      guest_email: form.guest_email,
      guest_phone: form.guest_phone,
      number_of_guests: form.number_of_guests,
      cabin_category: form.cabin_category,
      total_price: totalPrice,
      special_requests: form.special_requests,
      status: "pending",
      payment_status: "unpaid",
      supplier: cruise.cruise_line
    });
  };

  const handlePaymentSuccess = () => {
    setStep(3);
    toast.success("Payment successful!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-cyan-600" />
            Book Cruise - {cruise.ship_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Itinerary:</span>
                  <p className="font-semibold">{cruise.itinerary_name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Duration:</span>
                  <p className="font-semibold">{cruise.duration_nights} nights</p>
                </div>
                <div>
                  <span className="text-slate-600">Departure:</span>
                  <p className="font-semibold">{cruise.departure_port}</p>
                </div>
                <div>
                  <span className="text-slate-600">Cruise Line:</span>
                  <p className="font-semibold">{cruise.cruise_line}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Guest Name *</Label>
                  <Input
                    value={form.guest_name}
                    onChange={(e) => setForm({...form, guest_name: e.target.value})}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.guest_email}
                    onChange={(e) => setForm({...form, guest_email: e.target.value})}
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={form.guest_phone}
                  onChange={(e) => setForm({...form, guest_phone: e.target.value})}
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Guests</Label>
                  <Select value={String(form.number_of_guests)} onValueChange={(v) => setForm({...form, number_of_guests: Number(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'guest' : 'guests'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cabin Category</Label>
                  <Select value={form.cabin_category} onValueChange={(v) => setForm({...form, cabin_category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cruise.cabin_categories?.map(cabin => (
                        <SelectItem key={cabin.category} value={cabin.category}>
                          {cabin.category} - ${cabin.price_per_person}/person
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Textarea
                  value={form.special_requests}
                  onChange={(e) => setForm({...form, special_requests: e.target.value})}
                  placeholder="Dietary requirements, accessibility needs, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-cyan-600">${totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {form.number_of_guests} guest(s) × ${cabinPrice.toLocaleString()} per person
              </p>
            </div>

            <Button
              onClick={handleCreateBooking}
              disabled={createBookingMutation.isPending}
              className="w-full"
            >
              {createBookingMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-cyan-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-cyan-600">${totalPrice.toLocaleString()}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="cruise"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="USD"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice * 56}
                  description={`Cruise Booking - ${cruise.ship_name}`}
                  bookingId={bookingId}
                  bookingType="cruise"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 mb-6">
              Your cruise booking has been confirmed. A confirmation email has been sent to {form.guest_email}.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
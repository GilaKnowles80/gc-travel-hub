import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";
import PriceDisplay from "@/components/currency/PriceDisplay";
import InsuranceSelector from "@/components/insurance/InsuranceSelector";

export default function BusBookingDialog({ bus, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [form, setForm] = useState({
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    number_of_passengers: 1
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const totalPrice = bus.price * form.number_of_passengers + (selectedInsurance ? selectedInsurance.premium * form.number_of_passengers : 0);

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      let booking_ref = null;
      try {
        const refRes = await base44.functions.invoke('generateBookingRef', { product_type: 'bus' });
        booking_ref = refRes?.data?.booking_ref || null;
      } catch (e) { console.error('Could not generate booking ref', e); }
      return base44.entities.BusBooking.create({ ...data, ...(booking_ref && { booking_ref }) });
    },
    onSuccess: (booking) => {
      setBookingId(booking.id);
      setStep(2);
      toast.success("Booking created! Please proceed to payment.");
    }
  });

  const handleCreateBooking = () => {
    if (!form.passenger_name || !form.passenger_email) {
      toast.error("Please fill in all required fields");
      return;
    }

    createBookingMutation.mutate({
      bus_id: bus.id,
      bus_number: bus.bus_number,
      passenger_name: form.passenger_name,
      passenger_email: form.passenger_email,
      passenger_phone: form.passenger_phone,
      number_of_passengers: form.number_of_passengers,
      total_price: totalPrice,
      status: "pending",
      payment_status: "unpaid",
      supplier: bus.operator
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
            <Bus className="w-5 h-5 text-green-600" />
            Book Bus - {bus.operator}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Route:</span>
                  <p className="font-semibold">{bus.origin_terminal} → {bus.destination_terminal}</p>
                </div>
                <div>
                  <span className="text-slate-600">Duration:</span>
                  <p className="font-semibold">{bus.duration_hours} hours</p>
                </div>
                <div>
                  <span className="text-slate-600">Departure:</span>
                  <p className="font-semibold">{new Date(bus.departure_time).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Operator:</span>
                  <p className="font-semibold">{bus.operator}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.passenger_name}
                    onChange={(e) => setForm({...form, passenger_name: e.target.value})}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.passenger_email}
                    onChange={(e) => setForm({...form, passenger_email: e.target.value})}
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={form.passenger_phone}
                  onChange={(e) => setForm({...form, passenger_phone: e.target.value})}
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Passengers</Label>
                <MobileSelect value={String(form.number_of_passengers)} onValueChange={(v) => setForm({...form, number_of_passengers: Number(v)})} placeholder="Select passengers">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'passenger' : 'passengers'}</SelectItem>
                    ))}
                  </SelectContent>
                </MobileSelect>
              </div>
            </div>

            <InsuranceSelector
              destination={bus.destination_terminal}
              startDate={bus.departure_time?.split('T')[0]}
              endDate={bus.arrival_time?.split('T')[0]}
              tripCost={bus.price * form.number_of_passengers}
              travelers={form.number_of_passengers}
              onSelect={setSelectedInsurance}
              selectedInsurance={selectedInsurance}
            />

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600"><PriceDisplay amount={totalPrice} /></span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {form.number_of_passengers} passenger(s) × <PriceDisplay amount={bus.price} />
                {selectedInsurance && <span className="ml-2 text-blue-600">+ Insurance: <PriceDisplay amount={selectedInsurance.premium * form.number_of_passengers} /></span>}
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
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Amount</p>
              <div className="text-3xl font-bold text-green-600"><PriceDisplay amount={totalPrice} fromCurrency="PHP" /></div>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="bus"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="PHP"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice}
                  description={`Bus Ticket - ${bus.operator}`}
                  bookingId={bookingId}
                  bookingType="bus"
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
              Your bus ticket has been confirmed. A confirmation email has been sent to {form.passenger_email}.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
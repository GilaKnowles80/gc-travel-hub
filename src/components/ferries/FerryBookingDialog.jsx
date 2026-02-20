import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Users, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function FerryBookingDialog({ ferry, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    number_of_passengers: 1,
    cabin_type: ferry.cabin_types?.[0]?.type || "economy"
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const cabinPrice = ferry.cabin_types?.find(c => c.type === form.cabin_type)?.price || 0;
  const totalPrice = cabinPrice * form.number_of_passengers;

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.FerryBooking.create(data),
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
      ferry_id: ferry.id,
      vessel_name: ferry.vessel_name,
      passenger_name: form.passenger_name,
      passenger_email: form.passenger_email,
      passenger_phone: form.passenger_phone,
      number_of_passengers: form.number_of_passengers,
      cabin_type: form.cabin_type,
      total_price: totalPrice,
      status: "pending",
      payment_status: "unpaid"
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
            <Ship className="w-5 h-5 text-blue-600" />
            Book Ferry - {ferry.vessel_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Route:</span>
                  <p className="font-semibold">{ferry.origin_port} → {ferry.destination_port}</p>
                </div>
                <div>
                  <span className="text-slate-600">Duration:</span>
                  <p className="font-semibold">{ferry.duration_hours} hours</p>
                </div>
                <div>
                  <span className="text-slate-600">Departure:</span>
                  <p className="font-semibold">{new Date(ferry.departure_time).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Operator:</span>
                  <p className="font-semibold">{ferry.operator}</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Passengers</Label>
                  <Select value={String(form.number_of_passengers)} onValueChange={(v) => setForm({...form, number_of_passengers: Number(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'passenger' : 'passengers'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cabin Type</Label>
                  <Select value={form.cabin_type} onValueChange={(v) => setForm({...form, cabin_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ferry.cabin_types?.map(cabin => (
                        <SelectItem key={cabin.type} value={cabin.type}>
                          {cabin.type} - ₱{cabin.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">₱{totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {form.number_of_passengers} passenger(s) × ₱{cabinPrice.toLocaleString()}
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
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">₱{totalPrice.toLocaleString()}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="ferry"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="PHP"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice}
                  description={`Ferry Booking - ${ferry.vessel_name}`}
                  bookingId={bookingId}
                  bookingType="ferry"
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
              Your ferry booking has been confirmed. A confirmation email has been sent to {form.passenger_email}.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
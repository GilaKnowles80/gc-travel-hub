import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";

export default function CarRentalBookingDialog({ car, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    renter_name: "",
    renter_email: "",
    renter_phone: "",
    pickup_date: "",
    return_date: "",
    rental_days: 1
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const totalPrice = car.price_per_day * form.rental_days;

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.CarRentalBooking.create(data),
    onSuccess: (booking) => {
      setBookingId(booking.id);
      setStep(2);
      toast.success("Booking created! Please proceed to payment.");
    }
  });

  const calculateDays = (pickup, returnDate) => {
    if (!pickup || !returnDate) return 1;
    const diff = new Date(returnDate) - new Date(pickup);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCreateBooking = () => {
    if (!form.renter_name || !form.renter_email || !form.pickup_date || !form.return_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    createBookingMutation.mutate({
      car_id: car.id,
      car_model: car.car_model,
      renter_name: form.renter_name,
      renter_email: form.renter_email,
      renter_phone: form.renter_phone,
      pickup_date: form.pickup_date,
      return_date: form.return_date,
      rental_days: form.rental_days,
      total_price: totalPrice,
      status: "pending",
      payment_status: "unpaid",
      supplier: car.rental_company
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
            <Car className="w-5 h-5 text-orange-600" />
            Rent {car.car_model}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Car:</span>
                  <p className="font-semibold">{car.car_model}</p>
                </div>
                <div>
                  <span className="text-slate-600">Company:</span>
                  <p className="font-semibold">{car.rental_company}</p>
                </div>
                <div>
                  <span className="text-slate-600">Location:</span>
                  <p className="font-semibold">{car.location}</p>
                </div>
                <div>
                  <span className="text-slate-600">Daily Rate:</span>
                  <p className="font-semibold">${car.price_per_day}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.renter_name}
                    onChange={(e) => setForm({...form, renter_name: e.target.value})}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.renter_email}
                    onChange={(e) => setForm({...form, renter_email: e.target.value})}
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={form.renter_phone}
                  onChange={(e) => setForm({...form, renter_phone: e.target.value})}
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Date *</Label>
                  <Input
                    type="date"
                    value={form.pickup_date}
                    onChange={(e) => {
                      const newPickup = e.target.value;
                      setForm({
                        ...form, 
                        pickup_date: newPickup,
                        rental_days: calculateDays(newPickup, form.return_date)
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date *</Label>
                  <Input
                    type="date"
                    value={form.return_date}
                    onChange={(e) => {
                      const newReturn = e.target.value;
                      setForm({
                        ...form, 
                        return_date: newReturn,
                        rental_days: calculateDays(form.pickup_date, newReturn)
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-orange-600">${totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {form.rental_days} day(s) × ${car.price_per_day} per day
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
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-orange-600">${totalPrice.toLocaleString()}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="car"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="USD"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice * 56}
                  description={`Car Rental - ${car.car_model}`}
                  bookingId={bookingId}
                  bookingType="car"
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
              Your car rental has been confirmed. A confirmation email has been sent to {form.renter_email}.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
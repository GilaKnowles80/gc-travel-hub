import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, CreditCard, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StripeCheckout from '@/components/payment/StripeCheckout';
import PayMongoPayment from '@/components/payment/PayMongoPayment';

export default function TrainBookingConfirmation() {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const bookingId = new URLSearchParams(window.location.search).get('id');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['train-booking', bookingId],
    queryFn: () => base44.entities.TrainBooking.get(bookingId),
    enabled: !!bookingId
  });

  const { data: train } = useQuery({
    queryKey: ['train', booking?.train_id],
    queryFn: () => base44.entities.Train.get(booking.train_id),
    enabled: !!booking?.train_id
  });

  const stripeCheckoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('createTrainCheckout', {
        booking_id: bookingId
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Checkout failed');
    }
  });

  const paymongoCheckoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('createPayMongoPayment', {
        booking_type: 'train',
        booking_id: bookingId,
        amount: booking.total_price,
        description: `Train Booking - ${booking.train_number}`
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Payment failed');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Train Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="w-5 h-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {train && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{train.train_number}</h3>
                    <p className="text-sm text-slate-600">{train.operator}</p>
                    <p className="text-sm">{train.origin_station} → {train.destination_station}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(train.departure_time).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Passenger</p>
                    <p className="font-medium">{booking.passenger_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Number of Passengers</p>
                    <p className="font-medium">{booking.number_of_passengers}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Class</p>
                    <p className="font-medium capitalize">{booking.class_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <Badge>{booking.status}</Badge>
                  </div>
                </div>

                {booking.special_requests && (
                  <div>
                    <p className="text-sm text-slate-600">Special Requests</p>
                    <p className="text-sm">{booking.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stripe">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paymongo">
                      <Building2 className="w-4 h-4 mr-2" />
                      PayMongo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stripe" className="mt-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Secure payment processing via Stripe
                    </p>
                    <Button
                      onClick={() => stripeCheckoutMutation.mutate()}
                      disabled={stripeCheckoutMutation.isPending}
                      className="w-full"
                    >
                      {stripeCheckoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      Pay with Stripe
                    </Button>
                  </TabsContent>

                  <TabsContent value="paymongo" className="mt-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Local payment options via PayMongo
                    </p>
                    <Button
                      onClick={() => paymongoCheckoutMutation.mutate()}
                      disabled={paymongoCheckoutMutation.isPending}
                      className="w-full"
                    >
                      {paymongoCheckoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Building2 className="w-4 h-4 mr-2" />
                      )}
                      Pay with PayMongo
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base Price</span>
                  <span>${(booking.total_price / booking.number_of_passengers).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Passengers</span>
                  <span>× {booking.number_of_passengers}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl">${booking.total_price}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
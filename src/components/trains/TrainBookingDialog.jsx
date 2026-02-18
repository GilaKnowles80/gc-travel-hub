import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, User, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainBookingDialog({ train, open, onClose }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    passenger_name: '',
    passenger_email: '',
    passenger_phone: '',
    number_of_passengers: 1,
    class_type: train?.class_types?.[0]?.class || 'economy',
    special_requests: ''
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedTravelers = [] } = useQuery({
    queryKey: ['saved-travelers', user?.email],
    queryFn: () => base44.entities.SavedTraveler.filter({ user_email: user.email }),
    enabled: !!user
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      const selectedClass = train.class_types.find(c => c.class === data.class_type);
      const totalPrice = (selectedClass?.price || 0) * data.number_of_passengers;

      return base44.entities.TrainBooking.create({
        train_id: train.id,
        train_number: train.train_number,
        ...data,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'unpaid',
        supplier: train.operator
      });
    },
    onSuccess: (booking) => {
      setStep(3);
      toast.success('Booking created');
    }
  });

  const handleSubmit = () => {
    if (!bookingData.passenger_name || !bookingData.passenger_email || !bookingData.passenger_phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    createBookingMutation.mutate(bookingData);
  };

  const useSavedTraveler = (traveler) => {
    setBookingData({
      ...bookingData,
      passenger_name: `${traveler.first_name} ${traveler.last_name}`,
      passenger_email: traveler.email || bookingData.passenger_email,
      passenger_phone: traveler.phone || bookingData.passenger_phone
    });
  };

  const selectedClass = train?.class_types?.find(c => c.class === bookingData.class_type);
  const totalPrice = (selectedClass?.price || 0) * bookingData.number_of_passengers;

  if (!train) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Train className="w-5 h-5" />
            Book Train Ticket
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-4" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
          <div className="flex-1 h-px bg-slate-200 mx-4" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
              {step > 3 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Train Details</h3>
              <p className="text-sm">{train.train_number} - {train.operator}</p>
              <p className="text-sm text-slate-600">{train.origin_station} → {train.destination_station}</p>
            </div>

            {savedTravelers.length > 0 && (
              <div>
                <Label>Quick Select Saved Traveler</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {savedTravelers.map(traveler => (
                    <Button
                      key={traveler.id}
                      variant="outline"
                      onClick={() => useSavedTraveler(traveler)}
                      className="text-left justify-start"
                    >
                      {traveler.label || `${traveler.first_name} ${traveler.last_name}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Full Name *</Label>
              <Input
                value={bookingData.passenger_name}
                onChange={(e) => setBookingData({...bookingData, passenger_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={bookingData.passenger_email}
                  onChange={(e) => setBookingData({...bookingData, passenger_email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={bookingData.passenger_phone}
                  onChange={(e) => setBookingData({...bookingData, passenger_phone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Passengers</Label>
                <Input
                  type="number"
                  min="1"
                  value={bookingData.number_of_passengers}
                  onChange={(e) => setBookingData({...bookingData, number_of_passengers: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={bookingData.class_type} onValueChange={(v) => setBookingData({...bookingData, class_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {train.class_types?.map(cls => (
                      <SelectItem key={cls.class} value={cls.class}>
                        {cls.class.replace('_', ' ').toUpperCase()} - ${cls.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Special Requests</Label>
              <Textarea
                value={bookingData.special_requests}
                onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})}
                placeholder="Wheelchair access, meal preferences, etc."
                rows={3}
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Continue to Review
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Booking Summary</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Train:</span>
                  <span className="font-medium">{train.train_number} - {train.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Route:</span>
                  <span className="font-medium">{train.origin_station} → {train.destination_station}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Passenger:</span>
                  <span className="font-medium">{bookingData.passenger_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Number of Passengers:</span>
                  <span className="font-medium">{bookingData.number_of_passengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Class:</span>
                  <span className="font-medium capitalize">{bookingData.class_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Price:</span>
                  <span className="font-bold text-lg">${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={createBookingMutation.isPending} className="flex-1">
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 3 && createBookingMutation.data && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Booking Created!</h3>
            <p className="text-slate-600 mb-6">Proceed to payment to confirm your train ticket</p>
            <Button onClick={() => window.location.href = `/train-booking-confirmation?id=${createBookingMutation.data.id}`}>
              Proceed to Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
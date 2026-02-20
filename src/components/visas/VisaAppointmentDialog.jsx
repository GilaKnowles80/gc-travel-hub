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
import { Calendar, CheckCircle2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function VisaAppointmentDialog({ visa, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [form, setForm] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    passport_number: "",
    nationality: "",
    date_of_birth: "",
    appointment_date: "",
    travel_date: "",
    purpose: "tourism",
    notes: ""
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const serviceFee = 500; // Service fee in PHP
  const totalPrice = visa.price + serviceFee;

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.VisaAppointment.create(data),
    onSuccess: (appointment) => {
      setBookingId(appointment.id);
      setStep(2);
      toast.success("Appointment created! Please proceed to payment.");
    }
  });

  const handleCreateAppointment = () => {
    if (!form.applicant_name || !form.applicant_email || !form.passport_number || !form.appointment_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    createAppointmentMutation.mutate({
      visa_id: visa.id,
      country: visa.country,
      visa_type: visa.visa_type,
      applicant_name: form.applicant_name,
      applicant_email: form.applicant_email,
      applicant_phone: form.applicant_phone,
      passport_number: form.passport_number,
      nationality: form.nationality,
      date_of_birth: form.date_of_birth,
      appointment_date: form.appointment_date,
      travel_date: form.travel_date,
      purpose: form.purpose,
      notes: form.notes,
      service_fee: serviceFee,
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
            <Calendar className="w-5 h-5 text-amber-600" />
            Book Visa Appointment - {visa.country}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Visa Info */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Country:</span>
                  <p className="font-semibold">{visa.country}</p>
                </div>
                <div>
                  <span className="text-slate-600">Type:</span>
                  <p className="font-semibold capitalize">{visa.visa_type}</p>
                </div>
                <div>
                  <span className="text-slate-600">Processing:</span>
                  <p className="font-semibold">{visa.processing_time_days} days</p>
                </div>
                <div>
                  <span className="text-slate-600">Validity:</span>
                  <p className="font-semibold">{visa.validity_months} months</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {visa.requirements && visa.requirements.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-blue-900">Required Documents</p>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  {visa.requirements.map((req, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name (as in passport) *</Label>
                  <Input
                    value={form.applicant_name}
                    onChange={(e) => setForm({...form, applicant_name: e.target.value})}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.applicant_email}
                    onChange={(e) => setForm({...form, applicant_email: e.target.value})}
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={form.applicant_phone}
                    onChange={(e) => setForm({...form, applicant_phone: e.target.value})}
                    placeholder="+63 912 345 6789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport Number *</Label>
                  <Input
                    value={form.passport_number}
                    onChange={(e) => setForm({...form, passport_number: e.target.value})}
                    placeholder="P1234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    value={form.nationality}
                    onChange={(e) => setForm({...form, nationality: e.target.value})}
                    placeholder="Filipino"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({...form, date_of_birth: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Appointment Date *</Label>
                  <Input
                    type="date"
                    value={form.appointment_date}
                    onChange={(e) => setForm({...form, appointment_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intended Travel Date</Label>
                  <Input
                    type="date"
                    value={form.travel_date}
                    onChange={(e) => setForm({...form, travel_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purpose of Travel</Label>
                <Select value={form.purpose} onValueChange={(v) => setForm({...form, purpose: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism">Tourism</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="family_visit">Family Visit</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Any special requirements or questions..."
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Visa Fee:</span>
                <span className="font-medium"><PriceDisplay amount={visa.price} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Service Fee:</span>
                <span className="font-medium"><PriceDisplay amount={serviceFee} /></span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-amber-600"><PriceDisplay amount={totalPrice} /></span>
              </div>
            </div>

            <Button
              onClick={handleCreateAppointment}
              disabled={createAppointmentMutation.isPending}
              className="w-full"
            >
              {createAppointmentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-amber-600">₱{totalPrice.toLocaleString()}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="visa"
                  bookingId={bookingId}
                  amount={totalPrice}
                  currency="PHP"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={totalPrice}
                  description={`Visa Appointment - ${visa.country}`}
                  bookingId={bookingId}
                  bookingType="visa"
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
            <h3 className="text-xl font-bold mb-2">Appointment Confirmed!</h3>
            <p className="text-slate-600 mb-6">
              Your visa appointment has been confirmed. A confirmation email with next steps has been sent to {form.applicant_email}.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-2">Next Steps:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Prepare all required documents</li>
                <li>• Arrive 15 minutes before your appointment</li>
                <li>• Bring your passport and confirmation email</li>
              </ul>
            </div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
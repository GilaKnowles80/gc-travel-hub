import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayMongoPayment from "@/components/payment/PayMongoPayment";

export default function InsurancePurchaseDialog({ provider, coverage, open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [policyId, setPolicyId] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    traveler_name: "",
    traveler_email: "",
    traveler_phone: "",
    date_of_birth: "",
    passport_number: "",
    destination: "",
    trip_start_date: "",
    trip_end_date: "",
    trip_cost: ""
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.InsurancePolicy.create(data),
    onSuccess: (policy) => {
      setPolicyId(policy.id);
      setStep(2);
      toast.success("Policy created! Please proceed to payment.");
    }
  });

  const handleCreatePolicy = () => {
    if (!form.traveler_name || !form.traveler_email || !form.trip_start_date || !form.trip_end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    const tripCost = parseFloat(form.trip_cost) || 0;

    createPolicyMutation.mutate({
      user_email: user?.email || form.traveler_email,
      provider_id: provider.id,
      coverage_type: coverage.type,
      coverage_amount: coverage.coverage_amount,
      premium: coverage.base_price,
      trip_details: {
        destination: form.destination,
        start_date: form.trip_start_date,
        end_date: form.trip_end_date,
        trip_cost: tripCost
      },
      travelers: [{
        name: form.traveler_name,
        date_of_birth: form.date_of_birth
      }],
      benefits: coverage.benefits || [],
      status: "active",
      payment_status: "pending"
    });
  };

  const handlePaymentSuccess = () => {
    setStep(3);
    toast.success("Payment successful! Your policy is now active.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Purchase Travel Insurance
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Policy Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Provider:</span>
                  <p className="font-semibold">{provider.provider_name}</p>
                </div>
                <div>
                  <span className="text-slate-600">Coverage:</span>
                  <p className="font-semibold capitalize">{coverage.type}</p>
                </div>
                <div>
                  <span className="text-slate-600">Coverage Amount:</span>
                  <p className="font-semibold">${coverage.coverage_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Premium:</span>
                  <p className="font-semibold">${coverage.base_price}</p>
                </div>
              </div>
            </div>

            {/* Traveler Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Traveler Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.traveler_name}
                    onChange={(e) => setForm({...form, traveler_name: e.target.value})}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({...form, date_of_birth: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.traveler_email}
                    onChange={(e) => setForm({...form, traveler_email: e.target.value})}
                    placeholder="juan@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={form.traveler_phone}
                    onChange={(e) => setForm({...form, traveler_phone: e.target.value})}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Passport Number</Label>
                <Input
                  value={form.passport_number}
                  onChange={(e) => setForm({...form, passport_number: e.target.value})}
                  placeholder="P1234567"
                />
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Trip Details</h3>
              <div className="space-y-2">
                <Label>Destination *</Label>
                <Input
                  value={form.destination}
                  onChange={(e) => setForm({...form, destination: e.target.value})}
                  placeholder="Japan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trip Start Date *</Label>
                  <Input
                    type="date"
                    value={form.trip_start_date}
                    onChange={(e) => setForm({...form, trip_start_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trip End Date *</Label>
                  <Input
                    type="date"
                    value={form.trip_end_date}
                    onChange={(e) => setForm({...form, trip_end_date: e.target.value})}
                    min={form.trip_start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Trip Cost (Optional)</Label>
                <Input
                  type="number"
                  value={form.trip_cost}
                  onChange={(e) => setForm({...form, trip_cost: e.target.value})}
                  placeholder="5000"
                />
                <p className="text-xs text-slate-500">For trip cancellation coverage calculation</p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900 mb-3">
                    By purchasing this insurance policy, you acknowledge that:
                  </p>
                  <ul className="text-xs text-amber-800 space-y-1 mb-3">
                    <li>• Coverage begins on the trip start date specified above</li>
                    <li>• Pre-existing medical conditions may not be covered</li>
                    <li>• Full policy terms will be sent via email</li>
                    <li>• Claims must be filed within 48 hours of incident</li>
                  </ul>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                    />
                    <label htmlFor="terms" className="text-xs text-amber-900 cursor-pointer">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreatePolicy}
              disabled={createPolicyMutation.isPending || !agreedToTerms}
              className="w-full"
            >
              {createPolicyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Premium Amount</p>
              <p className="text-3xl font-bold text-blue-600">${coverage.base_price}</p>
            </div>

            <Tabs defaultValue="stripe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                <TabsTrigger value="paymongo">E-Wallets</TabsTrigger>
              </TabsList>
              <TabsContent value="stripe" className="mt-6">
                <StripeCheckout
                  bookingType="insurance"
                  bookingId={policyId}
                  amount={coverage.base_price}
                  currency="USD"
                  onSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              <TabsContent value="paymongo" className="mt-6">
                <PayMongoPayment
                  amount={coverage.base_price * 56}
                  description={`Travel Insurance - ${coverage.name}`}
                  bookingId={policyId}
                  bookingType="insurance"
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
            <h3 className="text-xl font-bold mb-2">Policy Active!</h3>
            <p className="text-slate-600 mb-6">
              Your travel insurance is now active. Policy documents have been sent to {form.traveler_email}.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-2">Your Policy Details:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Policy ID: {policyId}</p>
                <p>• Coverage: Up to ${coverage.coverage_amount?.toLocaleString()}</p>
                <p>• Valid: {form.trip_start_date} to {form.trip_end_date}</p>
                <p>• 24/7 Emergency Hotline: +1-800-TRAVEL-911</p>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
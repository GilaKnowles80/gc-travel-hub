import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function PremiumMembership() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: membership } = useQuery({
    queryKey: ["premium-membership", user?.email],
    queryFn: async () => {
      const memberships = await base44.entities.PremiumMembership.filter({
        user_email: user.email,
        status: "active"
      });
      return memberships[0];
    },
    enabled: !!user,
  });

  const [capturing, setCapturing] = useState(false);

  // Capture PayPal payment on redirect back (?token=ORDERID appended by PayPal)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const planType = params.get("plan_type");
    if (token && planType) {
      setCapturing(true);
      base44.functions
        .invoke("capturePayPalOrder", {
          orderId: token,
          bookingData: { bookingType: "premium", plan_type: planType },
        })
        .then(() => {
          toast.success("Premium membership activated!");
          queryClient.invalidateQueries(["premium-membership"]);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((e) => toast.error(e.message || "Payment capture failed"))
        .finally(() => setCapturing(false));
    }
  }, []);

  // Payoneer manual-pay: creates a pending payment + support ticket so the
  // admin can send Payoneer account details and activate on receipt.
  const payoneerMutation = useMutation({
    mutationFn: async (planType) => {
      const price = planType === "annual" ? 4990 : 499;
      await base44.entities.Payment.create({
        user_email: user.email,
        booking_type: "premium",
        booking_id: `premium-payoneer-${planType}-${Date.now()}`,
        amount: price,
        currency: "PHP",
        payment_method: "payoneer",
        status: "pending",
        metadata: { plan_type: planType, method: "payoneer_manual" },
      });
      await base44.functions.invoke("createSupportTicket", {
        customerEmail: user.email,
        customerName: user.full_name || user.email,
        subject: `Premium Membership — Payoneer Payment (${planType})`,
        description: `User ${user.email} wants to pay ₱${price} via Payoneer for the ${planType} premium membership. Please send Payoneer account details and activate the membership on receipt.`,
        bookingType: "premium",
        priority: "medium",
      });
    },
    onSuccess: () => {
      toast.success("Request sent! We'll email you our Payoneer details within 24h.");
    },
    onError: (e) => toast.error(e.message || "Failed to submit request"),
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType) => {
      const res = await base44.functions.invoke("createPremiumCheckout", {
        plan_type: planType,
      });
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error(res?.error || "Could not start checkout");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout");
    },
  });

  const benefits = [
    { icon: "💰", text: "50% off service fees on all bookings" },
    { icon: "⭐", text: "2x loyalty points on every purchase" },
    { icon: "🎯", text: "Priority customer support" },
    { icon: "🎁", text: "Exclusive deals and early access" },
    { icon: "🔄", text: "Free cancellation on most bookings" },
    { icon: "📧", text: "Price drop alerts for saved trips" },
  ];

  if (membership) {
    const daysLeft = moment(membership.end_date).diff(moment(), "days");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-400">
            <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Premium Member</CardTitle>
                    <p className="text-amber-50 text-sm mt-1">
                      Active {membership.plan_type} plan
                    </p>
                  </div>
                </div>
                <Sparkles className="w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-semibold">
                    Expires: {moment(membership.end_date).format("MMMM D, YYYY")}
                  </p>
                  <Badge className="text-lg px-4 py-2">{daysLeft} days left</Badge>
                </div>
                <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                  <p className="text-2xl font-bold text-amber-600 mb-2">
                    ₱{membership.total_savings?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-600">Total savings so far</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Your Premium Benefits:</h3>
                <div className="grid gap-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="text-2xl">{benefit.icon}</span>
                      <span className="text-slate-700">{benefit.text}</span>
                      <Check className="w-5 h-5 text-green-600 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-slate-600">
            Save money on every booking and enjoy exclusive benefits
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Plan */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardTitle className="text-2xl">Monthly</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">₱499</span>
                <span className="text-slate-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-slate-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => subscribeMutation.mutate("monthly")}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Processing..." : "Start Monthly"}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative overflow-hidden border-2 border-amber-400 hover:shadow-2xl transition-shadow">
            <div className="absolute top-4 right-4">
              <Badge className="bg-amber-500 text-white">Save 17%</Badge>
            </div>
            <CardHeader className="bg-gradient-to-br from-amber-50 to-amber-100">
              <CardTitle className="text-2xl">Annual</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">₱4,990</span>
                <span className="text-slate-600">/year</span>
              </div>
              <p className="text-sm text-amber-700 mt-2">₱415/month - Best value!</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-slate-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600"
                size="lg"
                onClick={() => subscribeMutation.mutate("annual")}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Processing..." : "Start Annual"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payoneer manual option */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">Prefer to pay via Payoneer?</p>
              <p className="text-sm text-slate-500">
                No PayPal? No problem — request our Payoneer details and your membership activates once payment is received.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => payoneerMutation.mutate("monthly")}
                disabled={payoneerMutation.isPending}
              >
                {payoneerMutation.isPending ? "Sending…" : "Payoneer Monthly"}
              </Button>
              <Button
                variant="outline"
                className="border-amber-400 text-amber-600"
                onClick={() => payoneerMutation.mutate("annual")}
                disabled={payoneerMutation.isPending}
              >
                {payoneerMutation.isPending ? "Sending…" : "Payoneer Annual"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Savings Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>See How Much You'll Save</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600 mb-2">₱350</p>
                <p className="text-slate-600">Typical service fee saved per booking</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 mb-2">₱1,400</p>
                <p className="text-slate-600">Savings after just 4 bookings</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 mb-2">₱4,200</p>
                <p className="text-slate-600">Average annual savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
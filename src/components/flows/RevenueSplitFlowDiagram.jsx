import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, DollarSign, CreditCard, Plane, Building2, Shield, CheckCircle } from "lucide-react";

const Step = ({ icon, title, desc, color, badge }) => (
  <div className={`relative p-4 rounded-xl border-2 ${color} flex items-start gap-4`}>
    <div className="text-2xl shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-slate-900">{title}</p>
      {desc && <p className="text-sm text-slate-600 mt-0.5">{desc}</p>}
    </div>
    {badge && <Badge className="shrink-0 text-xs">{badge}</Badge>}
  </div>
);

const Arrow = ({ horizontal }) => horizontal
  ? <div className="flex items-center justify-center"><ArrowRight className="w-5 h-5 text-slate-400" /></div>
  : <div className="flex justify-center py-1"><ArrowDown className="w-5 h-5 text-slate-400" /></div>;

export default function RevenueSplitFlowDiagram() {
  const [activeTab, setActiveTab] = useState("flow");

  const suppliers = [
    { name: "Duffel API", icon: "✈️", type: "Flights (NDC)", color: "bg-blue-50 border-blue-300 text-blue-800" },
    { name: "Amadeus", icon: "🌐", type: "Flights / Hotels / Tours", color: "bg-purple-50 border-purple-300 text-purple-800" },
    { name: "Sabre", icon: "🛫", type: "GDS Flights & Hotels", color: "bg-indigo-50 border-indigo-300 text-indigo-800" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">GC Travel & Tours</h2>
        <p className="text-slate-600 mt-1">Professional OTA Revenue Split Flow — Expedia-Style</p>
        <div className="flex justify-center gap-2 mt-4">
          {["flow", "split", "suppliers"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "flow" ? "Payment Flow" : tab === "split" ? "80/20 Split" : "Suppliers"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "flow" && (
        <div className="space-y-2">
          <Step icon="🧳" title="Customer Selects Travel Product" desc="Flight / Hotel / Tour — powered by Duffel, Amadeus, or Sabre" color="bg-slate-50 border-slate-200" />
          <Arrow />
          <Step icon="🧮" title="System Calculates Final Price" desc="Base Fare (Supplier Cost) + 20% GC Travel Markup = Selling Price" color="bg-blue-50 border-blue-200" badge="Auto" />
          <Arrow />
          <Step icon="💳" title="Customer Clicks Pay Now" desc="Stripe Secure Checkout opens" color="bg-violet-50 border-violet-200" />
          <Arrow />
          <div className="p-4 rounded-xl border-2 bg-violet-50 border-violet-300">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-6 h-6 text-violet-600" />
              <p className="font-bold text-slate-900">Stripe Processes Payment</p>
              <Badge className="bg-violet-100 text-violet-700 border-violet-300">3D Secure + Fraud Check</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-1">✔ Debit Card</div>
              <div className="flex items-center gap-1">✔ Credit Card</div>
              <div className="flex items-center gap-1">✔ Apple / Google Pay</div>
            </div>
          </div>
          <Arrow />
          <Step icon="✅" title="Payment Successful" desc="Full amount lands in your Stripe account" color="bg-green-50 border-green-300" badge="Stripe Live" />
          <Arrow />
          <Step icon="⚡" title="Automatic Split Logic Triggered" desc="System separates your 20% profit from 80% supplier net cost" color="bg-amber-50 border-amber-300" badge="Automated" />
          <Arrow />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border-2 bg-green-50 border-green-400">
              <p className="font-bold text-green-800 mb-1">💰 20% → Your Profit</p>
              <p className="text-sm text-green-700">Retained in Stripe Balance</p>
              <p className="text-xs text-green-600 mt-1">Transfer to GCash: Gila Cain Knowles (+63-915-440-1150)</p>
            </div>
            <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-400">
              <p className="font-bold text-blue-800 mb-1">🏦 80% → Supplier</p>
              <p className="text-sm text-blue-700">Sent to supplier merchant account</p>
              <p className="text-xs text-blue-600 mt-1">Duffel / Amadeus / Sabre settlement</p>
            </div>
          </div>
          <Arrow />
          <Step icon="🎫" title="Supplier Issues Ticket / Confirmation" desc="Booking confirmed with supplier" color="bg-slate-50 border-slate-200" />
          <Arrow />
          <Step icon="📧" title="E-Ticket Sent to Customer" desc="Confirmation email dispatched automatically via Gmail" color="bg-emerald-50 border-emerald-300" badge="Done" />
        </div>
      )}

      {activeTab === "split" && (
        <div className="space-y-6">
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">💳 Example: ₱10,000 Flight Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Customer Pays Total</span>
                  <span className="text-2xl font-bold text-slate-900">₱10,000</span>
                </div>
              </div>
              <Arrow />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-400">
                  <p className="text-xs text-slate-500 mb-1">20% GC Travel Profit</p>
                  <p className="text-3xl font-bold text-green-700">₱2,000</p>
                  <p className="text-xs text-green-600 mt-2">→ Cash-in to GCash<br/>Gila Cain Knowles<br/>+63-915-440-1150</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-400">
                  <p className="text-xs text-slate-500 mb-1">80% Supplier Net Cost</p>
                  <p className="text-3xl font-bold text-blue-700">₱8,000</p>
                  <p className="text-xs text-blue-600 mt-2">→ Transferred to<br/>Duffel / Amadeus / Sabre<br/>Settlement Account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation: Stripe Destination Charges (Recommended)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: "1", title: "Customer pays full amount to your Stripe", color: "bg-slate-100" },
                { step: "2", title: "System records split in PaymentSplit entity (20% / 80%)", color: "bg-amber-50" },
                { step: "3", title: "Admin notified via email with supplier bank details", color: "bg-blue-50" },
                { step: "4", title: "Admin transfers 80% to supplier manually or via Stripe Transfer API", color: "bg-green-50" },
                { step: "5", title: "20% stays in Stripe balance → withdraw to GCash", color: "bg-green-100" },
              ].map(item => (
                <div key={item.step} className={`flex items-center gap-3 p-3 rounded-lg ${item.color}`}>
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{item.step}</div>
                  <p className="text-sm text-slate-700">{item.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-900">System Status: ACTIVE</p>
                  <p className="text-sm text-green-700">processSplitPayment function is live and tracking all bookings via SupplierPayment entity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "suppliers" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {suppliers.map((s, i) => (
              <div key={i} className={`p-5 rounded-xl border-2 ${s.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{s.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">{s.type}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/70 p-2 rounded">
                    <p className="text-xs text-slate-500">GC Receives</p>
                    <p className="font-bold">100% from Customer</p>
                  </div>
                  <div className="bg-white/70 p-2 rounded">
                    <p className="text-xs text-slate-500">GC Keeps</p>
                    <p className="font-bold text-green-700">20% Markup</p>
                  </div>
                  <div className="bg-white/70 p-2 rounded">
                    <p className="text-xs text-slate-500">Supplier Gets</p>
                    <p className="font-bold text-blue-700">80% Net Cost</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Supplier Settlement Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span>✈️</span><span>Booked via <strong>Duffel</strong> → Pay to Duffel Bank Account</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <span>🌐</span><span>Booked via <strong>Amadeus</strong> → Pay to Amadeus Settlement Account</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded">
                <span>🛫</span><span>Booked via <strong>Sabre</strong> → Pay to Sabre Settlement Account</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 text-base">Your GCash Details (20% Profit Destination)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Account Name:</span><span className="font-bold">Gila Cain Knowles</span></div>
              <div className="flex justify-between"><span className="text-slate-600">GCash Number:</span><span className="font-bold">+63-915-440-1150</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Split:</span><span className="font-bold text-green-700">20% of every transaction</span></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
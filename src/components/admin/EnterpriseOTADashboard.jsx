import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Shield, DollarSign, Code, TrendingUp, Zap, BookOpen, Globe, CreditCard, Plane, ArrowDown, ArrowRight } from "lucide-react";
import moment from "moment";

const TABS = [
  { key: "workflow", label: "API Workflow" },
  { key: "investor", label: "Investor Deck" },
  { key: "profit", label: "Profit Dashboard" },
  { key: "webhooks", label: "Webhook Blueprint" },
  { key: "legal", label: "Legal Terms" },
];

// ─── Profit Dashboard ────────────────────────────────────────────────────────
function ProfitDashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["enterprise-profit"],
    queryFn: async () => {
      const payments = await base44.entities.Payment.filter({ status: "completed" });
      const grossRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const supplierCost = grossRevenue * 0.80;
      const agencyRevenue = grossRevenue * 0.20;
      const stripeFees = grossRevenue * 0.029;
      const netProfit = agencyRevenue - stripeFees;
      const netMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : "17.0";

      // Monthly trend
      const monthlyMap = {};
      payments.forEach(p => {
        const m = moment(p.created_date).format("MMM YY");
        if (!monthlyMap[m]) monthlyMap[m] = { month: m, gbv: 0, revenue: 0, netProfit: 0, bookings: 0 };
        monthlyMap[m].gbv += p.amount || 0;
        monthlyMap[m].revenue += (p.amount || 0) * 0.20;
        monthlyMap[m].netProfit += (p.amount || 0) * 0.20 - (p.amount || 0) * 0.029;
        monthlyMap[m].bookings += 1;
      });

      return {
        totalBookings: payments.length,
        grossRevenue,
        supplierCost,
        agencyRevenue,
        stripeFees,
        netProfit,
        netMargin,
        monthly: Object.values(monthlyMap).slice(-6),
      };
    },
  });

  const fmt = (n) => `₱${(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kpis = [
    { label: "Total Bookings", value: data?.totalBookings || 0, suffix: "", color: "text-slate-900", bg: "bg-slate-50 border-slate-200" },
    { label: "Gross Booking Value", value: fmt(data?.grossRevenue), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    { label: "Supplier Cost (80%)", value: fmt(data?.supplierCost), color: "text-red-600", bg: "bg-red-50 border-red-200" },
    { label: "GC Travel Revenue (20%)", value: fmt(data?.agencyRevenue), color: "text-green-700", bg: "bg-green-50 border-green-200" },
    { label: "Stripe Fees (~2.9%)", value: fmt(data?.stripeFees), color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
    { label: "Net Profit", value: fmt(data?.netProfit), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300 border-2" },
    { label: "Net Margin", value: `${data?.netMargin || "17.0"}%`, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={`text-xl font-black ${k.color}`}>{isLoading ? "..." : k.value}</p>
          </div>
        ))}
      </div>

      {/* Profit Formula */}
      <Card className="bg-slate-900 border-0 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2"><Code className="w-4 h-4" /> Profit Calculation Formula</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-sm space-y-2">
          <p><span className="text-green-400">GrossRevenue</span> = sum(all completed payments)</p>
          <p><span className="text-red-400">SupplierCost</span> = GrossRevenue × <span className="text-amber-300">0.80</span></p>
          <p><span className="text-green-400">AgencyRevenue</span> = GrossRevenue × <span className="text-amber-300">0.20</span></p>
          <p><span className="text-violet-400">StripeFees</span> = GrossRevenue × <span className="text-amber-300">0.029</span></p>
          <div className="border-t border-slate-700 pt-2">
            <p><span className="text-emerald-400 font-bold">NetProfit</span> = AgencyRevenue − StripeFees</p>
            <p className="text-slate-400 text-xs mt-1">// ~17.1% net margin after Stripe fees</p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Table */}
      {data?.monthly?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Monthly Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500 uppercase">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Bookings</th>
                    <th className="text-right py-2">GBV</th>
                    <th className="text-right py-2">GC Revenue</th>
                    <th className="text-right py-2">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.monthly.map(m => (
                    <tr key={m.month} className="hover:bg-slate-50">
                      <td className="py-2 font-medium">{m.month}</td>
                      <td className="py-2 text-right">{m.bookings}</td>
                      <td className="py-2 text-right text-blue-700">{fmt(m.gbv)}</td>
                      <td className="py-2 text-right text-green-700">{fmt(m.revenue)}</td>
                      <td className="py-2 text-right text-emerald-700 font-bold">{fmt(m.netProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── API Workflow ─────────────────────────────────────────────────────────────
function APIWorkflowTab() {
  const [activeFlow, setActiveFlow] = useState("search");
  const flows = [
    { key: "search", label: "A) Search Flow" },
    { key: "payment", label: "B) Payment Flow" },
    { key: "ticketing", label: "C) Ticketing Flow" },
  ];

  const codeBlocks = {
    search: `FUNCTION searchFlights(origin, destination, date):

  supplierResponses = []

  duffelResults   = callDuffelAPI(origin, destination, date)
  amadeusResults  = callAmadeusAPI(origin, destination, date)
  sabreResults    = callSabreAPI(origin, destination, date)

  supplierResponses.append(duffelResults)
  supplierResponses.append(amadeusResults)
  supplierResponses.append(sabreResults)

  mergedResults = normalizeAndMerge(supplierResponses)

  FOR each result IN mergedResults:
      result.markupPrice = result.baseFare * 1.20  // +20%

  RETURN mergedResults`,
    payment: `FUNCTION processPayment(bookingID, totalAmount, supplierID):

  supplierAmount = totalAmount * 0.80   // 80% to supplier
  agencyMarkup   = totalAmount * 0.20   // 20% to GC Travel

  stripeCharge = Stripe.createCharge(
      amount   = totalAmount,
      currency = "PHP",
      transfer_data = {
          destination : supplierConnectedAccount,
          amount      : supplierAmount          // ₱80,000
      },
      application_fee_amount = agencyMarkup     // ₱20,000
  )

  IF stripeCharge.success:
      confirmBookingWithSupplier(bookingID)
      storeRevenue(agencyMarkup)
      RETURN "SUCCESS"
  ELSE:
      RETURN "FAILED"`,
    ticketing: `FUNCTION confirmBookingWithSupplier(bookingID):

  supplier = getSupplierForBooking(bookingID)

  IF supplier == "Duffel":
      ticket = callDuffelIssueTicket(bookingID)

  IF supplier == "Amadeus":
      ticket = callAmadeusIssueTicket(bookingID)

  IF supplier == "Sabre":
      ticket = callSabreIssueTicket(bookingID)

  updateBookingStatus("TICKETED")
  sendEticketToCustomer(ticket)
  RETURN ticket`,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {flows.map(f => (
          <button key={f.key} onClick={() => setActiveFlow(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFlow === f.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card className="bg-slate-950 border-slate-800">
        <CardContent className="pt-4">
          <pre className="text-sm text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">{codeBlocks[activeFlow]}</pre>
        </CardContent>
      </Card>

      {/* Visual Flow for Search */}
      {activeFlow === "search" && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Duffel API", status: "Live", color: "border-green-400 bg-green-50", badge: "bg-green-100 text-green-700" },
            { name: "Amadeus API", status: "Live", color: "border-green-400 bg-green-50", badge: "bg-green-100 text-green-700" },
            { name: "Sabre API", status: "Planned", color: "border-amber-400 bg-amber-50", badge: "bg-amber-100 text-amber-700" },
          ].map(api => (
            <div key={api.name} className={`rounded-xl border-2 p-4 ${api.color}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-800">{api.name}</p>
                <Badge className={api.badge}>{api.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">Returns net fare → System adds 20% markup</p>
            </div>
          ))}
        </div>
      )}

      {/* Visual for Payment */}
      {activeFlow === "payment" && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="rounded-xl bg-blue-50 border-2 border-blue-300 px-6 py-3 text-center">
            <p className="text-sm font-bold text-blue-900">Customer Pays ₱100,000</p>
            <p className="text-xs text-blue-600">via Stripe Checkout</p>
          </div>
          <ArrowDown className="w-5 h-5 text-slate-400" />
          <div className="rounded-xl bg-violet-50 border-2 border-violet-300 px-6 py-3 text-center">
            <p className="text-sm font-bold text-violet-900">Stripe Destination Charge</p>
            <p className="text-xs text-violet-600">Automatic split on capture</p>
          </div>
          <ArrowDown className="w-5 h-5 text-slate-400" />
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl bg-green-50 border-2 border-green-400 px-6 py-3 text-center">
              <p className="text-2xl font-black text-green-700">₱20,000</p>
              <p className="text-xs text-green-600 font-medium">GC Travel (20%)</p>
              <p className="text-xs text-green-500">→ GCash: Gila Cain Knowles</p>
            </div>
            <div className="rounded-xl bg-blue-50 border-2 border-blue-400 px-6 py-3 text-center">
              <p className="text-2xl font-black text-blue-700">₱80,000</p>
              <p className="text-xs text-blue-600 font-medium">Supplier (80%)</p>
              <p className="text-xs text-blue-500">→ Duffel / Amadeus / Sabre</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Investor Deck ────────────────────────────────────────────────────────────
function InvestorTab() {
  return (
    <div className="space-y-6">
      {/* Architecture Diagram */}
      <Card className="border-2 border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardHeader><CardTitle className="text-center text-amber-400">GC Travel — Enterprise OTA Architecture</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl bg-white/10 border border-white/20 px-8 py-3 text-center">
              <Globe className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="font-bold text-white">Customer</p>
              <p className="text-xs text-slate-300">Web / Mobile App</p>
            </div>
            <ArrowDown className="w-4 h-4 text-amber-400" />
            <div className="rounded-xl bg-amber-500/20 border-2 border-amber-400 px-8 py-3 text-center w-full max-w-xs">
              <p className="font-bold text-amber-300">GC Travel Platform</p>
              <p className="text-xs text-amber-200">Base44 Infrastructure</p>
            </div>
            <div className="flex gap-6 w-full max-w-lg">
              <div className="flex-1 rounded-xl bg-sky-500/20 border border-sky-400 p-3 text-center">
                <Plane className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                <p className="text-sm font-bold text-sky-200">Travel APIs</p>
                <p className="text-xs text-sky-300">Duffel · Amadeus · Sabre</p>
              </div>
              <div className="flex-1 rounded-xl bg-violet-500/20 border border-violet-400 p-3 text-center">
                <CreditCard className="w-4 h-4 text-violet-300 mx-auto mb-1" />
                <p className="text-sm font-bold text-violet-200">Stripe Gateway</p>
                <p className="text-xs text-violet-300">80/20 Auto Split</p>
              </div>
            </div>
            <div className="flex gap-6 w-full max-w-lg">
              <div className="flex-1 rounded-xl bg-blue-500/20 border border-blue-400 p-3 text-center">
                <p className="text-xs text-blue-300 font-medium">80% → Supplier</p>
              </div>
              <div className="flex-1 rounded-xl bg-green-500/20 border-2 border-green-400 p-3 text-center">
                <p className="text-xs text-green-300 font-medium">20% → GC Travel</p>
                <p className="text-xs text-green-400">Bank → GCash</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader><CardTitle className="text-green-800 text-sm">Revenue Model Slide</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Gross Booking Value (GBV)", value: "100%", color: "text-slate-900" },
              { label: "20% Markup Retained", value: "+20%", color: "text-green-700" },
              { label: "Stripe Fee (~2.9%)", value: "−2.9%", color: "text-red-600" },
              { label: "Net Margin", value: "~17%", color: "text-emerald-700 font-black text-xl" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-green-200 pb-2">
                <p className="text-sm text-slate-700">{row.label}</p>
                <p className={`font-bold ${row.color}`}>{row.value}</p>
              </div>
            ))}
            <p className="text-xs text-green-700 mt-2 font-medium">✔ Scalable without inventory ownership</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader><CardTitle className="text-blue-800 text-sm">Competitive Advantages</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "Asset-light: No planes, hotels, or buses owned",
              "Multi-supplier: Duffel + Amadeus + Sabre = best prices",
              "Auto 80/20 split via Stripe Connect",
              "Scalable to any volume without capex",
              "Zero inventory risk — pure agency model",
              "~17% net margin per transaction",
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Webhook Blueprint ────────────────────────────────────────────────────────
function WebhookTab() {
  const events = [
    {
      event: "payment_intent.succeeded",
      color: "border-green-400 bg-green-50",
      badge: "bg-green-100 text-green-700",
      actions: ["markBookingPaid()", "triggerSupplierTicketing()", "sendEmailReceipt()", "storeRevenue(agencyMarkup)"],
    },
    {
      event: "payment_intent.payment_failed",
      color: "border-red-400 bg-red-50",
      badge: "bg-red-100 text-red-700",
      actions: ["markBookingFailed()", "sendFailureEmail()", "releaseInventoryHold()"],
    },
    {
      event: "charge.refunded",
      color: "border-amber-400 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      actions: ["updateRefundLedger()", "reverseRevenueEntry()", "notifyCustomer()"],
    },
    {
      event: "charge.dispute.created",
      color: "border-red-500 bg-red-50",
      badge: "bg-red-100 text-red-800",
      actions: ["freezeBookingProfit()", "notifyFinanceTeam()", "collectEvidence()"],
    },
    {
      event: "payout.paid",
      color: "border-blue-400 bg-blue-50",
      badge: "bg-blue-100 text-blue-700",
      actions: ["recordPayoutInLedger()", "updateCashBalance()"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {events.map(e => (
          <div key={e.event} className={`rounded-xl border-2 p-4 ${e.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-4 h-4 text-slate-600" />
              <code className="text-sm font-bold text-slate-900">{e.event}</code>
              <Badge className={e.badge}>Listen</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {e.actions.map(a => (
                <span key={a} className="bg-white/70 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700">{a}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security Rules */}
      <Card className="border-2 border-slate-900 bg-slate-900 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Webhook Security Rules</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-sm space-y-2 text-green-300">
          <p>✔ Verify Stripe-Signature header on every request</p>
          <p>✔ Log all webhook events to AuditLog entity</p>
          <p>✔ Use idempotency keys to prevent duplicate processing</p>
          <p>✔ Return 200 immediately, process async</p>
          <p>✔ Auto-retry with exponential backoff on failure</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Legal Terms ──────────────────────────────────────────────────────────────
function LegalTab() {
  const clauses = [
    {
      title: "1. Role of Agency",
      content: "GC Travel acts as an intermediary between customers and travel suppliers including but not limited to airlines, hotels, and third-party providers via Duffel, Amadeus, and Sabre systems.",
    },
    {
      title: "2. Pricing & Markup",
      content: `All displayed prices include a service and facilitation markup of up to 20% applied by GC Travel. This markup covers: (a) Booking processing, (b) Platform usage, (c) Customer support, (d) Administrative services. The service fee portion is non-refundable once booking is confirmed.`,
    },
    {
      title: "3. Payment Processing",
      content: "All card payments are processed securely via Stripe. GC Travel does not store card data. Payments are subject to Stripe's terms of service.",
    },
    {
      title: "4. Refund Policy",
      content: "Refunds are subject to supplier fare rules. If a booking is refundable: (a) Supplier cost will be refunded; (b) Service markup may be retained by GC Travel. Non-refundable bookings cannot be cancelled for a refund.",
    },
    {
      title: "5. Chargebacks",
      content: "If a customer initiates a payment dispute: GC Travel reserves the right to suspend services. Evidence including booking confirmation, IP address logs, 3D Secure proof, and customer agreement will be submitted to the issuing bank. Fraudulent disputes may lead to blacklisting.",
    },
    {
      title: "6. Limitation of Liability",
      content: "GC Travel is not liable for: Airline schedule changes or cancellations, Acts of force majeure, Supplier insolvency, Third-party API outages or data errors.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 border-2 border-amber-400 p-4 mb-2">
        <p className="font-bold text-amber-800 text-sm mb-1">📋 Copy-Ready Service Fee Clause</p>
        <p className="text-sm text-amber-900 italic">
          "GC Travel and Tours Agency applies a service and facilitation fee of up to 20% on published supplier fares. This fee covers booking, processing, and customer support services and is non-refundable once booking is confirmed."
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {clauses.map(c => (
          <Card key={c.title} className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-800 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {c.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-green-800 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Full OTA Stack Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {["API Aggregation Layer", "Stripe 80/20 Auto Split", "Profit Automation", "Refund Protection", "Chargeback Defense", "Legal Protection", "Investor-Ready Architecture", "Webhook Automation", "~17% Net Margin"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs text-green-800">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EnterpriseOTADashboard() {
  const [activeTab, setActiveTab] = useState("workflow");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Enterprise OTA Infrastructure</h2>
          <p className="text-slate-500 text-sm">Base44 + Stripe + Duffel + Amadeus + Sabre — 80/20 Revenue Split</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "workflow" && <APIWorkflowTab />}
      {activeTab === "investor" && <InvestorTab />}
      {activeTab === "profit" && <ProfitDashboardTab />}
      {activeTab === "webhooks" && <WebhookTab />}
      {activeTab === "legal" && <LegalTab />}
    </div>
  );
}
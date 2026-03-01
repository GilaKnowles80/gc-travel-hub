import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PHASES = [
  {
    id: "phase01", num: "01", color: "bg-blue-500", lightColor: "bg-blue-50 border-blue-200", textColor: "text-blue-700",
    title: "Customer Acquisition", emoji: "🌍",
    nodes: ["Facebook / Google Ad", "Direct Website Visit", "White-label Partner Site"],
    arrow: "Customer lands on GC Travel Platform → Creates Account / Guest Checkout",
  },
  {
    id: "phase02", num: "02", color: "bg-indigo-500", lightColor: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-700",
    title: "Search & Price Engine", emoji: "🔎",
    nodes: ["Enter Origin / Destination / Date", "Query: Duffel + Amadeus + Sabre", "Receive Net Fares", "Normalize Results", "Apply Dynamic Markup 15–30% (default 20%)", "Display Final Selling Price"],
    arrow: null,
  },
  {
    id: "phase03", num: "03", color: "bg-violet-500", lightColor: "bg-violet-50 border-violet-200", textColor: "text-violet-700",
    title: "Booking Creation", emoji: "🛒",
    nodes: ["Customer Selects Flight", "Passenger Details Entered", "Temp Booking Created — Status: PENDING PAYMENT", "Redirect to Stripe Checkout"],
    arrow: null,
  },
  {
    id: "phase04", num: "04", color: "bg-green-600", lightColor: "bg-green-50 border-green-200", textColor: "text-green-700",
    title: "Payment Processing", emoji: "💳",
    nodes: ["Card Validation + 3D Secure + Fraud Check", "Payment Captured in Full", "Stripe Connect Split: 80% → Supplier / 20% → GC Travel"],
    arrow: null,
    highlight: true,
  },
  {
    id: "phase05", num: "05", color: "bg-teal-600", lightColor: "bg-teal-50 border-teal-200", textColor: "text-teal-700",
    title: "Ticketing", emoji: "🎫",
    nodes: ["Stripe Webhook Triggered", "Booking Marked PAID", "API Call → Supplier Issues Ticket", "Receive PNR + Ticket Number", "Status → TICKETED", "E-Ticket Email Sent"],
    arrow: null,
  },
  {
    id: "phase06", num: "06", color: "bg-emerald-600", lightColor: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-700",
    title: "Profit Flow", emoji: "💰",
    nodes: ["20% Profit in Stripe Balance", "Stripe Fees Deducted (~2.9%)", "Net Profit Available", "Payout to Bank Account", "Transfer to GCash", "Revenue Recorded in Accounting"],
    arrow: null,
  },
  {
    id: "phase07", num: "07", color: "bg-blue-600", lightColor: "bg-blue-50 border-blue-200", textColor: "text-blue-700",
    title: "Accounting & Reporting", emoji: "📊",
    nodes: ["Gross Booking Value logged", "Supplier Cost (80%) recorded", "Markup Revenue (20%) recorded", "Stripe Fee recorded", "Net Profit calculated", "Dashboard: Sales / Profit / Refunds / Chargebacks"],
    arrow: null,
  },
  {
    id: "phase08", num: "08", color: "bg-amber-600", lightColor: "bg-amber-50 border-amber-200", textColor: "text-amber-700",
    title: "Refund Workflow", emoji: "🔁",
    nodes: ["Customer Requests Refund", "Check Fare Rules", "Non-refundable → Deny", "Refundable → Cancel via API", "Supplier Refund (80%)", "Stripe Refund Issued", "Reverse 20% Revenue (if policy)", "Update Accounting"],
    arrow: null,
  },
  {
    id: "phase09", num: "09", color: "bg-red-600", lightColor: "bg-red-50 border-red-200", textColor: "text-red-700",
    title: "Chargeback Workflow", emoji: "⚠️",
    nodes: ["Customer Disputes → Stripe Deducts 100%", "Collect: Booking Confirmation + 3DS + IP Log", "Submit Evidence to Stripe", "WIN → Funds Returned", "LOSE → Funds Lost → Write Off", "Update Risk Dashboard"],
    arrow: null,
  },
  {
    id: "phase10", num: "10", color: "bg-purple-600", lightColor: "bg-purple-50 border-purple-200", textColor: "text-purple-700",
    title: "AI Dynamic Pricing", emoji: "🤖",
    nodes: ["Monitor: Route Demand + Conversion + Seasonality + Customer Type", "Adjust Markup: 15% – 30%", "Increase Margin Automatically"],
    arrow: null,
  },
  {
    id: "phase11", num: "11", color: "bg-cyan-600", lightColor: "bg-cyan-50 border-cyan-200", textColor: "text-cyan-700",
    title: "White-Label Partner Flow", emoji: "🏢",
    nodes: ["Sub-Agent Logs Into Portal", "Search & Book Using GC Platform", "Customer Pays", "80% → Supplier / 10% → Sub-Agent / 10% → GC Travel"],
    arrow: null,
  },
  {
    id: "phase12", num: "12", color: "bg-orange-600", lightColor: "bg-orange-50 border-orange-200", textColor: "text-orange-700",
    title: "Franchise Model", emoji: "🏬",
    nodes: ["Franchisee Uses GC System", "Books Under Franchise Code", "Monthly Revenue Report Generated", "5–10% Royalty Paid to GC Travel"],
    arrow: null,
  },
  {
    id: "phase13", num: "13", color: "bg-slate-700", lightColor: "bg-slate-50 border-slate-200", textColor: "text-slate-700",
    title: "Risk Management Loop", emoji: "🔐",
    nodes: ["Daily: Stripe Reconciliation + Supplier Settlement", "Weekly: Refund Audit + Chargeback Monitoring", "Monthly: Profit Review + Risk Reserve Allocation"],
    arrow: null,
  },
  {
    id: "phase14", num: "14", color: "bg-sky-600", lightColor: "bg-sky-50 border-sky-200", textColor: "text-sky-700",
    title: "Multi-Currency Expansion", emoji: "🌎",
    nodes: ["Detect User Location", "Display Local Currency (PHP, USD, EUR, SGD)", "Stripe Charges in Local Currency", "Revenue Recorded Per Currency Ledger"],
    arrow: null,
  },
];

const SUMMARY_ITEMS = [
  "OTA Booking Engine", "Multi-Supplier API Aggregation", "80/20 Auto Revenue Split",
  "Stripe Webhook Automation", "Refund & Dispute System", "Accounting Framework",
  "AI Pricing Engine", "White-Label Infrastructure", "Franchise Model", "Risk Management",
];

function PhaseCard({ phase, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`text-left w-full p-3 rounded-xl border-2 transition-all ${isActive ? phase.lightColor + " shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
      <div className="flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg text-white text-xs font-black flex items-center justify-center shrink-0 ${phase.color}`}>{phase.num}</span>
        <span className="text-sm font-semibold text-slate-800">{phase.emoji} {phase.title}</span>
      </div>
    </button>
  );
}

function PhaseDetail({ phase }) {
  return (
    <Card className={`border-2 ${phase.lightColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-xl text-white text-base font-black flex items-center justify-center shrink-0 ${phase.color}`}>{phase.num}</span>
          <div>
            <CardTitle className={`text-lg ${phase.textColor}`}>{phase.emoji} Phase {phase.num} — {phase.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phase.nodes.map((node, i) => (
            <div key={i} className="flex items-start gap-3">
              {i < phase.nodes.length - 1 && (
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <div className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${phase.color}`}>{i + 1}</div>
                  <div className="w-0.5 h-4 bg-slate-300 mt-1" />
                </div>
              )}
              {i === phase.nodes.length - 1 && (
                <div className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1 ${phase.color}`}>{i + 1}</div>
              )}
              <p className={`text-sm py-1 ${node.includes("→") || node.includes("WIN") || node.includes("TICKETED") ? "font-semibold " + phase.textColor : "text-slate-700"}`}>{node}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MasterWorkflowDiagram() {
  const [activePhase, setActivePhase] = useState("phase01");
  const phase = PHASES.find(p => p.id === activePhase);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-black mb-1">🔥 Master End-to-End Workflow</h2>
        <p className="text-slate-300 text-sm">GC Travel and Tours Agency — Complete OTA System (14 Phases)</p>
        <div className="mt-4 p-3 bg-white/10 rounded-xl text-xs font-mono text-green-300">
          Customer → Search → API → Markup → Stripe → 80% Supplier / 20% GC → Ticket → Profit → Accounting → AI Optimise → White-label + Franchise
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Phase Selector */}
        <div className="space-y-2 lg:col-span-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Phase</p>
          {PHASES.map(p => (
            <PhaseCard key={p.id} phase={p} isActive={activePhase === p.id} onClick={() => setActivePhase(p.id)} />
          ))}
        </div>

        {/* Phase Detail */}
        <div className="lg:col-span-2 space-y-4">
          {phase && <PhaseDetail phase={phase} />}

          {/* Linear flow strip */}
          <Card className="border-0 bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Full Pipeline at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 items-center">
                {PHASES.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <button
                      onClick={() => setActivePhase(p.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${activePhase === p.id ? p.color + " text-white shadow-md scale-110" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                    >
                      {p.emoji} {p.num}
                    </button>
                    {i < PHASES.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1">
                {PHASES.map(p => (
                  <div key={p.id} className={`text-xs ${activePhase === p.id ? "font-bold " + p.textColor : "text-slate-400"}`}>
                    {p.num}. {p.title}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Summary */}
      <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-800">🎯 System Capabilities — GC Travel Now Has:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUMMARY_ITEMS.map(item => (
              <Badge key={item} className="bg-amber-100 text-amber-800 border border-amber-300 text-xs py-1">✔ {item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
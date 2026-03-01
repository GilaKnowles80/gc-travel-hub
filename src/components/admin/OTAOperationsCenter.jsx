import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Shield, Database, Globe, Smartphone, BookOpen, DollarSign, TrendingUp, Users, Zap, Lock, RefreshCw, BarChart2 } from "lucide-react";

const TABS = [
  { key: "schema", label: "DB Schema" },
  { key: "risk", label: "Risk Management" },
  { key: "currency", label: "Multi-Currency" },
  { key: "mobile", label: "Mobile App" },
  { key: "ops", label: "Operations Manual" },
];

// ─── DB Schema ────────────────────────────────────────────────────────────────
const TABLES = [
  {
    name: "users",
    color: "border-blue-400 bg-blue-50",
    headerColor: "bg-blue-100 text-blue-800",
    fields: [
      { name: "id", type: "UUID", note: "Primary Key" },
      { name: "full_name", type: "STRING" },
      { name: "email", type: "STRING", note: "Unique" },
      { name: "phone", type: "STRING" },
      { name: "password_hash", type: "STRING", note: "Hashed" },
      { name: "role", type: "ENUM", note: "customer / agent / admin / finance" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "status", type: "ENUM", note: "active / suspended" },
    ],
  },
  {
    name: "bookings",
    color: "border-green-400 bg-green-50",
    headerColor: "bg-green-100 text-green-800",
    fields: [
      { name: "id", type: "UUID", note: "Primary Key" },
      { name: "user_id", type: "FK", note: "→ users" },
      { name: "supplier", type: "ENUM", note: "Duffel / Amadeus / Sabre" },
      { name: "booking_reference", type: "STRING" },
      { name: "booking_status", type: "ENUM", note: "pending / paid / ticketed / cancelled / refunded" },
      { name: "total_amount", type: "DECIMAL" },
      { name: "supplier_amount", type: "DECIMAL", note: "80%" },
      { name: "agency_markup", type: "DECIMAL", note: "20%" },
      { name: "stripe_payment_id", type: "STRING" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "flight_segments",
    color: "border-sky-400 bg-sky-50",
    headerColor: "bg-sky-100 text-sky-800",
    fields: [
      { name: "id", type: "UUID" },
      { name: "booking_id", type: "FK", note: "→ bookings" },
      { name: "airline_code", type: "STRING" },
      { name: "flight_number", type: "STRING" },
      { name: "departure_airport", type: "STRING", note: "IATA code" },
      { name: "arrival_airport", type: "STRING", note: "IATA code" },
      { name: "departure_time", type: "TIMESTAMP" },
      { name: "arrival_time", type: "TIMESTAMP" },
      { name: "fare_class", type: "STRING" },
    ],
  },
  {
    name: "payments",
    color: "border-violet-400 bg-violet-50",
    headerColor: "bg-violet-100 text-violet-800",
    fields: [
      { name: "id", type: "UUID" },
      { name: "booking_id", type: "FK", note: "→ bookings" },
      { name: "stripe_charge_id", type: "STRING" },
      { name: "amount", type: "DECIMAL" },
      { name: "stripe_fee", type: "DECIMAL", note: "~2.9%" },
      { name: "net_received", type: "DECIMAL" },
      { name: "status", type: "ENUM", note: "success / failed / refunded / disputed" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "revenues",
    color: "border-emerald-400 bg-emerald-50",
    headerColor: "bg-emerald-100 text-emerald-800",
    fields: [
      { name: "id", type: "UUID" },
      { name: "booking_id", type: "FK", note: "→ bookings" },
      { name: "gross_amount", type: "DECIMAL" },
      { name: "supplier_cost", type: "DECIMAL", note: "80%" },
      { name: "markup_amount", type: "DECIMAL", note: "20%" },
      { name: "stripe_fee", type: "DECIMAL" },
      { name: "net_profit", type: "DECIMAL" },
      { name: "recorded_date", type: "TIMESTAMP" },
    ],
  },
  {
    name: "refunds",
    color: "border-amber-400 bg-amber-50",
    headerColor: "bg-amber-100 text-amber-800",
    fields: [
      { name: "id", type: "UUID" },
      { name: "booking_id", type: "FK", note: "→ bookings" },
      { name: "stripe_refund_id", type: "STRING" },
      { name: "supplier_refund_amount", type: "DECIMAL" },
      { name: "agency_retained_fee", type: "DECIMAL" },
      { name: "status", type: "ENUM", note: "pending / processed / failed" },
      { name: "processed_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "chargebacks",
    color: "border-red-400 bg-red-50",
    headerColor: "bg-red-100 text-red-800",
    fields: [
      { name: "id", type: "UUID" },
      { name: "booking_id", type: "FK", note: "→ bookings" },
      { name: "dispute_id", type: "STRING", note: "Stripe dispute ID" },
      { name: "reason", type: "STRING" },
      { name: "amount", type: "DECIMAL" },
      { name: "evidence_submitted", type: "BOOLEAN" },
      { name: "status", type: "ENUM", note: "open / won / lost" },
      { name: "decision_date", type: "DATE" },
    ],
  },
];

function SchemaTab() {
  const [activeTable, setActiveTable] = useState("bookings");
  const table = TABLES.find(t => t.name === activeTable);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABLES.map(t => (
          <button key={t.name} onClick={() => setActiveTable(t.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${activeTable === t.name ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {t.name}
          </button>
        ))}
      </div>

      {table && (
        <Card className={`border-2 ${table.color}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm px-3 py-1 rounded-lg inline-flex items-center gap-2 w-fit ${table.headerColor}`}>
              <Database className="w-3.5 h-3.5" />
              {table.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500 uppercase">
                    <th className="text-left py-2 pr-4">Column</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.fields.map(f => (
                    <tr key={f.name} className="hover:bg-white/50">
                      <td className="py-2 pr-4 font-mono font-semibold text-slate-800">{f.name}</td>
                      <td className="py-2 pr-4">
                        <Badge className={f.type === "FK" ? "bg-orange-100 text-orange-700" : f.type === "ENUM" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}>
                          {f.type}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs text-slate-500">{f.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ERD Summary */}
      <Card className="bg-slate-900 border-0 text-white">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Entity Relationship Summary</CardTitle></CardHeader>
        <CardContent className="font-mono text-xs text-green-300 space-y-1">
          <p>users ──&lt; bookings ──&lt; flight_segments</p>
          <p>bookings ──&lt; payments</p>
          <p>bookings ──&lt; revenues</p>
          <p>bookings ──&lt; refunds</p>
          <p>bookings ──&lt; chargebacks</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Risk Management ──────────────────────────────────────────────────────────
function RiskTab() {
  const risks = [
    {
      category: "Payment Risk",
      icon: Shield,
      color: "border-red-300 bg-red-50",
      headerColor: "text-red-800",
      items: [
        { label: "3D Secure (Stripe Radar)", status: "active" },
        { label: "Fraud Radar Rules", status: "active" },
        { label: "Velocity Checks (multi-card bookings)", status: "active" },
        { label: "Chargeback Monitoring < 0.9%", status: "monitor" },
      ],
    },
    {
      category: "Supplier Risk",
      icon: Zap,
      color: "border-amber-300 bg-amber-50",
      headerColor: "text-amber-800",
      items: [
        { label: "API Failure Fallback Logic", status: "active" },
        { label: "Multi-Supplier Redundancy (Duffel→Amadeus→Sabre)", status: "active" },
        { label: "Pre-Ticket Verification", status: "active" },
        { label: "Weekly Settlement Reconciliation", status: "planned" },
      ],
    },
    {
      category: "Financial Risk",
      icon: DollarSign,
      color: "border-green-300 bg-green-50",
      headerColor: "text-green-800",
      items: [
        { label: "10% Reserve Buffer Maintained", status: "planned" },
        { label: "Daily Stripe Reconciliation", status: "active" },
        { label: "Chargeback Reserve Account", status: "planned" },
        { label: "Refund Tracking Ledger", status: "active" },
      ],
    },
    {
      category: "Legal Risk",
      icon: BookOpen,
      color: "border-blue-300 bg-blue-50",
      headerColor: "text-blue-800",
      items: [
        { label: "Clear Markup Disclosure in Terms", status: "active" },
        { label: "Cancellation Policy Published", status: "active" },
        { label: "Philippine Data Privacy Act Compliance", status: "active" },
        { label: "Supplier Contract Review", status: "planned" },
      ],
    },
    {
      category: "Operational Risk",
      icon: Lock,
      color: "border-slate-300 bg-slate-50",
      headerColor: "text-slate-800",
      items: [
        { label: "Role-Based Access Control", status: "active" },
        { label: "Admin Approval for Refunds", status: "active" },
        { label: "Audit Trail Logging", status: "active" },
        { label: "Backup System Redundancy", status: "active" },
      ],
    },
  ];

  const statusConfig = {
    active: { label: "Active", cls: "bg-green-100 text-green-700" },
    planned: { label: "Planned", cls: "bg-amber-100 text-amber-700" },
    monitor: { label: "Monitor", cls: "bg-blue-100 text-blue-700" },
  };

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {risks.map(r => (
        <Card key={r.category} className={`border-2 ${r.color}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm flex items-center gap-2 ${r.headerColor}`}>
              <r.icon className="w-4 h-4" /> {r.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.items.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-700">{item.label}</p>
                </div>
                <Badge className={`text-xs shrink-0 ${statusConfig[item.status].cls}`}>{statusConfig[item.status].label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* KPI Targets */}
      <Card className="border-2 border-slate-900 bg-slate-900 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-400" /> Risk KPI Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { metric: "Chargeback Rate", target: "< 0.9%", status: "green" },
            { metric: "Refund Ratio", target: "< 5%", status: "green" },
            { metric: "API Uptime", target: "> 99.5%", status: "green" },
            { metric: "Fraud Detection", target: "Stripe Radar", status: "green" },
            { metric: "Reserve Buffer", target: "10% of monthly GBV", status: "amber" },
          ].map(k => (
            <div key={k.metric} className="flex justify-between items-center border-b border-slate-700 pb-1">
              <p className="text-slate-300 text-xs">{k.metric}</p>
              <Badge className={k.status === "green" ? "bg-green-900 text-green-300" : "bg-amber-900 text-amber-300"}>{k.target}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Multi-Currency ───────────────────────────────────────────────────────────
function CurrencyTab() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Currency Display",
      color: "border-green-400 bg-green-50",
      items: ["Detect user country/timezone", "Show prices in local currency", "Convert using live FX rates (ExchangeRate API)", "Charge in local currency via Stripe"],
      status: "active",
    },
    {
      phase: "Phase 2",
      title: "Stripe Multi-Currency",
      color: "border-blue-400 bg-blue-50",
      items: ["Enable USD, PHP, EUR, SGD, AUD", "Auto-convert or hold multi-balance", "Separate accounting ledger per currency", "Currency settlement reporting"],
      status: "planned",
    },
    {
      phase: "Phase 3",
      title: "FX Profit Protection",
      color: "border-amber-400 bg-amber-50",
      items: ["Add 2–3% FX buffer inside 20% markup", "Daily rate lock for high-value bookings", "Hedge exposure for >₱500K bookings", "FX gain/loss accounting"],
      status: "planned",
    },
  ];

  const currencies = [
    { code: "PHP", flag: "🇵🇭", name: "Philippine Peso", stripe: "✔ Active" },
    { code: "USD", flag: "🇺🇸", name: "US Dollar", stripe: "✔ Active" },
    { code: "EUR", flag: "🇪🇺", name: "Euro", stripe: "Planned" },
    { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar", stripe: "Planned" },
    { code: "AUD", flag: "🇦🇺", name: "Australian Dollar", stripe: "Planned" },
    { code: "JPY", flag: "🇯🇵", name: "Japanese Yen", stripe: "Planned" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {phases.map(p => (
          <Card key={p.phase} className={`border-2 ${p.color}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{p.phase} — {p.title}</CardTitle>
                <Badge className={p.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  {p.status === "active" ? "Live" : "Planned"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {p.items.map(item => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Supported Currencies</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currencies.map(c => (
              <div key={c.code} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <p className="font-bold text-sm text-slate-900">{c.code}</p>
                  <p className="text-xs text-slate-500">{c.name}</p>
                  <Badge className={c.stripe === "✔ Active" ? "bg-green-100 text-green-700 text-xs mt-0.5" : "bg-slate-100 text-slate-500 text-xs mt-0.5"}>{c.stripe}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-2 border-amber-300">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-800">FX Protection Strategy</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900">Your 20% markup already provides a natural FX buffer. For additional protection, add a <strong>2–3% FX spread</strong> on top for international bookings. This protects GC Travel against currency fluctuations between booking and supplier settlement.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-lg border border-amber-200 p-3 text-center">
              <p className="text-xs text-slate-500">Base Markup</p>
              <p className="text-xl font-black text-amber-700">20%</p>
            </div>
            <div className="bg-white rounded-lg border border-amber-200 p-3 text-center">
              <p className="text-xs text-slate-500">+ FX Buffer</p>
              <p className="text-xl font-black text-amber-700">2–3%</p>
            </div>
            <div className="bg-white rounded-lg border-2 border-green-400 p-3 text-center">
              <p className="text-xs text-slate-500">Total Protection</p>
              <p className="text-xl font-black text-green-700">22–23%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Mobile App ───────────────────────────────────────────────────────────────
function MobileTab() {
  const modules = [
    { name: "User Authentication", desc: "Biometric + JWT token", icon: Lock },
    { name: "Flight Search", desc: "Duffel / Amadeus / Sabre live", icon: Globe },
    { name: "Booking Details", desc: "PNR, itinerary, e-ticket", icon: BookOpen },
    { name: "Payment (Stripe SDK)", desc: "Secure card + GCash", icon: DollarSign },
    { name: "Booking History", desc: "All past bookings", icon: RefreshCw },
    { name: "Notifications", desc: "Push alerts for all events", icon: Zap },
  ];

  const backendServices = [
    { name: "API Gateway", desc: "Single entry point, rate limiting" },
    { name: "Booking Engine", desc: "Multi-supplier aggregation" },
    { name: "Payment Service", desc: "Stripe 80/20 split logic" },
    { name: "Revenue Engine", desc: "Markup calculation, profit recording" },
    { name: "Notification Service", desc: "Push + Email + SMS" },
  ];

  const pushTriggers = [
    { event: "Payment success", icon: "✅" },
    { event: "Ticket issued", icon: "🎫" },
    { event: "Schedule change", icon: "⏰" },
    { event: "Refund processed", icon: "💸" },
    { event: "Chargeback alert", icon: "⚠️" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Frontend */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" /> Mobile Frontend (React Native)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.map(m => (
              <div key={m.name} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <m.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Backend */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-600" /> Backend Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {backendServices.map(s => (
              <div key={s.name} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Push Notifications */}
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-sm text-amber-800">Push Notification Triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pushTriggers.map(t => (
              <div key={t.event} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200">
                <span className="text-lg">{t.icon}</span>
                <p className="text-sm text-slate-700">{t.event}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-2 border-slate-900 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" /> Mobile Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Biometric Login", desc: "Face ID / Fingerprint + PIN fallback" },
              { title: "Encrypted Token Storage", desc: "Secure enclave / Keychain storage" },
              { title: "JWT Authentication", desc: "Short-lived tokens, refresh rotation" },
              { title: "Certificate Pinning", desc: "Prevents MITM attacks" },
              { title: "Jailbreak Detection", desc: "Block rooted device access" },
            ].map(s => (
              <div key={s.title} className="border-b border-slate-700 pb-2">
                <p className="text-sm font-semibold text-green-300">{s.title}</p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Operations Manual ────────────────────────────────────────────────────────
function OpsManualTab() {
  const [activeSection, setActiveSection] = useState("booking");
  const sections = [
    { key: "booking", label: "Booking Team" },
    { key: "finance", label: "Finance Team" },
    { key: "refund", label: "Refund Process" },
    { key: "chargeback", label: "Chargeback Process" },
    { key: "kpis", label: "Management KPIs" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "booking" && (
        <Card className="border-2 border-blue-200">
          <CardHeader><CardTitle className="text-sm text-blue-800 flex items-center gap-2"><Users className="w-4 h-4" /> Booking Team — Daily Tasks</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                "Confirm flight availability via system (Duffel / Amadeus / Sabre)",
                "Verify 20% markup correctly applied before displaying to customer",
                "Ensure payment confirmed in Stripe dashboard before proceeding",
                "Confirm ticket issued via supplier API — check PNR/booking reference",
                "Send full itinerary + e-ticket to client via email",
                "Log booking reference and supplier confirmation in system",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {activeSection === "finance" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-2 border-green-200">
            <CardHeader><CardTitle className="text-sm text-green-800">Daily Finance Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Reconcile Stripe payments dashboard", "Verify 80% supplier transfers processed", "Withdraw 20% profit to bank / GCash", "Update profit dashboard with day's figures", "Review failed payments and retry logic"].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-sm text-slate-700">{t}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200">
            <CardHeader><CardTitle className="text-sm text-amber-800">Weekly Finance Tasks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Supplier settlement review (Duffel, Amadeus, Sabre)", "Chargeback rate analysis (target < 0.9%)", "Refund ledger audit and reconciliation", "Monthly profit report generation", "FX exposure review for international bookings"].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-slate-700">{t}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "refund" && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardHeader><CardTitle className="text-sm text-amber-800">Refund Process — Step by Step</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                { step: "Check fare rule with supplier API — is it refundable?", warning: false },
                { step: "Get supervisor approval for any refund > ₱10,000", warning: true },
                { step: "Cancel booking via supplier API (Duffel / Amadeus / Sabre)", warning: false },
                { step: "Issue Stripe refund in dashboard (full or partial)", warning: false },
                { step: "Retain agency service fee if applicable (non-refundable markup)", warning: true },
                { step: "Update booking status to 'refunded' in system", warning: false },
                { step: "Send refund confirmation email to customer", warning: false },
                { step: "Record accounting entry: reverse revenue, post refund", warning: false },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${item.warning ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{i + 1}</span>
                  <p className={`text-sm ${item.warning ? "font-semibold text-red-700" : "text-slate-700"}`}>{item.step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {activeSection === "chargeback" && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader><CardTitle className="text-sm text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Chargeback Response Process</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                "Receive Stripe chargeback alert via email/webhook",
                "Log dispute in chargeback table immediately",
                "Gather evidence: booking confirmation PDF",
                "Gather evidence: 3D Secure authentication proof",
                "Gather evidence: IP address + device log at time of booking",
                "Gather evidence: Email confirmation sent to customer",
                "Submit all evidence via Stripe dashboard within 7 days",
                "Record outcome (won / lost) and adjust accounting",
                "If lost: write off as chargeback expense (Account 6020)",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {activeSection === "kpis" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { kpi: "Gross Booking Value", desc: "Total revenue from all bookings before split", target: "Track daily / monthly", color: "bg-blue-50 border-blue-200" },
            { kpi: "Net Profit", desc: "GBV × 20% − Stripe fees (2.9%)", target: "Target: ~17% of GBV", color: "bg-green-50 border-green-200" },
            { kpi: "Refund Ratio", desc: "Refunds / Total Bookings", target: "Target: < 5%", color: "bg-amber-50 border-amber-200" },
            { kpi: "Chargeback Rate", desc: "Disputes / Total Transactions", target: "Target: < 0.9%", color: "bg-red-50 border-red-200" },
            { kpi: "Supplier Distribution", desc: "Bookings by supplier (Duffel / Amadeus / Sabre)", target: "Monitor for concentration risk", color: "bg-sky-50 border-sky-200" },
            { kpi: "Conversion Rate", desc: "Searches → Bookings", target: "Target: > 3%", color: "bg-violet-50 border-violet-200" },
          ].map(k => (
            <Card key={k.kpi} className={`border-2 ${k.color}`}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-slate-800">{k.kpi}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-2">{k.desc}</p>
                <Badge className="bg-slate-900 text-white text-xs">{k.target}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OTAOperationsCenter() {
  const [activeTab, setActiveTab] = useState("schema");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">OTA Operations Center</h2>
          <p className="text-slate-500 text-sm">Enterprise-grade infrastructure — DB Schema, Risk, Currency, Mobile, Operations</p>
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

      {activeTab === "schema" && <SchemaTab />}
      {activeTab === "risk" && <RiskTab />}
      {activeTab === "currency" && <CurrencyTab />}
      {activeTab === "mobile" && <MobileTab />}
      {activeTab === "ops" && <OpsManualTab />}
    </div>
  );
}
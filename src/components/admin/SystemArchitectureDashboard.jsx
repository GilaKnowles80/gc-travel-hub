import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, BookOpen, Building2, ArrowRight, ArrowDown, CheckCircle, XCircle, DollarSign, CreditCard, Plane, Globe, Lock } from "lucide-react";

const tabs = [
  { key: "flow", label: "System Flow" },
  { key: "accounting", label: "Chart of Accounts" },
  { key: "refund", label: "Refund & Chargeback" },
  { key: "legal", label: "Legal Protection" },
];

const FlowNode = ({ label, sub, color = "bg-slate-100 border-slate-300 text-slate-800", icon: Icon }) => (
  <div className={`rounded-xl border-2 px-4 py-3 text-center ${color} shadow-sm`}>
    {Icon && <Icon className="w-4 h-4 mx-auto mb-1 opacity-70" />}
    <p className="font-semibold text-sm">{label}</p>
    {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
  </div>
);

const Arrow = ({ label }) => (
  <div className="flex flex-col items-center my-1">
    <ArrowDown className="w-4 h-4 text-slate-400" />
    {label && <span className="text-xs text-slate-400 -mt-0.5">{label}</span>}
  </div>
);

function SystemFlowTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Main Flow */}
      <div>
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Full OTA System Flow</h3>
        <div className="flex flex-col items-center space-y-1">
          <FlowNode label="Customer" sub="Website / Mobile App" color="bg-purple-50 border-purple-300 text-purple-900" icon={Globe} />
          <Arrow />
          <FlowNode label="Base44 Frontend" sub="Search + Booking UI" color="bg-blue-50 border-blue-300 text-blue-900" />
          <Arrow />
          <FlowNode label="Base44 Backend" sub="API Logic + Markup Engine" color="bg-blue-50 border-blue-300 text-blue-900" />
          <Arrow label="calls" />
          {/* API Split */}
          <div className="w-full grid grid-cols-3 gap-2">
            <FlowNode label="Duffel" sub="Flights" color="bg-sky-50 border-sky-300 text-sky-900" icon={Plane} />
            <FlowNode label="Amadeus" sub="Flights/Hotels" color="bg-sky-50 border-sky-300 text-sky-900" icon={Plane} />
            <FlowNode label="Sabre" sub="Flights" color="bg-sky-50 border-sky-300 text-sky-900" icon={Plane} />
          </div>
          <Arrow />
          <FlowNode label="Net Fare Displayed" sub="Raw supplier price shown" color="bg-slate-50 border-slate-300 text-slate-700" />
          <Arrow label="+ 20% markup" />
          <FlowNode label="Customer Final Price" sub="Net Fare + 20% GC Markup" color="bg-amber-50 border-amber-400 text-amber-900" />
          <Arrow />
          <FlowNode label="Stripe Checkout" sub="Secure Payment Page" color="bg-violet-50 border-violet-400 text-violet-900" icon={CreditCard} />
          <Arrow label="payment success" />
          <FlowNode label="Stripe Split" sub="Automatic via Destination Charges" color="bg-green-50 border-green-400 text-green-900" icon={DollarSign} />
          <Arrow />
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-green-400 bg-green-50 p-3 text-center">
              <p className="text-xs text-green-600 mb-0.5">GC Travel Keeps</p>
              <p className="text-2xl font-black text-green-700">20%</p>
              <p className="text-xs text-green-600">→ Bank → GCash</p>
              <p className="text-xs font-medium text-green-800 mt-1">Gila Cain Knowles</p>
            </div>
            <div className="rounded-xl border-2 border-blue-400 bg-blue-50 p-3 text-center">
              <p className="text-xs text-blue-600 mb-0.5">Supplier Receives</p>
              <p className="text-2xl font-black text-blue-700">80%</p>
              <p className="text-xs text-blue-600">Duffel / Amadeus / Sabre</p>
              <p className="text-xs font-medium text-blue-800 mt-1">Connected Account</p>
            </div>
          </div>
          <Arrow />
          <FlowNode label="Ticket Issued via API" sub="Booking confirmed with supplier" color="bg-slate-50 border-slate-300 text-slate-700" />
          <Arrow />
          <FlowNode label="E-Ticket → Customer" sub="Email confirmation sent" color="bg-green-50 border-green-300 text-green-900" icon={CheckCircle} />
        </div>
      </div>

      {/* Stripe Connect Setup */}
      <div className="space-y-5">
        <div>
          <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Stripe Connect Setup Blueprint</h3>
          <div className="space-y-3">
            {[
              { step: 1, title: "Activate Stripe Connect", desc: "Go to Stripe Dashboard → Settings → Connect → Enable Destination Charges", status: "required" },
              { step: 2, title: "Create Connected Accounts", desc: "Duffel Settlement Account · Amadeus Settlement Account · Sabre Settlement Account", status: "required" },
              { step: 3, title: "Destination Charge Logic", desc: "Customer pays ₱100,000 → transfer_data.destination = Supplier, amount = ₱80,000, application_fee = ₱20,000", status: "auto" },
            ].map(s => (
              <div key={s.step} className="border rounded-xl p-4 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Badge className={s.status === "auto" ? "bg-green-100 text-green-700 ml-auto" : "bg-amber-100 text-amber-700 ml-auto"}>
                    {s.status === "auto" ? "Auto" : "Manual"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Charge */}
        <Card className="bg-slate-900 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Stripe Destination Charge Example</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xs space-y-1.5">
            <p><span className="text-slate-400">// Customer pays</span></p>
            <p><span className="text-green-400">amount</span> = <span className="text-amber-300">100_000</span> <span className="text-slate-400">// ₱100,000</span></p>
            <p><span className="text-green-400">transfer_data</span>:</p>
            <p className="pl-4"><span className="text-green-400">destination</span> = <span className="text-blue-300">"acct_supplier"</span></p>
            <p className="pl-4"><span className="text-green-400">amount</span> = <span className="text-amber-300">80_000</span> <span className="text-slate-400">// 80%</span></p>
            <p><span className="text-green-400">application_fee_amount</span> = <span className="text-amber-300">20_000</span> <span className="text-slate-400">// 20%</span></p>
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-1">
              <p><span className="text-green-400">✔</span> Supplier receives <span className="text-amber-300">₱80,000</span></p>
              <p><span className="text-green-400">✔</span> GC Travel retains <span className="text-amber-300">₱20,000</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountingTab() {
  const accounts = [
    {
      category: "Assets", icon: DollarSign, color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
      items: [
        { code: "1010", name: "Cash – GCash", note: "Gila Cain Knowles +63-915-440-1150" },
        { code: "1020", name: "Cash – Bank", note: "Local bank account" },
        { code: "1030", name: "Stripe Balance", note: "Pre-withdrawal balance" },
        { code: "1040", name: "Accounts Receivable", note: "Pending customer payments" },
        { code: "1050", name: "Security Deposits", note: "Held deposits" },
      ]
    },
    {
      category: "Liabilities", icon: AlertTriangle, color: "bg-red-50 border-red-200",
      headerColor: "bg-red-100 text-red-800",
      items: [
        { code: "2010", name: "Supplier Payable – Duffel", note: "80% owed to Duffel" },
        { code: "2020", name: "Supplier Payable – Amadeus", note: "80% owed to Amadeus" },
        { code: "2030", name: "Supplier Payable – Sabre", note: "80% owed to Sabre" },
        { code: "2040", name: "Customer Refund Payable", note: "Pending refunds" },
        { code: "2050", name: "Chargeback Reserve", note: "Dispute buffer" },
      ]
    },
    {
      category: "Revenue", icon: TrendingUp, color: "bg-blue-50 border-blue-200",
      headerColor: "bg-blue-100 text-blue-800",
      items: [
        { code: "4010", name: "Flight Markup Revenue", note: "20% on flight fares" },
        { code: "4020", name: "Hotel Markup Revenue", note: "20% on hotel rates" },
        { code: "4030", name: "Service Fees", note: "Booking processing fees" },
        { code: "4040", name: "Visa Processing Fees", note: "Visa facilitation" },
      ]
    },
    {
      category: "Cost of Goods Sold", icon: ArrowRight, color: "bg-orange-50 border-orange-200",
      headerColor: "bg-orange-100 text-orange-800",
      items: [
        { code: "5010", name: "Flight Cost – Duffel", note: "80% net fare to Duffel" },
        { code: "5020", name: "Flight Cost – Amadeus", note: "80% net fare to Amadeus" },
        { code: "5030", name: "Flight Cost – Sabre", note: "80% net fare to Sabre" },
        { code: "5040", name: "Hotel Net Cost", note: "80% net rate to hotel suppliers" },
      ]
    },
    {
      category: "Expenses", icon: Building2, color: "bg-slate-50 border-slate-200",
      headerColor: "bg-slate-100 text-slate-800",
      items: [
        { code: "6010", name: "Stripe Processing Fees", note: "~2.9% + ₱15 per transaction" },
        { code: "6020", name: "Refund Fees", note: "Non-recovered refund costs" },
        { code: "6030", name: "Marketing Expense", note: "Ads, promotions" },
        { code: "6040", name: "Salaries", note: "Staff payroll" },
        { code: "6050", name: "Software Subscriptions", note: "APIs, Base44, tools" },
      ]
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {accounts.map(cat => (
        <Card key={cat.category} className={`border-2 ${cat.color}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm px-2 py-1 rounded-lg inline-flex items-center gap-2 w-fit ${cat.headerColor}`}>
              <cat.icon className="w-3.5 h-3.5" />
              {cat.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cat.items.map(item => (
              <div key={item.code} className="flex items-start gap-2">
                <span className="text-xs font-mono text-slate-400 shrink-0 mt-0.5">{item.code}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.note}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RefundChargebackTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Refund Flow */}
      <div>
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
          <ArrowDown className="w-4 h-4 text-blue-500" /> Refund Flow
        </h3>
        <div className="flex flex-col items-center space-y-1">
          <FlowNode label="Customer Requests Refund" color="bg-blue-50 border-blue-300 text-blue-900" />
          <Arrow />
          <FlowNode label="Check Supplier Fare Rules" color="bg-slate-50 border-slate-300 text-slate-700" />
          <Arrow />
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-red-700">Non-Refundable</p>
              <p className="text-xs text-red-600 mt-1">→ Deny Request</p>
            </div>
            <div className="rounded-xl border-2 border-green-300 bg-green-50 p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-700">Refundable</p>
              <p className="text-xs text-green-600 mt-1">→ Proceed</p>
            </div>
          </div>
          <Arrow label="refundable path" />
          <FlowNode label="Cancel via API" sub="Duffel / Amadeus / Sabre cancellation" color="bg-slate-50 border-slate-300" />
          <Arrow />
          <FlowNode label="Supplier Returns 80%" sub="Net fare refunded" color="bg-blue-50 border-blue-300 text-blue-900" />
          <Arrow />
          <FlowNode label="Stripe Refund Issued" sub="Full refund to customer card" color="bg-violet-50 border-violet-300 text-violet-900" />
          <Arrow />
          <FlowNode label="Reverse 20% Revenue Entry" sub="Accounting adjustment" color="bg-amber-50 border-amber-300 text-amber-900" />
        </div>
      </div>

      {/* Chargeback Flow */}
      <div>
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-red-500" /> Chargeback Flow
        </h3>
        <div className="flex flex-col items-center space-y-1 mb-6">
          <FlowNode label="Customer Files Dispute" sub="With their bank" color="bg-red-50 border-red-300 text-red-900" />
          <Arrow />
          <FlowNode label="Stripe Notifies GC Travel" color="bg-violet-50 border-violet-300 text-violet-900" />
          <Arrow />
          <FlowNode label="Stripe Temporarily Deducts 100%" sub="Funds held pending review" color="bg-red-50 border-red-400 text-red-900" />
          <Arrow />
          <div className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
            <p className="font-semibold text-amber-800 text-sm text-center mb-2">You Submit Evidence</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Booking Confirmation</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> IP Address Log</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> 3D Secure Proof</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Customer ID / Agreement</li>
            </ul>
          </div>
          <Arrow label="bank decision" />
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-green-400 bg-green-50 p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-700">WIN</p>
              <p className="text-xs text-green-600">Funds Returned</p>
            </div>
            <div className="rounded-xl border-2 border-red-400 bg-red-50 p-3 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-red-700">LOSE</p>
              <p className="text-xs text-red-600">Funds Lost</p>
            </div>
          </div>
        </div>

        {/* Protection Checklist */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Chargeback Protection (Enable These)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["3D Secure Enabled (Stripe Radar)", "Clear Cancellation Policy (Terms)", "Customer Agreement Checkbox", "IP Address Logging", "Email Confirmation Trail"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-red-800">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LegalTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Terms & Conditions — Required Clauses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "GC Travel acts as travel intermediary/agent",
            "Prices include service markup fees",
            "Service fee is non-refundable once booking is confirmed",
            "Supplier fare rules govern cancellations",
            "GC Travel is not liable for supplier disruptions",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-amber-800"><Lock className="w-4 h-4" /> Service Fee Legal Clause (Copy-Ready)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border border-amber-300 p-4 text-sm text-slate-700 italic leading-relaxed">
            "GC Travel and Tours Agency applies a service and facilitation fee of up to 20% on published supplier fares. This fee covers booking, processing, and customer support services and is non-refundable once booking is confirmed."
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Supplier Agreement Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500 mb-2">Ensure your API agreements with each supplier explicitly allow:</p>
          {[
            { supplier: "Duffel", items: ["Markup Pricing ✔", "Reseller Model ✔", "Merchant of Record ✔"] },
            { supplier: "Amadeus", items: ["Markup Pricing ✔", "Reseller Model ✔", "Merchant of Record ✔"] },
            { supplier: "Sabre", items: ["Markup Pricing ✔", "Reseller Model ✔", "Merchant of Record ✔"] },
          ].map(s => (
            <div key={s.supplier} className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-bold text-blue-800 text-sm mb-1">{s.supplier}</p>
              <div className="flex flex-wrap gap-2">
                {s.items.map(item => <Badge key={item} className="bg-blue-100 text-blue-700 text-xs">{item}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-green-800"><Shield className="w-4 h-4" /> Data Protection Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: "PCI-DSS", desc: "Handled automatically by Stripe — no card data stored on your servers", status: "green" },
            { title: "Philippine Data Privacy Act", desc: "RA 10173 compliance — customer data collected with consent", status: "amber" },
            { title: "Stripe Radar (Fraud)", desc: "Built-in ML fraud protection and 3D Secure enforcement", status: "green" },
            { title: "GDPR Ready", desc: "Cookie consent and data deletion flow implemented", status: "green" },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.status === "green" ? "text-green-500" : "text-amber-500"}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Need this for the tab icons
function TrendingUp({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default function SystemArchitectureDashboard() {
  const [activeTab, setActiveTab] = useState("flow");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Architecture</h2>
          <p className="text-slate-500 text-sm">Base44 + Stripe + Travel APIs + 80/20 Revenue Split</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "flow" && <SystemFlowTab />}
      {activeTab === "accounting" && <AccountingTab />}
      {activeTab === "refund" && <RefundChargebackTab />}
      {activeTab === "legal" && <LegalTab />}
    </div>
  );
}
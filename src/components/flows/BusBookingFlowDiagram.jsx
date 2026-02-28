import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, Armchair, DollarSign, FileText, CheckCircle2, Mail, Phone, CreditCard, TrendingUp, BarChart3, RefreshCw } from "lucide-react";

export default function BusBookingFlowDiagram() {
  const flowStages = [
    {
      stage: "Discovery & Search",
      color: "bg-blue-50 border-l-4 border-blue-500",
      steps: [
        { title: "Customer Access", icon: Globe, desc: "Web App / Mobile App / Agency Portal" },
        { title: "Search Criteria", icon: Search, desc: "Origin, Destination, Date, Return Date, Passengers" },
        { title: "API Query", icon: "🔌", desc: "Bus Aggregator API + Direct Operator Inventory" }
      ]
    },
    {
      stage: "Results & Selection",
      color: "bg-green-50 border-l-4 border-green-500",
      steps: [
        { title: "Display Options", icon: Armchair, desc: "Operator, Time, Seat Types, Fare, Availability" },
        { title: "Select Bus", icon: CheckCircle2, desc: "Choose preferred bus service" },
        { title: "Seat Selection", icon: "🪑", desc: "Real-time interactive seat map" }
      ]
    },
    {
      stage: "Booking Details",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Passenger Info", icon: Users, desc: "Name, Contact, ID (if required)" },
        { title: "Add-ons", icon: "📦", desc: "Travel Insurance, Luggage, Cancellation Flexibility" },
        { title: "Review Summary", icon: FileText, desc: "Fare Breakdown + Commission" }
      ]
    },
    {
      stage: "Payment & Confirmation",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Payment Gateway", icon: CreditCard, desc: "Card, Bank Transfer, OTC, E-wallet" },
        { title: "Confirmation", icon: CheckCircle2, desc: "Payment verified and recorded" },
        { title: "PNR Generated", icon: FileText, desc: "Unique booking reference number" }
      ]
    },
    {
      stage: "Post-Booking",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "E-Ticket Issued", icon: FileText, desc: "SMS + Email with booking details" },
        { title: "Supplier Notified", icon: Mail, desc: "Booking sent to bus operator" },
        { title: "Commission Recorded", icon: TrendingUp, desc: "Markup/Commission logged in system" }
      ]
    }
  ];

  const revenueModels = [
    {
      title: "Markup Model (Recommended)",
      icon: "✅",
      recommended: true,
      flow: [
        { step: "Customer Pays", amount: "₱1,200", detail: "Your selling price" },
        { step: "Supplier Cost", amount: "₱1,000", detail: "Net fare to operator" },
        { step: "Your Profit", amount: "₱200", detail: "Instant earnings per booking" }
      ],
      profitMargin: {
        min: "₱150-200 per ticket",
        max: "₱300-500 per ticket",
        percentage: "12-25% profit margin"
      },
      pros: ["Immediate cash flow", "Price control", "Scalable markup"],
      cons: ["Limited inventory", "Supplier dependency"]
    },
    {
      title: "Commission Model",
      icon: "📊",
      recommended: false,
      flow: [
        { step: "Customer Pays", amount: "₱1,000", detail: "Public net fare" },
        { step: "You Receive", amount: "₱1,000", detail: "From customer directly" },
        { step: "Commission Later", amount: "₱50-100", detail: "5-10% from operator (T+15-30 days)" }
      ],
      profitMargin: {
        min: "₱50-100 per ticket",
        max: "₱100-150 per ticket",
        percentage: "5-10% commission"
      },
      pros: ["Competitive pricing", "More inventory", "Higher volume"],
      cons: ["Delayed payment", "Less predictable", "Supplier dependent"]
    },
    {
      title: "Hybrid Model (Best Growth)",
      icon: "⚡",
      recommended: false,
      flow: [
        { step: "Markup Routes", amount: "₱200-300", detail: "Premium/less competitive" },
        { step: "Commission Routes", amount: "₱50-100", detail: "High-volume popular routes" },
        { step: "Blended Earnings", amount: "₱150-200/ticket", detail: "Mix of instant + delayed" }
      ],
      profitMargin: {
        min: "₱150 blended",
        max: "₱250 blended",
        percentage: "8-15% blended margin"
      },
      pros: ["Balanced revenue", "Wide coverage", "Flexible"],
      cons: ["Complex management", "Multiple payment tracking"]
    }
  ];

  const adminOperations = [
    { icon: "📋", title: "Manage Bookings", desc: "View all bus bookings with filters" },
    { icon: "✏️", title: "Modify Booking", desc: "Change seats, dates, or passenger info" },
    { icon: "❌", title: "Cancel Booking", desc: "Process cancellations and refunds" },
    { icon: "💰", title: "Commission Tracker", desc: "Monitor markup and commission earnings" },
    { icon: "📊", title: "Sales Reports", desc: "Revenue, occupancy, supplier performance" },
    { icon: "🏢", title: "Supplier Settlement", desc: "Track and reconcile supplier payments" }
  ];

  const dataFlow = [
    { entity: "BusBooking", fields: ["route", "seat_type", "passenger_name", "total_price", "status"] },
    { entity: "PaymentSplit", fields: ["booking_id", "supplier_cost", "markup_amount", "payment_status"] },
    { entity: "Payment", fields: ["booking_id", "amount", "gateway", "transaction_id", "status"] },
    { entity: "Bus", fields: ["operator_name", "route", "departure_time", "seat_capacity", "available_seats"] }
  ];

  const suppliers = [
    { name: "12Go Asia", coverage: "Southeast Asia", api: "Available", features: "Multi-transport" },
    { name: "Bookaway", coverage: "Global", api: "Available", features: "Backpacker routes" },
    { name: "Local Operators", coverage: "Philippines", api: "Direct API", features: "Best margins" },
    { name: "Travelport", coverage: "Global", api: "Available", features: "Enterprise grade" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Bus Booking Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end bus booking with revenue models, payment processing, and admin operations</p>
      </div>

      {/* Main Flow Stages */}
      <div className="mb-12 space-y-4">
        {flowStages.map((stage, idx) => (
          <div key={idx}>
            <div className={`p-4 rounded-lg ${stage.color}`}>
              <h3 className="font-bold text-slate-900 text-lg">Stage {idx + 1}: {stage.stage}</h3>
            </div>
            <div className="ml-4 mt-3 space-y-3">
              {stage.steps.map((step, stepIdx) => {
                const Icon = typeof step.icon === "string" ? null : step.icon;
                return (
                  <div key={stepIdx}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 py-4 px-6">
                        {Icon ? (
                          <Icon className="w-6 h-6 text-slate-600 flex-shrink-0" />
                        ) : (
                          <span className="text-2xl flex-shrink-0">{step.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{step.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{step.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                    {stepIdx < stage.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {idx < flowStages.length - 1 && (
              <div className="flex justify-center py-4">
                <div className="w-1 h-8 bg-gradient-to-b from-slate-300 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Models */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">💰 Revenue Flow - Choose Your Model</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {revenueModels.map((model, i) => (
            <Card
              key={i}
              className={`overflow-hidden border-2 ${
                model.recommended
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                  : "border-slate-200"
              }`}
            >
              <CardHeader className={model.recommended ? "bg-green-100" : "bg-slate-100"}>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{model.title}</CardTitle>
                  <span className="text-2xl">{model.icon}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Flow */}
                <div className="space-y-3">
                  {model.flow.map((item, j) => (
                    <div key={j} className="flex justify-between items-start p-2 bg-white rounded border border-slate-100">
                      <span className="text-sm font-medium text-slate-900">{item.step}</span>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">{item.amount}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Profit Margin */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-bold text-amber-900 uppercase mb-1">Profit Margin</p>
                  <p className="text-xs text-amber-900 space-y-0.5">
                    <div>Min: {model.profitMargin.min}</div>
                    <div>Max: {model.profitMargin.max}</div>
                    <div className="font-bold text-amber-700">{model.profitMargin.percentage}</div>
                  </p>
                </div>

                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    {model.pros.map((pro, j) => (
                      <p key={j} className="text-xs text-green-700">✓ {pro}</p>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {model.cons.map((con, j) => (
                      <p key={j} className="text-xs text-red-700">✗ {con}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Operations */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Admin Back Office Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminOperations.map((op, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <p className="text-2xl mb-2">{op.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{op.title}</p>
                <p className="text-xs text-slate-600">{op.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Entities */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Data Entities & Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataFlow.map((item, i) => (
              <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 text-sm mb-2">{item.entity}</h4>
                <ul className="text-xs text-blue-900 space-y-1">
                  {item.fields.map((field, j) => (
                    <li key={j} className="font-mono">• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seat Selection Real-time Flow */}
      <Card className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🪑 Real-time Seat Selection System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded border border-purple-100">
              <p className="font-semibold text-purple-900 text-sm mb-2">Seat Map Display</p>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>✓ Interactive seat grid</li>
                <li>✓ Real-time availability</li>
                <li>✓ Seat type indicators</li>
                <li>✓ Price per seat shown</li>
              </ul>
            </div>
            <div className="p-3 bg-white rounded border border-purple-100">
              <p className="font-semibold text-purple-900 text-sm mb-2">Lock Mechanism</p>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>✓ 5-min seat hold</li>
                <li>✓ Auto-release if not paid</li>
                <li>✓ Prevents overbooking</li>
                <li>✓ Real-time sync</li>
              </ul>
            </div>
            <div className="p-3 bg-white rounded border border-purple-100">
              <p className="font-semibold text-purple-900 text-sm mb-2">Seat Types</p>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>🟢 Regular (₱1,000)</li>
                <li>🔵 VIP/Premium (₱1,500)</li>
                <li>🟣 Sleeper (₱2,000)</li>
                <li>⚫ Unavailable/Sold</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Processing */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Processing & Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Payment Methods</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span>💳 Credit/Debit Card</span>
                  <span className="text-xs font-mono">Stripe</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span>🏦 Bank Transfer</span>
                  <span className="text-xs font-mono">GCash/PayMaya</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span>💵 OTC Payment</span>
                  <span className="text-xs font-mono">Counter Pay</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span>📱 E-wallet</span>
                  <span className="text-xs font-mono">Multiple</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Confirmation Flow</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Payment processed & verified</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">2.</span>
                  <span>PNR generated (unique reference)</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Commission logged in PaymentSplit</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">4.</span>
                  <span>E-ticket generated & sent</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">5.</span>
                  <span>Supplier notified automatically</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">6.</span>
                  <span>SMS + Email confirmation to customer</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Integration */}
      <Card>
        <CardHeader>
          <CardTitle>🔌 Bus API Suppliers & Integration</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Supplier</th>
                <th className="text-left p-3 font-semibold">Coverage</th>
                <th className="text-left p-3 font-semibold">API Status</th>
                <th className="text-left p-3 font-semibold">Features</th>
                <th className="text-left p-3 font-semibold">Margin Potential</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium">{supplier.name}</td>
                  <td className="p-3">{supplier.coverage}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {supplier.api}
                    </span>
                  </td>
                  <td className="p-3">{supplier.features}</td>
                  <td className="p-3 font-bold text-emerald-700">₱200-500/ticket</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
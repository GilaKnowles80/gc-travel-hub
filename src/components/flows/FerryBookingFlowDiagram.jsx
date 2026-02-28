import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, Ship, DollarSign, FileText, CheckCircle2, Mail, Phone, CreditCard, TrendingUp, BarChart3, Anchor } from "lucide-react";

export default function FerryBookingFlowDiagram() {
  const flowStages = [
    {
      stage: "Discovery & Search",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      steps: [
        { title: "Customer Access", icon: Globe, desc: "Web App / Mobile App / Agency Portal" },
        { title: "Search Criteria", icon: Search, desc: "Origin Port, Destination Port, Date, Return Date, Passengers" },
        { title: "API Query", icon: "🔌", desc: "Ferry Aggregator API + Direct Operator Inventory" }
      ]
    },
    {
      stage: "Results & Selection",
      color: "bg-blue-50 border-l-4 border-blue-500",
      steps: [
        { title: "Display Options", icon: Ship, desc: "Operator, Vessel, Time, Duration, Accommodation, Fare, Availability" },
        { title: "Select Ferry", icon: CheckCircle2, desc: "Choose preferred ferry service" },
        { title: "Trip Details", icon: "🌊", desc: "View vessel specs, amenities, deck plans" }
      ]
    },
    {
      stage: "Accommodation & Details",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Choose Accommodation", icon: "🛏️", desc: "Economy Seat, Tourist Class, Business, Private Cabin" },
        { title: "Passenger Info", icon: Users, desc: "Name, Contact, Email, Valid ID Details" },
        { title: "Add-ons", icon: "📦", desc: "Insurance, Extra Baggage, Port Transfer Service" }
      ]
    },
    {
      stage: "Review & Payment",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Fare Summary", icon: DollarSign, desc: "Base Fare + Taxes + Port Fees + Markup Breakdown" },
        { title: "Payment Gateway", icon: CreditCard, desc: "Card, Bank Transfer, OTC, E-wallet" },
        { title: "Confirmation", icon: CheckCircle2, desc: "Payment verified and recorded" }
      ]
    },
    {
      stage: "Post-Booking",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "PNR Generated", icon: FileText, desc: "Unique booking reference number" },
        { title: "E-Ticket Issued", icon: "🎫", desc: "Boarding pass + Email & SMS confirmation" },
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
        { step: "Customer Pays", amount: "₱1,500", detail: "Your selling price" },
        { step: "Supplier Cost", amount: "₱1,250", detail: "Net fare to operator" },
        { step: "Your Profit", amount: "₱250", detail: "Instant earnings per booking" }
      ],
      profitMargin: {
        min: "₱200-250 per ticket",
        max: "₱400-600 per ticket",
        percentage: "15-25% profit margin"
      },
      pros: ["Immediate cash flow", "Price control", "Premium positioning"],
      cons: ["Limited slots", "Operator dependency"],
      useCases: "Best for peak season & premium routes"
    },
    {
      title: "Commission Model",
      icon: "📊",
      recommended: false,
      flow: [
        { step: "Customer Pays", amount: "₱1,500", detail: "Public net fare" },
        { step: "You Receive", amount: "₱1,500", detail: "From customer directly" },
        { step: "Commission Later", amount: "₱75-180", detail: "5-12% from operator (T+15-30 days)" }
      ],
      profitMargin: {
        min: "₱75-150 per ticket",
        max: "₱150-250 per ticket",
        percentage: "5-12% commission"
      },
      pros: ["More inventory", "Competitive pricing", "Volume play"],
      cons: ["Delayed payment", "Less predictable"],
      useCases: "For high-volume routes & competition"
    },
    {
      title: "Hybrid Model (Best Growth)",
      icon: "⚡",
      recommended: false,
      flow: [
        { step: "Markup Routes", amount: "₱250-350", detail: "Premium/scenic routes" },
        { step: "Commission Routes", amount: "₱75-150", detail: "Commuter/budget routes" },
        { step: "Blended Earnings", amount: "₱175-250/ticket", detail: "Mix of instant + delayed" }
      ],
      profitMargin: {
        min: "₱175 blended",
        max: "₱300 blended",
        percentage: "10-18% blended margin"
      },
      pros: ["Balanced revenue", "Wide coverage", "Flexible strategy"],
      cons: ["Complex tracking", "Admin overhead"],
      useCases: "For diverse ferry portfolio"
    }
  ];

  const accommodationTypes = [
    { type: "Economy Seat", icon: "💺", price: "₱800-1,000", description: "Standard seating, shared deck" },
    { type: "Tourist Class", icon: "🛋️", price: "₱1,000-1,500", description: "Reclining seat, private lounge access" },
    { type: "Business Class", icon: "💼", price: "₱1,500-2,500", description: "Premium cabin, meals included" },
    { type: "Private Cabin", icon: "🚪", price: "₱2,500-5,000", description: "Exclusive cabin, en-suite bathroom" }
  ];

  const adminOperations = [
    { icon: "📋", title: "Ferry Booking Management", desc: "View all ferry bookings with filters" },
    { icon: "✏️", title: "Modify Ticket", desc: "Change accommodation, dates, or passenger" },
    { icon: "❌", title: "Cancel Ticket", desc: "Process cancellations and refunds" },
    { icon: "💰", title: "Commission Tracker", desc: "Monitor markup and commission earnings" },
    { icon: "📊", title: "Route Analytics", desc: "Route performance, occupancy rates, revenue" },
    { icon: "🏢", title: "Supplier Settlement", desc: "Track and reconcile operator payments" }
  ];

  const dataFlow = [
    { entity: "FerryBooking", fields: ["route", "accommodation_type", "passenger_name", "total_price", "status"] },
    { entity: "PaymentSplit", fields: ["booking_id", "supplier_cost", "markup_amount", "payment_status"] },
    { entity: "Payment", fields: ["booking_id", "amount", "gateway", "transaction_id", "status"] },
    { entity: "Ferry", fields: ["operator_name", "vessel_name", "route", "departure_time", "capacity"] }
  ];

  const suppliers = [
    { name: "2GO Travel", coverage: "Philippines (Mindanao routes)", api: "Available", features: "Large vessels, budget-friendly" },
    { name: "OceanJet", coverage: "Visayas & Mindanao", api: "Available", features: "Modern fleet, good service" },
    { name: "12Go Asia", coverage: "Southeast Asia", api: "Available", features: "Multi-transport, wide coverage" },
    { name: "Bookaway", coverage: "Global routes", api: "Available", features: "Backpacker focus, competitive rates" }
  ];

  const addOns = [
    { item: "Travel Insurance", price: "₱150-300", coverage: "Trip cancellation, delays, baggage loss" },
    { item: "Extra Baggage", price: "₱200-500", coverage: "Additional checked luggage allowance" },
    { item: "Port Transfer", price: "₱300-800", coverage: "Hotel to port and port to hotel transport" },
    { item: "Meal Package", price: "₱400-1,000", coverage: "Pre-booked meals during journey" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Ferry Booking Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end ferry booking with revenue models, accommodation selection, and admin operations</p>
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

      {/* Accommodation Types */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">🛏️ Accommodation Types</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accommodationTypes.map((acc, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-3xl mb-2">{acc.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{acc.type}</p>
                <p className="text-xs text-slate-600 mb-2">{acc.description}</p>
                <p className="font-bold text-emerald-700">{acc.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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

                {/* Use Case */}
                <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900">
                  <span className="font-bold">💡 Best for:</span> {model.useCases}
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

      {/* Add-ons */}
      <Card className="mb-12 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300">
        <CardHeader>
          <CardTitle className="text-orange-900">📦 Optional Add-ons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {addOns.map((addon, i) => (
              <div key={i} className="p-4 bg-white rounded border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-slate-900">{addon.item}</p>
                  <p className="font-bold text-orange-700">{addon.price}</p>
                </div>
                <p className="text-sm text-slate-600">{addon.coverage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <div key={i} className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <h4 className="font-bold text-cyan-900 text-sm mb-2">{item.entity}</h4>
                <ul className="text-xs text-cyan-900 space-y-1">
                  {item.fields.map((field, j) => (
                    <li key={j} className="font-mono">• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fare Breakdown */}
      <Card className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">💳 Fare Breakdown Display</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md">
            <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
              <span className="text-sm font-medium">Base Fare</span>
              <span className="font-bold text-slate-900">₱1,250</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
              <span className="text-sm font-medium">Terminal/Port Fee</span>
              <span className="font-bold text-slate-900">₱100</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
              <span className="text-sm font-medium">Taxes (VAT/GST)</span>
              <span className="font-bold text-slate-900">₱100</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
              <span className="text-sm font-medium">Your Markup (20%)</span>
              <span className="font-bold text-emerald-700">₱250</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-100 rounded border border-purple-300 mt-2">
              <span className="font-bold text-purple-900">Total Customer Pays</span>
              <span className="font-bold text-purple-900 text-lg">₱1,700</span>
            </div>
            <div className="text-xs text-purple-900 p-2 bg-purple-50 rounded mt-2">
              💡 <strong>You Earn:</strong> ₱250 + (port fees allocation) upon booking confirmation
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
                  <span className="text-xs font-mono">Local Banks</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span>💵 OTC Payment</span>
                  <span className="text-xs font-mono">Counter Pay</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span>📱 E-wallet</span>
                  <span className="text-xs font-mono">GCash, PayMaya</span>
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
                  <span>PNR/Reference generated</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Commission logged in PaymentSplit</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">4.</span>
                  <span>E-ticket & boarding pass issued</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">5.</span>
                  <span>Ferry operator notified auto</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-green-600">6.</span>
                  <span>SMS + Email confirmation sent</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="w-5 h-5" />
            Ferry API Suppliers & Integration
          </CardTitle>
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
                  <td className="p-3 font-bold text-emerald-700">₱250-600/ticket</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
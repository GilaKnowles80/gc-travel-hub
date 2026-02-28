import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, Train, DollarSign, FileText, CheckCircle2, Mail, Phone, CreditCard, TrendingUp, BarChart3, QrCode } from "lucide-react";

export default function TrainBookingFlowDiagram() {
  const flowStages = [
    {
      stage: "Discovery & Search",
      color: "bg-teal-50 border-l-4 border-teal-500",
      steps: [
        { title: "Customer Access", icon: Globe, desc: "Web App / Mobile App / Agency Portal" },
        { title: "Search Criteria", icon: Search, desc: "Departure Station, Arrival Station, Date, Return Date, Passengers, Class" },
        { title: "API Query", icon: "🔌", desc: "Rail Aggregator API + Direct Railway Inventory" }
      ]
    },
    {
      stage: "Results & Selection",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      steps: [
        { title: "Display Trains", icon: Train, desc: "Operator, Train Number, Departure/Arrival, Duration, Class, Fare, Availability" },
        { title: "View Train Details", icon: "🚆", desc: "Route map, stops, amenities, facilities" },
        { title: "Select Train", icon: CheckCircle2, desc: "Choose preferred train service" }
      ]
    },
    {
      stage: "Seat & Class Selection",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Choose Class", icon: "💺", desc: "Economy, First Class, Business, Sleeper Cabin" },
        { title: "Seat Selection", icon: "🎫", desc: "Interactive seat map with real-time availability" },
        { title: "Passenger Info", icon: Users, desc: "Name (as per ID), Contact, ID/Passport Number" }
      ]
    },
    {
      stage: "Add-ons & Review",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Select Add-ons", icon: "📦", desc: "Meals, Extra Luggage, Flexible Ticket, Insurance" },
        { title: "Fare Summary", icon: DollarSign, desc: "Base Fare + Taxes + Reservation Fee + Markup" },
        { title: "Payment Selection", icon: CreditCard, desc: "Card, Bank Transfer, OTC, E-wallet" }
      ]
    },
    {
      stage: "Confirmation & Ticketing",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "Payment Processed", icon: CheckCircle2, desc: "Payment verified and confirmed" },
        { title: "PNR Generated", icon: FileText, desc: "Unique rail ticket number / Reservation ID" },
        { title: "E-Ticket Issued", icon: "🎫", desc: "PDF + QR Code via Email & SMS" }
      ]
    }
  ];

  const classTypes = [
    { class: "Economy/2nd Class", icon: "💺", price: "₱500-800/seat", description: "Standard seating, basic facilities, budget option" },
    { class: "First Class", icon: "🪑", price: "₱800-1,200/seat", description: "Comfortable seating, better amenities" },
    { class: "Business Class", icon: "💼", price: "₱1,200-2,000/seat", description: "Premium seats, meals included, priority boarding" },
    { class: "Sleeper Cabin", icon: "🛏️", price: "₱1,500-3,500/cabin", description: "Bunk beds, overnight travel, en-suite facilities" }
  ];

  const revenueModels = [
    {
      title: "Commission Model (Standard)",
      icon: "📊",
      recommended: false,
      flow: [
        { step: "Customer Pays", amount: "₱1,000", detail: "Ticket fare" },
        { step: "Commission Rate", amount: "3-10%", detail: "From railway (₱30-100)" },
        { step: "Paid Timeline", amount: "T+15-30", detail: "After ticket issuance" }
      ],
      profitMargin: {
        min: "₱30-100 per ticket",
        max: "₱150-300 per booking",
        percentage: "3-10% commission"
      },
      pros: ["Industry standard", "Competitive pricing"],
      cons: ["Delayed payment", "Low margins", "Volume dependent"],
      useCases: "For high-volume budget routes"
    },
    {
      title: "Service Fee Model (Recommended)",
      icon: "✅",
      recommended: true,
      flow: [
        { step: "Customer Fare", amount: "₱1,000", detail: "Rail operator price" },
        { step: "Service Fee", amount: "₱150-300", detail: "Your booking fee" },
        { step: "Your Profit", amount: "Instant", detail: "Collected at payment" }
      ],
      profitMargin: {
        min: "₱150-200 per ticket",
        max: "₱600-1,200 per booking",
        percentage: "15-20% service margin"
      },
      pros: ["Instant earnings", "Price control", "Predictable revenue"],
      cons: ["Higher pricing", "Less competitive"],
      useCases: "Best for premium/sleeper routes"
    },
    {
      title: "Hybrid Model (Best Growth)",
      icon: "⚡",
      recommended: false,
      flow: [
        { step: "Base Commission", amount: "5-7%", detail: "From railway" },
        { step: "Service Fee", amount: "₱100-150", detail: "Instant charge" },
        { step: "Add-on Revenue", amount: "20-30% margin", detail: "Meals, insurance, luggage" }
      ],
      profitMargin: {
        min: "₱200-300 per ticket",
        max: "₱500-900 per booking",
        percentage: "12-18% blended"
      },
      pros: ["Multiple revenue streams", "Balanced model", "Flexibility"],
      cons: ["Complex tracking", "Admin overhead"],
      useCases: "For diverse train portfolio"
    }
  ];

  const addOns = [
    { item: "Meal Selection", price: "₱200-500/person", commission: "25-35%", description: "Pre-book vegetarian, non-veg, special diet meals" },
    { item: "Extra Luggage", price: "₱300-1,000", commission: "30-40%", description: "Additional baggage allowance, overweight charges" },
    { item: "Flexible Ticket", price: "₱150-400", commission: "25-30%", description: "Free cancellation/modification option" },
    { item: "Travel Insurance", price: "₱200-500/person", commission: "20-25%", description: "Trip cancellation, baggage loss coverage" },
    { item: "Priority Boarding", price: "₱100-250", commission: "30-35%", description: "Early boarding, reserved queue area" },
    { item: "Seat Upgrade", price: "₱300-1,500", commission: "20-30%", description: "Upgrade to better class/premium seat" }
  ];

  const adminOperations = [
    { icon: "📋", title: "Train Booking Management", desc: "View all train tickets with passenger details" },
    { icon: "✏️", title: "Modify Ticket", desc: "Change date, class, or passenger information" },
    { icon: "❌", title: "Cancel Ticket", desc: "Process cancellations and refunds" },
    { icon: "💰", title: "Commission Tracker", desc: "Monitor service fees and commission earnings" },
    { icon: "📊", title: "Route Analytics", desc: "Popular routes, peak times, occupancy rates" },
    { icon: "🏢", title: "Supplier Settlement", desc: "Track and reconcile railway commission payments" }
  ];

  const dataFlow = [
    { entity: "TrainBooking", fields: ["train_number", "route", "class_type", "passenger_names[]", "seat_numbers[]", "total_price"] },
    { entity: "PaymentSplit", fields: ["booking_id", "railway_cost", "service_fee", "addon_revenue"] },
    { entity: "Payment", fields: ["booking_id", "amount_paid", "payment_method", "transaction_id", "status"] },
    { entity: "Train", fields: ["train_number", "operator", "route", "departure_time", "duration", "seat_capacity"] }
  ];

  const railPartners = [
    { name: "12Go Asia", coverage: "Asia-wide rail network", commission: "3-8%", features: "Comprehensive, multi-operator" },
    { name: "Amadeus (Select)", coverage: "Limited European rail", commission: "2-5%", features: "Integrates with flights" },
    { name: "Travelport", coverage: "Global multi-transport", commission: "Variable", features: "Bundle with flights/hotels" },
    { name: "National Railways", coverage: "Country-specific", commission: "5-15%", features: "Best margins, direct contracts" }
  ];

  const paymentFlow = [
    { step: "1. Payment Processed", desc: "Customer payment verified and captured" },
    { step: "2. Ticket Generated", desc: "Railway system confirms seat reservation" },
    { step: "3. PNR Created", desc: "Unique rail ticket number assigned" },
    { step: "4. E-Ticket Generated", desc: "PDF with QR code for mobile check-in" },
    { step: "5. Confirmation Sent", desc: "Email + SMS with booking details" },
    { step: "6. Commission Logged", desc: "PaymentSplit record created" }
  ];

  const seatLockMechanism = [
    { feature: "Auto Lock", desc: "Seat automatically locked for 5-10 minutes during booking" },
    { feature: "Real-time Sync", desc: "Seat availability updates in real-time across all users" },
    { feature: "Release on Abandon", desc: "Seat released if payment not completed within timeout" },
    { feature: "Overbooking Prevention", desc: "System prevents double-booking same seat" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Train Booking Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end train ticket booking with service fees, seat selection, and high-margin add-ons</p>
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

      {/* Seat Lock Mechanism */}
      <Card className="mb-12 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 border-2">
        <CardHeader>
          <CardTitle className="text-indigo-900">🔒 Real-time Seat Lock Mechanism</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {seatLockMechanism.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded border border-indigo-100">
                <p className="font-semibold text-slate-900 mb-2">{item.feature}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Types */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">💺 Train Class Types & Pricing</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classTypes.map((cls, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-3xl mb-2">{cls.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{cls.class}</p>
                <p className="text-xs text-slate-600 mb-2">{cls.description}</p>
                <p className="font-bold text-emerald-700 text-sm">{cls.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Models */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">💰 Revenue Models - Choose Your Strategy</h3>
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

      {/* Add-ons - High Margin Revenue */}
      <Card className="mb-12 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 border-2">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            📦 Add-ons - High Margin Upsell Opportunities
          </CardTitle>
          <p className="text-sm text-rose-800 mt-2">Many add-ons have 20-40% margins = ₱500-2,000+ extra per booking</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon, i) => (
              <div key={i} className="p-4 bg-white rounded border border-rose-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-slate-900">{addon.item}</p>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded">{addon.commission}</span>
                </div>
                <p className="text-sm font-bold text-rose-700 mb-1">{addon.price}</p>
                <p className="text-xs text-slate-600">{addon.description}</p>
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
              <div key={i} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="font-bold text-teal-900 text-sm mb-2">{item.entity}</h4>
                <ul className="text-xs text-teal-900 space-y-1">
                  {item.fields.map((field, j) => (
                    <li key={j} className="font-mono">• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fare Breakdown Example */}
      <Card className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">💳 Sample Fare Breakdown - Business Class Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Base Fare (Business Class)</span>
                  <span className="font-bold text-slate-900">₱1,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Railway Reservation Fee</span>
                  <span className="font-bold text-slate-900">₱50</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Taxes (GST 5%)</span>
                  <span className="font-bold text-slate-900">₱78</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Meal Add-on</span>
                  <span className="font-bold text-slate-900">₱300</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Travel Insurance</span>
                  <span className="font-bold text-slate-900">₱250</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Your Service Fee (15%)</span>
                  <span className="font-bold text-emerald-700">₱278</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-purple-100 rounded border border-purple-300 mt-2">
              <span className="font-bold text-purple-900">Total Customer Pays</span>
              <span className="font-bold text-purple-900 text-lg">₱2,456</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900 mb-2">🎯 Your Earnings (Per Booking):</p>
              <ul className="text-xs text-emerald-900 space-y-1">
                <li>✓ Service fee = ₱278</li>
                <li>✓ Meal commission (25% × ₱300) = ₱75</li>
                <li>✓ Insurance commission (20% × ₱250) = ₱50</li>
                <li className="font-bold text-emerald-700 border-t border-emerald-300 pt-1 mt-1">
                  💰 Total: ₱403 per ticket
                </li>
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
            Payment Processing & E-Ticket Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentFlow.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-900 text-sm font-bold">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-slate-900">{item.step}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* E-Ticket Details */}
      <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            E-Ticket & QR Code System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">E-Ticket Includes</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Passenger name & details</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Train number & route</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Class & seat/cabin number</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Departure & arrival times</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>QR code for mobile check-in</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">QR Code Benefits</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>No printed ticket needed</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Mobile check-in at station</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Instant verification by railway</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Secure & tamper-proof</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Print from email anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rail Integration Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Train className="w-5 h-5" />
            Rail Integration Partners & Options
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Integration Partner</th>
                <th className="text-left p-3 font-semibold">Coverage</th>
                <th className="text-left p-3 font-semibold">Commission</th>
                <th className="text-left p-3 font-semibold">Key Features</th>
              </tr>
            </thead>
            <tbody>
              {railPartners.map((partner, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{partner.name}</td>
                  <td className="p-3">{partner.coverage}</td>
                  <td className="p-3">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">
                      {partner.commission}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{partner.features}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-4">
            💡 <strong>Recommendation:</strong> Start with 12Go Asia for broad coverage, then negotiate direct contracts with national railways for better margins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
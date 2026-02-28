import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, Ship, DollarSign, FileText, CheckCircle2, Mail, Phone, CreditCard, TrendingUp, BarChart3, Anchor, AlertCircle } from "lucide-react";

export default function CruiseBookingFlowDiagram() {
  const flowStages = [
    {
      stage: "Discovery & Search",
      color: "bg-indigo-50 border-l-4 border-indigo-500",
      steps: [
        { title: "Customer Access", icon: Globe, desc: "Web App / Mobile App / Agency Portal" },
        { title: "Search Criteria", icon: Search, desc: "Destination, Departure Port, Dates, Duration, Guests" },
        { title: "API Query", icon: "🔌", desc: "Cruise Aggregator API + Direct Cruise Line Inventory" }
      ]
    },
    {
      stage: "Results & Selection",
      color: "bg-blue-50 border-l-4 border-blue-500",
      steps: [
        { title: "Display Cruises", icon: Ship, desc: "Cruise Line, Ship, Itinerary, Nights, Starting Price, Availability" },
        { title: "View Itinerary", icon: "🗺️", desc: "Day-by-day ports, activities, overnight stays" },
        { title: "Select Cruise", icon: CheckCircle2, desc: "Choose preferred cruise package" }
      ]
    },
    {
      stage: "Cabin & Pricing",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Choose Cabin", icon: "🛏️", desc: "Interior, Oceanview, Balcony, Suite" },
        { title: "View Pricing", icon: DollarSign, desc: "Base Fare + Port Charges + Taxes + Gratuities breakdown" },
        { title: "Passenger Details", icon: Users, desc: "Name (passport-based), DOB, Nationality, Passport, Emergency Contact" }
      ]
    },
    {
      stage: "Add-ons & Payment",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Select Add-ons", icon: "📦", desc: "Beverage Package, Shore Excursions, Insurance, WiFi" },
        { title: "Review Summary", icon: FileText, desc: "Complete fare breakdown + commission details" },
        { title: "Payment Option", icon: CreditCard, desc: "Deposit, Full Payment, or Installment Plan" }
      ]
    },
    {
      stage: "Confirmation & Documents",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "Payment Processed", icon: CheckCircle2, desc: "Deposit or full amount confirmed" },
        { title: "Reservation Generated", icon: FileText, desc: "Unique cruise reservation number" },
        { title: "E-Documents Issued", icon: "📄", desc: "Confirmation, Invoice, Pre-boarding Instructions" }
      ]
    }
  ];

  const cabinTypes = [
    { type: "Interior Cabin", icon: "🚪", price: "₱25,000-40,000", description: "No window, standard amenities, budget option" },
    { type: "Oceanview Cabin", icon: "🪟", price: "₱40,000-65,000", description: "Window view, mid-deck location" },
    { type: "Balcony Cabin", icon: "🌊", price: "₱65,000-120,000", description: "Private balcony, premium experience" },
    { type: "Suite", icon: "👑", price: "₱120,000-300,000+", description: "Luxury suite, VIP amenities, concierge" }
  ];

  const revenueModels = [
    {
      title: "Commission Model (Primary)",
      icon: "✅",
      recommended: true,
      flow: [
        { step: "Cruise Line Price", amount: "₱50,000", detail: "Base cabin price to customer" },
        { step: "Commission Rate", amount: "10-20%", detail: "From cruise line (₱5,000-10,000)" },
        { step: "Paid Timeline", amount: "T+30-90", detail: "After final payment or sailing" }
      ],
      profitMargin: {
        min: "₱5,000-7,500 per cabin",
        max: "₱10,000-20,000 per cabin",
        percentage: "10-20% commission margin"
      },
      pros: ["Industry standard", "High commission rates", "Industry trust"],
      cons: ["Delayed payment", "Requires rapport", "Volume dependent"],
      useCases: "Best for premium cruise bookings"
    },
    {
      title: "Service Fee Markup Model",
      icon: "💰",
      recommended: false,
      flow: [
        { step: "Cruise Fare", amount: "₱50,000", detail: "Direct customer booking" },
        { step: "Service Fee", amount: "₱2,000-5,000", detail: "Your instant service charge" },
        { step: "Your Profit", amount: "Instant", detail: "Collected at payment" }
      ],
      profitMargin: {
        min: "₱2,000-3,000 per cabin",
        max: "₱5,000-10,000 per cabin",
        percentage: "4-10% service fee markup"
      },
      pros: ["Instant earnings", "Transparent to customer", "No wait time"],
      cons: ["Lower per-booking", "Price sensitive customers"],
      useCases: "For budget-conscious cruisers"
    },
    {
      title: "Hybrid Model (Best Total Revenue)",
      icon: "⚡",
      recommended: false,
      flow: [
        { step: "Base Commission", amount: "10-15%", detail: "From cruise line" },
        { step: "Service Fee", amount: "₱1,000-2,000", detail: "Instant service charge" },
        { step: "Upsell Revenue", amount: "Insurance + Excursions", detail: "20-30% commission on add-ons" }
      ],
      profitMargin: {
        min: "₱7,000 blended",
        max: "₱20,000 blended",
        percentage: "12-25% total margin"
      },
      pros: ["Balanced revenue", "Multiple income streams", "Highest earning potential"],
      cons: ["Complex tracking", "Admin overhead", "Multiple vendors"],
      useCases: "For scaling cruise business"
    }
  ];

  const addOns = [
    { item: "Beverage Package", price: "₱1,500-3,500/person", description: "Alcoholic + non-alcoholic drinks, specialty coffees" },
    { item: "Shore Excursions", price: "₱2,000-8,000/person", description: "Pre-booked tours at ports (commission: 15-20%)" },
    { item: "Travel Insurance", price: "₱1,000-3,000/person", description: "Trip cancellation, medical, baggage coverage" },
    { item: "WiFi Package", price: "₱500-2,000/person", description: "Daily, weekly, or full cruise internet access" },
    { item: "Specialty Dining", price: "₱3,000-8,000/person", description: "Fine dining venues, premium restaurants" },
    { item: "Onboard Credits", price: "₱2,000-10,000", description: "Pre-purchase credits for onboard spending" }
  ];

  const paymentOptions = [
    { option: "Deposit Payment", amount: "25-50% of total", timeline: "Due at booking", description: "Reduces customer risk, holds cabin" },
    { option: "Full Payment", amount: "100% of total", timeline: "Due at booking", description: "Best for cash flow, usual for < 90 days before" },
    { option: "Installment Plan", amount: "Monthly payments", timeline: "Final balance 60-90 days before", description: "Budget-friendly for customers, more admin" }
  ];

  const adminOperations = [
    { icon: "📋", title: "Cruise Booking Management", desc: "View all cruise bookings with cabin details" },
    { icon: "💳", title: "Deposit Tracking", desc: "Monitor partial & full payments received" },
    { icon: "🔔", title: "Final Payment Reminders", desc: "Auto-send reminder emails to customers" },
    { icon: "📑", title: "Passenger Manifest Export", desc: "Generate guest lists for cruise lines" },
    { icon: "💰", title: "Commission Monitoring", desc: "Track commission owed from each cruise line" },
    { icon: "🏢", title: "Supplier Settlement", desc: "Reconcile cruise line commission payments" },
    { icon: "📊", title: "Sales by Destination", desc: "Analytics on popular cruises and regions" },
    { icon: "⚙️", title: "Add-on Revenue", desc: "Track excursions, insurance, beverage sales" }
  ];

  const dataFlow = [
    { entity: "CruiseBooking", fields: ["cruise_line", "ship_name", "cabin_type", "passenger_names[]", "total_price"] },
    { entity: "PaymentSplit", fields: ["booking_id", "cruise_line_cost", "commission_earned", "service_fee"] },
    { entity: "Payment", fields: ["booking_id", "amount_paid", "payment_type", "deposit_vs_final", "due_date"] },
    { entity: "AddOn", fields: ["booking_id", "addon_type", "price", "commission_rate", "supplier"] }
  ];

  const cruiseSuppliers = [
    { name: "Royal Caribbean Intl", regions: "Global", commission: "10-15%", notes: "Largest fleet, diverse itineraries" },
    { name: "MSC Cruises", regions: "Europe, Mediterranean, Caribbean", commission: "12-18%", notes: "Strong European presence" },
    { name: "Norwegian Cruise Line", regions: "Caribbean, Alaska, Europe", commission: "10-15%", notes: "Freestyle cruising" },
    { name: "Princess Cruises", regions: "Alaska, Caribbean, Europe", commission: "10-15%", notes: "Premium positioning" },
    { name: "Carnival Corporation", regions: "Global", commission: "10-12%", notes: "Value positioning" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Cruise Booking Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end cruise booking with commission strategies, cabin selection, and high-margin add-ons</p>
      </div>

      {/* Alert: High Margin Opportunity */}
      <Card className="mb-8 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="flex gap-4 pt-6">
          <AlertCircle className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900 mb-1">💰 Cruise Booking = Highest Margins in Travel</p>
            <p className="text-sm text-emerald-900">Commission (10-20%) + Service Fees (₱2-5K) + Add-on upsells (15-30%) = ₱10-25K+ per booking</p>
          </div>
        </CardContent>
      </Card>

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

      {/* Cabin Types */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">🛏️ Cabin Types & Pricing</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cabinTypes.map((cabin, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <p className="text-3xl mb-2">{cabin.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{cabin.type}</p>
                <p className="text-xs text-slate-600 mb-2">{cabin.description}</p>
                <p className="font-bold text-emerald-700 text-sm">{cabin.price}</p>
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
      <Card className="mb-12 bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300 border-2">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            📦 Add-ons - High Margin Upsell Opportunities
          </CardTitle>
          <p className="text-sm text-rose-800 mt-2">Commission: 15-30% on most add-ons = ₱3,000-5,000+ extra per booking</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon, i) => (
              <div key={i} className="p-4 bg-white rounded border border-rose-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-slate-900">{addon.item}</p>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded">20-30%</span>
                </div>
                <p className="text-sm font-bold text-rose-700 mb-1">{addon.price}</p>
                <p className="text-xs text-slate-600">{addon.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-blue-900">💳 Payment Options - Deposit & Installment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {paymentOptions.map((payment, i) => (
              <div key={i} className="p-4 bg-white rounded border border-blue-100">
                <p className="font-bold text-slate-900 mb-2">{payment.option}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Amount</p>
                    <p className="text-emerald-700 font-bold">{payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Timeline</p>
                    <p className="text-blue-700">{payment.timeline}</p>
                  </div>
                  <p className="text-xs text-slate-600 italic">{payment.description}</p>
                </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div key={i} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-bold text-indigo-900 text-sm mb-2">{item.entity}</h4>
                <ul className="text-xs text-indigo-900 space-y-1">
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
          <CardTitle className="text-purple-900">💳 Sample Fare Breakdown - 7-Night Balcony Cabin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Base Cruise Fare (per person)</span>
                  <span className="font-bold text-slate-900">₱45,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Taxes & Fees</span>
                  <span className="font-bold text-slate-900">₱5,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Gratuities (optional pre-pay)</span>
                  <span className="font-bold text-slate-900">₱3,500</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Beverage Package</span>
                  <span className="font-bold text-slate-900">₱2,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Travel Insurance</span>
                  <span className="font-bold text-slate-900">₱1,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Your Service Fee (5%)</span>
                  <span className="font-bold text-emerald-700">₱2,800</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-purple-100 rounded border border-purple-300 mt-2">
              <span className="font-bold text-purple-900">Total Customer Pays</span>
              <span className="font-bold text-purple-900 text-lg">₱59,800</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900 mb-2">🎯 Your Earnings (Per Booking):</p>
              <ul className="text-xs text-emerald-900 space-y-1">
                <li>✓ Commission from cruise line (15% × ₱45K) = ₱6,750</li>
                <li>✓ Service fee = ₱2,800</li>
                <li>✓ Beverage package commission (20%) = ₱400</li>
                <li>✓ Insurance commission (15%) = ₱225</li>
                <li className="font-bold text-emerald-700 border-t border-emerald-300 pt-1 mt-1">
                  💰 Total: ₱10,175 per cabin
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cruise Line Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Major Cruise Line Partners & Commission Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Cruise Line</th>
                <th className="text-left p-3 font-semibold">Regions</th>
                <th className="text-left p-3 font-semibold">Commission Rate</th>
                <th className="text-left p-3 font-semibold">Key Features</th>
              </tr>
            </thead>
            <tbody>
              {cruiseSuppliers.map((supplier, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{supplier.name}</td>
                  <td className="p-3">{supplier.regions}</td>
                  <td className="p-3">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">
                      {supplier.commission}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{supplier.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-4">
            💡 <strong>Tip:</strong> Cruise lines offer FAM (familiarization) trips for agents - great way to increase commissions and build relationships.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
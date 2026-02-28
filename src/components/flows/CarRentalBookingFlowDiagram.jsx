import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, Car, DollarSign, FileText, CheckCircle2, Mail, Phone, CreditCard, TrendingUp, BarChart3, Zap } from "lucide-react";

export default function CarRentalBookingFlowDiagram() {
  const flowStages = [
    {
      stage: "Discovery & Search",
      color: "bg-sky-50 border-l-4 border-sky-500",
      steps: [
        { title: "Customer Access", icon: Globe, desc: "Web App / Mobile App / Agency Portal" },
        { title: "Search Criteria", icon: Search, desc: "Pickup Location, Drop-off Location, Dates/Times, Driver Age" },
        { title: "API Query", icon: "🔌", desc: "Car Rental Aggregator API + Direct Rental Company Inventory" }
      ]
    },
    {
      stage: "Results & Selection",
      color: "bg-blue-50 border-l-4 border-blue-500",
      steps: [
        { title: "Display Vehicles", icon: Car, desc: "Rental Company, Category, Transmission, Fuel Policy, Rate, Mileage" },
        { title: "View Conditions", icon: "📋", desc: "Age Requirements, Security Deposit, Cancellation, Insurance Coverage" },
        { title: "Select Vehicle", icon: CheckCircle2, desc: "Choose preferred rental car" }
      ]
    },
    {
      stage: "Rental Details & Add-ons",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Driver Information", icon: Users, desc: "Name (as per License), License Number, Expiry Date, Contact" },
        { title: "Add-ons Selection", icon: "📦", desc: "GPS, Child Seat, Additional Driver, Full Insurance, Toll Pass" },
        { title: "Review Summary", icon: FileText, desc: "Complete fare breakdown with all charges" }
      ]
    },
    {
      stage: "Payment & Confirmation",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Fare Summary", icon: DollarSign, desc: "Base Rental + Taxes + Add-ons + Markup" },
        { title: "Payment Gateway", icon: CreditCard, desc: "Card, Bank Transfer, E-wallet" },
        { title: "Confirmation", icon: CheckCircle2, desc: "Payment verified and recorded" }
      ]
    },
    {
      stage: "Post-Booking",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "Voucher Issued", icon: "🎫", desc: "Pick-up Instructions + Supplier Contact Details" },
        { title: "Rental Operator Notified", icon: Mail, desc: "Booking sent to rental company" },
        { title: "Commission Recorded", icon: TrendingUp, desc: "Commission/Markup logged in system" }
      ]
    }
  ];

  const carCategories = [
    { category: "Economy", icon: "🚗", price: "₱800-1,200/day", description: "Compact, fuel-efficient, budget option" },
    { category: "Sedan", icon: "🚙", price: "₱1,200-1,800/day", description: "Mid-size, comfortable, ideal for families" },
    { category: "SUV", icon: "🚐", price: "₱1,800-3,000/day", description: "Large, spacious, rugged terrain capable" },
    { category: "Van", icon: "🚌", price: "₱2,500-4,500/day", description: "7-15 seats, perfect for groups/tours" },
    { category: "Luxury", icon: "🏎️", price: "₱3,500-8,000/day", description: "Premium brands, premium experience" }
  ];

  const revenueModels = [
    {
      title: "Commission Model (Industry Standard)",
      icon: "📊",
      recommended: false,
      flow: [
        { step: "Customer Pays", amount: "₱2,000", detail: "Daily rental rate" },
        { step: "Commission Rate", amount: "8-15%", detail: "From rental company (₱160-300)" },
        { step: "Paid Timeline", amount: "T+30-60", detail: "After rental completion" }
      ],
      profitMargin: {
        min: "₱160-300 per day",
        max: "₱400-600 per booking",
        percentage: "8-15% commission"
      },
      pros: ["Industry standard", "Competitive pricing", "Volume driver"],
      cons: ["Delayed payment", "Lower margins", "Supplier dependent"],
      useCases: "For budget-conscious customers, high volume"
    },
    {
      title: "Markup Model (Recommended)",
      icon: "✅",
      recommended: true,
      flow: [
        { step: "Supplier Rate", amount: "₱1,800", detail: "Wholesale cost per day" },
        { step: "Your Selling Price", amount: "₱2,500", detail: "Markup added to customer" },
        { step: "Your Profit", amount: "₱700/day", detail: "Instant earnings per day" }
      ],
      profitMargin: {
        min: "₱300-700 per day",
        max: "₱3,500-7,000 per week",
        percentage: "15-25% daily markup"
      },
      pros: ["Instant cash flow", "Price control", "Predictable earnings"],
      cons: ["Limited inventory", "Higher pricing"],
      useCases: "Best for premium & long-term rentals"
    },
    {
      title: "Hybrid Model (Best Growth)",
      icon: "⚡",
      recommended: false,
      flow: [
        { step: "Base Commission", amount: "8-10%", detail: "From rental company" },
        { step: "Service Fee", amount: "₱200-400/day", detail: "Instant service charge" },
        { step: "Insurance Upsell", amount: "20-30% margin", detail: "On additional coverage" }
      ],
      profitMargin: {
        min: "₱350-500 per day",
        max: "₱700-1,200 per day",
        percentage: "12-20% blended margin"
      },
      pros: ["Multiple revenue streams", "Balanced earnings", "Flexibility"],
      cons: ["Complex tracking", "Admin overhead"],
      useCases: "For diverse rental portfolio"
    }
  ];

  const addOns = [
    { item: "GPS/Navigation", price: "₱200-400/day", commission: "20-30%", description: "GPS device or smartphone integration" },
    { item: "Child Seat", price: "₱300-600/rental", commission: "25-35%", description: "Infant, booster, or convertible seat" },
    { item: "Additional Driver", price: "₱400-800", commission: "20-30%", description: "Extra licensed driver for relief" },
    { item: "Full Insurance", price: "₱500-1,500/day", commission: "15-25%", description: "Comprehensive coverage, zero deductible" },
    { item: "Toll Pass", price: "₱100-300", commission: "30-40%", description: "Pre-loaded toll/freeway pass" },
    { item: "Fuel Top-up", price: "₱50/liter markup", commission: "Variable", description: "Full tank delivery at pickup" }
  ];

  const adminOperations = [
    { icon: "📋", title: "Rental Booking Management", desc: "View all car rental bookings with details" },
    { icon: "✏️", title: "Modify Rental", desc: "Change dates, vehicle, or driver information" },
    { icon: "❌", title: "Cancel Rental", desc: "Process cancellations and refunds" },
    { icon: "💰", title: "Commission Tracking", desc: "Monitor markup and commission earnings" },
    { icon: "📊", title: "Location Analytics", desc: "Popular pickup points, vehicle demand" },
    { icon: "🏢", title: "Supplier Settlement", desc: "Track and reconcile rental company payments" }
  ];

  const dataFlow = [
    { entity: "CarRentalBooking", fields: ["vehicle_type", "driver_name", "pickup_location", "return_location", "total_days", "total_price"] },
    { entity: "PaymentSplit", fields: ["booking_id", "rental_company_cost", "markup_amount", "commission_earned"] },
    { entity: "Payment", fields: ["booking_id", "amount_paid", "payment_method", "transaction_id", "status"] },
    { entity: "Car", fields: ["category", "model", "transmission", "fuel_policy", "daily_rate", "available_count"] }
  ];

  const rentalSuppliers = [
    { name: "Hertz", regions: "Global (150+ countries)", commission: "8-12%", features: "Premium service, frequent flyer tie-ins" },
    { name: "Avis", regions: "Global (180+ countries)", commission: "8-12%", features: "Best rate guarantee, loyalty program" },
    { name: "Europcar", regions: "Europe, Asia, Australia", commission: "10-15%", features: "Best for Europe, flexible terms" },
    { name: "Enterprise", regions: "USA, Canada, Europe", commission: "8-15%", features: "Affordable, pick-up/drop-off convenience" },
    { name: "Local Operators", regions: "Philippines", commission: "Variable", features: "Best margins, personal service" }
  ];

  const paymentProcessing = [
    { step: "1. Payment Processed", desc: "Customer payment verified and captured" },
    { step: "2. Voucher Generated", desc: "Rental voucher with pickup instructions" },
    { step: "3. Rental Company Notified", desc: "Booking details sent to rental company" },
    { step: "4. Confirmation Email", desc: "Customer receives booking details + contract" },
    { step: "5. Commission/Markup Logged", desc: "PaymentSplit record created" },
    { step: "6. Pickup Ready", desc: "Vehicle prepared for customer arrival" }
  ];

  const rentalConditions = [
    { condition: "Age Requirements", detail: "Usually 21+ years old, some rentals 25+" },
    { condition: "License Requirements", detail: "Valid driver's license (domestic/international)" },
    { condition: "Security Deposit", detail: "Usually ₱2,000-10,000 (refundable)" },
    { condition: "Credit Card", detail: "Valid credit card for authorization hold" },
    { condition: "Insurance", detail: "Optional CDW/LDW or customer's own insurance" },
    { condition: "Fuel Policy", detail: "Return full, prepay, or empty options" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Car Rental Booking Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end car rental booking with commission strategies, vehicle selection, and high-margin add-ons</p>
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

      {/* Car Categories */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">🚗 Vehicle Categories & Pricing</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {carCategories.map((car, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl mb-2">{car.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{car.category}</p>
                <p className="text-xs text-slate-600 mb-2">{car.description}</p>
                <p className="font-bold text-emerald-700 text-sm">{car.price}</p>
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

      {/* Rental Conditions */}
      <Card className="mb-12 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 border-2">
        <CardHeader>
          <CardTitle className="text-orange-900">📋 Standard Rental Conditions & Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rentalConditions.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded border border-orange-100">
                <p className="font-semibold text-slate-900 mb-2">{item.condition}</p>
                <p className="text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons - High Margin Revenue */}
      <Card className="mb-12 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 border-2">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            📦 Add-ons - High Margin Upsell Opportunities
          </CardTitle>
          <p className="text-sm text-rose-800 mt-2">Many add-ons have 20-40% margins = ₱2,000-5,000 extra per week-long rental</p>
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
              <div key={i} className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                <h4 className="font-bold text-sky-900 text-sm mb-2">{item.entity}</h4>
                <ul className="text-xs text-sky-900 space-y-1">
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
          <CardTitle className="text-purple-900">💳 Sample Fare Breakdown - 5 Days Sedan Rental</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Base Rental (5 days × ₱2,000)</span>
                  <span className="font-bold text-slate-900">₱10,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Taxes (VAT 12%)</span>
                  <span className="font-bold text-slate-900">₱1,200</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Security Deposit (refundable)</span>
                  <span className="font-bold text-slate-900">₱5,000</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">GPS Add-on (5 days)</span>
                  <span className="font-bold text-slate-900">₱1,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Full Insurance</span>
                  <span className="font-bold text-slate-900">₱2,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Your Service Fee (5%)</span>
                  <span className="font-bold text-emerald-700">₱625</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-purple-100 rounded border border-purple-300 mt-2">
              <span className="font-bold text-purple-900">Total Customer Pays (Before Deposit)</span>
              <span className="font-bold text-purple-900 text-lg">₱14,700</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900 mb-2">🎯 Your Earnings (Per Booking):</p>
              <ul className="text-xs text-emerald-900 space-y-1">
                <li>✓ Commission from rental company (10% × ₱10K) = ₱1,000</li>
                <li>✓ Service fee = ₱625</li>
                <li>✓ GPS add-on commission (25%) = ₱250</li>
                <li>✓ Insurance commission (20%) = ₱500</li>
                <li className="font-bold text-emerald-700 border-t border-emerald-300 pt-1 mt-1">
                  💰 Total: ₱2,375 per rental
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
            Payment Processing Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentProcessing.map((item, i) => (
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

      {/* Rental Company Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Car Rental Partners & Commission Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Rental Company</th>
                <th className="text-left p-3 font-semibold">Regions</th>
                <th className="text-left p-3 font-semibold">Commission</th>
                <th className="text-left p-3 font-semibold">Key Features</th>
              </tr>
            </thead>
            <tbody>
              {rentalSuppliers.map((supplier, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{supplier.name}</td>
                  <td className="p-3">{supplier.regions}</td>
                  <td className="p-3">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">
                      {supplier.commission}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{supplier.features}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-4">
            💡 <strong>Tip:</strong> Local operators in Philippines often offer 15-25% commission for high-volume partners. Direct negotiation recommended.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
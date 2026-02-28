import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Globe, Search, MapPin, Calendar, Users, FileText, CreditCard, CheckCircle2, Mail, Phone, Star, Gift, Play } from "lucide-react";

export default function TourBookingFlowDiagram() {
  const flowSteps = [
    {
      stage: "Discovery",
      steps: [
        { title: "Visit Website/App", icon: Globe, color: "bg-blue-100 text-blue-900", desc: "GC Travel & Tours Platform" },
        { title: "Search Tours", icon: Search, color: "bg-cyan-100 text-cyan-900", desc: "Local, International, Group, Private" },
        { title: "Enter Details", icon: MapPin, color: "bg-teal-100 text-teal-900", desc: "Destination, Date, Pax, Requests" }
      ]
    },
    {
      stage: "Backend Processing",
      steps: [
        { title: "Query Suppliers", icon: "🔌", color: "bg-purple-100 text-purple-900", desc: "APIs + Local Database + Manual Contracts" },
        { title: "Fetch & Aggregate", icon: "⚙️", color: "bg-indigo-100 text-indigo-900", desc: "Combine results from all sources" },
        { title: "Apply Markup", icon: "💰", color: "bg-amber-100 text-amber-900", desc: "Add ₱500-2,000 markup per tour" }
      ]
    },
    {
      stage: "Selection & Review",
      steps: [
        { title: "Display Results", icon: FileText, color: "bg-green-100 text-green-900", desc: "Tours with Inclusions, Itinerary, Price, Slots" },
        { title: "Customer Selects", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-900", desc: "Choose preferred tour" },
        { title: "Review Page", icon: FileText, color: "bg-lime-100 text-lime-900", desc: "Itinerary, Policy, T&C, Price Breakdown" }
      ]
    },
    {
      stage: "Checkout",
      steps: [
        { title: "Passenger Info", icon: Users, color: "bg-rose-100 text-rose-900", desc: "Name, Contact, Passport, Emergency Contact" },
        { title: "Payment Method", icon: CreditCard, color: "bg-orange-100 text-orange-900", desc: "Card, Bank Transfer, OTC, Installment" },
        { title: "Process Payment", icon: "🏦", color: "bg-red-100 text-red-900", desc: "Stripe + Auto Markup Deduction" }
      ]
    },
    {
      stage: "Confirmation & Supplier",
      steps: [
        { title: "Generate Booking", icon: FileText, color: "bg-indigo-100 text-indigo-900", desc: "Reference #, Voucher, Invoice" },
        { title: "Notify Customer", icon: Mail, color: "bg-blue-100 text-blue-900", desc: "Email, SMS, In-app Notification" },
        { title: "Supplier Confirm", icon: CheckCircle2, color: "bg-green-100 text-green-900", desc: "Manual or API Confirmation" }
      ]
    },
    {
      stage: "Execution & Follow-up",
      steps: [
        { title: "Final Voucher", icon: FileText, color: "bg-teal-100 text-teal-900", desc: "Confirmed & Locked In" },
        { title: "Tour Day", icon: Play, color: "bg-purple-100 text-purple-900", desc: "Customer Experience" },
        { title: "Post-Tour", icon: Star, color: "bg-amber-100 text-amber-900", desc: "Reviews, Points, Upsell" }
      ]
    }
  ];

  const dataEntities = [
    { entity: "Tour", color: "bg-blue-50", fields: ["title", "destination", "duration_days", "price_per_person", "itinerary", "inclusions"] },
    { entity: "TourBooking", color: "bg-green-50", fields: ["tour_id", "customer_name", "number_of_participants", "total_price", "status"] },
    { entity: "PaymentSplit", color: "bg-amber-50", fields: ["booking_id", "supplier_cost", "markup_amount", "payment_status"] },
    { entity: "Notification", color: "bg-purple-50", fields: ["booking_id", "type", "recipient", "sent_at", "status"] }
  ];

  const paymentFlow = [
    { step: "Customer Pays", amount: "₱15,000", desc: "Total with markup" },
    { step: "Supplier Cost", amount: "-₱13,000", desc: "Net rate to supplier" },
    { step: "Your Profit", amount: "₱2,000", desc: "Instant markup earnings" },
    { step: "System Records", amount: "→ PaymentSplit", desc: "Track commission & profit" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Tours Booking Flow - Complete Journey</h2>
        <p className="text-slate-600">End-to-end tour booking process from search to post-tour follow-up with supplier integration</p>
      </div>

      {/* Main Flow */}
      <div className="space-y-2 mb-12">
        {flowSteps.map((stage, stageIdx) => (
          <div key={stageIdx}>
            {/* Stage Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3 rounded-lg mb-3 border-l-4 border-slate-500">
              <h3 className="font-bold text-slate-900 text-lg">Stage {stageIdx + 1}: {stage.stage}</h3>
            </div>

            {/* Stage Steps */}
            <div className="space-y-2">
              {stage.steps.map((step, stepIdx) => {
                const Icon = typeof step.icon === "string" ? null : step.icon;
                return (
                  <div key={stepIdx}>
                    <Card className={`overflow-hidden ${step.color}`}>
                      <CardContent className="flex items-start gap-4 py-4 px-6">
                        {Icon ? (
                          <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                        ) : (
                          <span className="text-2xl flex-shrink-0">{step.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{step.title}</p>
                          <p className="text-sm opacity-75 mt-1">{step.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                    {!(stageIdx === flowSteps.length - 1 && stepIdx === stage.steps.length - 1) && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {stageIdx < flowSteps.length - 1 && (
              <div className="h-4 flex items-center justify-center my-2">
                <div className="w-1 h-full bg-slate-300 rounded" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment & Revenue Flow */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Calculation */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment & Revenue Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentFlow.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium text-sm">{item.step}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">{item.amount}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Search Parameters & Sources */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Tour Search Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-sm">Search Criteria Input</p>
              <ul className="text-xs text-slate-600 mt-2 space-y-1">
                <li>✓ Destination (City/Province)</li>
                <li>✓ Travel Date Range</li>
                <li>✓ Number of Participants</li>
                <li>✓ Tour Type (Local/Int'l/Group/Private)</li>
                <li>✓ Special Requests</li>
              </ul>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-medium text-sm">Data Sources Queried</p>
              <ul className="text-xs text-slate-600 mt-2 space-y-1">
                <li>🔌 Tour Supplier APIs</li>
                <li>💾 Local Operator Database</li>
                <li>📋 Manual Contract Rates</li>
                <li>🏢 Partner Network</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Entities */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Core Entities & Data Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataEntities.map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border ${item.color}`}>
                <h4 className="font-bold text-slate-900 mb-2">{item.entity}</h4>
                <ul className="text-xs text-slate-700 space-y-1">
                  {item.fields.map((field, j) => (
                    <li key={j} className="font-mono">• {field}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Integration */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-8">
        <CardHeader>
          <CardTitle className="text-purple-900">Supplier Confirmation Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Automated (API)</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time slot availability check</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Instant confirmation response</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Automatic voucher generation</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>2-5 minute turnaround</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-3">Manual (Email/Phone)</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex gap-2">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Email booking request to supplier</span>
                  </li>
                  <li className="flex gap-2">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Follow-up phone confirmation</span>
                  </li>
                  <li className="flex gap-2">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Receive confirmation document</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>24-48 hour typical response</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification System */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Customer Notification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📧 Email Notifications</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Booking confirmation</li>
                <li>• Voucher & Itinerary</li>
                <li>• Payment receipt</li>
                <li>• Pre-tour reminders</li>
                <li>• Post-tour follow-up</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📱 SMS Notifications</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Booking confirmation</li>
                <li>• Payment status</li>
                <li>• 24-hour reminder</li>
                <li>• Day-of reminder</li>
                <li>• Tour completion</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">🔔 In-App Notifications</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Real-time updates</li>
                <li>• Booking status changes</li>
                <li>• Supplier confirmations</li>
                <li>• Weather/Safety alerts</li>
                <li>• Review requests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post-Tour Engagement */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Post-Tour Engagement & Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-emerald-100">
              <p className="font-semibold text-emerald-900 mb-2">⭐ Reviews & Ratings</p>
              <p className="text-sm text-slate-700">Collect feedback to improve quality and build social proof. Display on tour listing pages.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-100">
              <p className="font-semibold text-emerald-900 mb-2">🎁 Loyalty Points</p>
              <p className="text-sm text-slate-700">Award points per booking redeemable on future tours. Encourage repeat bookings and referrals.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-100">
              <p className="font-semibold text-emerald-900 mb-2">🚀 Upsell Opportunities</p>
              <p className="text-sm text-slate-700">Recommend related tours, travel insurance, and next destinations based on tour category.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Booking KPIs & Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { metric: "Total Tours", value: "50+", color: "bg-blue-100 text-blue-900" },
              { metric: "Avg Markup/Tour", value: "₱1,500", color: "bg-green-100 text-green-900" },
              { metric: "Booking Conversion", value: "3-5%", color: "bg-amber-100 text-amber-900" },
              { metric: "Avg Review Rating", value: "4.6/5 ⭐", color: "bg-purple-100 text-purple-900" }
            ].map((kpi, i) => (
              <div key={i} className={`p-4 rounded-lg ${kpi.color} text-center`}>
                <p className="text-xs opacity-75 mb-1">{kpi.metric}</p>
                <p className="font-bold text-lg">{kpi.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
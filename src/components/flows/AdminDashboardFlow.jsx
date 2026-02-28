import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowRight, BookOpen, TrendingUp, Percent, RotateCcw, Database, Filter, BarChart3, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminDashboardFlow() {
  const modules = [
    {
      icon: BookOpen,
      title: "View Bookings",
      color: "bg-blue-100 text-blue-900",
      description: "Monitor all customer bookings",
      features: [
        "Filter by product type (Flight, Hotel, Tour, etc)",
        "Search by PNR or customer name",
        "View booking status (pending, confirmed, completed)",
        "Check payment status",
        "See booking details & add-ons"
      ],
      dataFlow: "← Fetch from FlightBooking, HotelBooking, TourBooking, etc entities"
    },
    {
      icon: TrendingUp,
      title: "Track Commissions",
      color: "bg-purple-100 text-purple-900",
      description: "Monitor revenue and profit",
      features: [
        "View commission per booking",
        "Calculate total revenue by period",
        "Break down by product type",
        "Track payment received status",
        "Generate commission reports"
      ],
      dataFlow: "← Fetch from PaymentSplit entity"
    },
    {
      icon: Percent,
      title: "Markup Control",
      color: "bg-amber-100 text-amber-900",
      description: "Manage pricing and profit margins",
      features: [
        "Set default markup percentages per product",
        "Apply seasonal markup adjustments",
        "Set minimum/maximum markup rules",
        "View current markup settings",
        "Update in real-time"
      ],
      dataFlow: "← Read/Write to PackageMarkupSettings"
    },
    {
      icon: RotateCcw,
      title: "Refund Processing",
      color: "bg-red-100 text-red-900",
      description: "Handle cancellations and refunds",
      features: [
        "View refund requests",
        "Approve/Deny refunds",
        "Calculate refund amount (gross - fees)",
        "Process refund via payment gateway",
        "Send refund confirmation email"
      ],
      dataFlow: "← Update booking & PaymentSplit status"
    },
    {
      icon: Database,
      title: "Supplier Reconciliation",
      color: "bg-green-100 text-green-900",
      description: "Match supplier payments and invoices",
      features: [
        "View supplier payables",
        "Match invoices with bookings",
        "Track payment status to suppliers",
        "Generate supplier payment reports",
        "Reconcile monthly statements"
      ],
      dataFlow: "← Read from SupplierPayment & PaymentSplit"
    }
  ];

  const dataFlow = [
    { step: "Admin Logs In", icon: "🔐" },
    { step: "Load Dashboard Data", icon: "📊" },
    { step: "Fetch from Entities", icon: "💾" },
    { step: "Process & Aggregate", icon: "⚙️" },
    { step: "Display Analytics", icon: "📈" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard Backend Flow</h2>
        <p className="text-slate-600">Backend architecture for admin operations and monitoring</p>
      </div>

      {/* Data Loading Flow */}
      <Card className="mb-8 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Data Loading Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {dataFlow.map((item, index) => (
              <div key={index} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-center text-slate-700">{item.step}</span>
                </div>
                {index < dataFlow.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {modules.map((module, index) => (
          <Card key={index} className={`overflow-hidden hover:shadow-lg transition-shadow ${module.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <module.icon className="w-6 h-6 flex-shrink-0" />
                <CardTitle className="text-base">{module.title}</CardTitle>
              </div>
              <p className="text-xs mt-1 opacity-80">{module.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold mb-2">Features:</h4>
                <ul className="space-y-1">
                  {module.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <span className="text-base leading-none">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-current border-opacity-20">
                <p className="text-xs font-mono opacity-75">{module.dataFlow}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entity Interactions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Entity Data Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Booking Data */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Booking Entities
                </h4>
                <ul className="text-sm text-blue-900 space-y-1">
                  <li>• FlightBooking</li>
                  <li>• HotelBooking</li>
                  <li>• TourBooking</li>
                  <li>• FerryBooking</li>
                  <li>• BusBooking</li>
                  <li>• CarRentalBooking</li>
                  <li>• CruiseBooking</li>
                  <li>• TrainBooking</li>
                </ul>
              </div>

              {/* Financial Data */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Entities
                </h4>
                <ul className="text-sm text-green-900 space-y-1">
                  <li>• PaymentSplit (revenue tracking)</li>
                  <li>• SupplierPayment (payables)</li>
                  <li>• Payment (transactions)</li>
                  <li>• PackageMarkupSettings (pricing)</li>
                  <li>• DynamicPrice (adjustments)</li>
                  <li>• DiscountCode (promotions)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Operations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Read Operations */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Read Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">GET</span>
              <span>Fetch all bookings with filters</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">GET</span>
              <span>Calculate total commission by period</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">GET</span>
              <span>Get markup settings for each product</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">GET</span>
              <span>List supplier payment reconciliation</span>
            </div>
          </CardContent>
        </Card>

        {/* Write Operations */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Write Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">PUT</span>
              <span>Update booking status (confirm, cancel)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">PUT</span>
              <span>Process refund & update payment status</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">PUT</span>
              <span>Update markup percentages in real-time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">PUT</span>
              <span>Mark supplier payments as processed</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
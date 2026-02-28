import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Globe, Search, Database, BarChart3, Eye, MapPin, Calendar, Users, Banknote, CheckCircle2, Mail, FileText, AlertCircle } from "lucide-react";

export default function HotelBookingFlowDiagram() {
  const mainSteps = [
    { title: "Customer Visits Website", icon: Globe, color: "bg-blue-100 text-blue-900" },
    { title: "Search Hotel", icon: Search, color: "bg-cyan-100 text-cyan-900" },
    { title: "API Requests to Suppliers", icon: Database, color: "bg-purple-100 text-purple-900" },
    { title: "Display Results", icon: Eye, color: "bg-indigo-100 text-indigo-900" },
    { title: "Select Hotel & Room", icon: MapPin, color: "bg-teal-100 text-teal-900" },
    { title: "Review & Add-ons", icon: Users, color: "bg-green-100 text-green-900" },
    { title: "Price Calculation", icon: BarChart3, color: "bg-amber-100 text-amber-900" },
    { title: "Payment Processing", icon: Banknote, color: "bg-red-100 text-red-900" },
  ];

  const successPath = [
    { title: "Send to Supplier", icon: Database },
    { title: "Get Confirmation #", icon: CheckCircle2 },
    { title: "Generate Voucher", icon: FileText },
    { title: "Send Email + SMS", icon: Mail },
    { title: "Record Commission", icon: BarChart3 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Hotel Booking Flow</h2>
        <p className="text-slate-600">Complete end-to-end hotel booking process with payment and confirmation</p>
      </div>

      {/* Main Flow */}
      <div className="space-y-3 mb-12">
        {mainSteps.map((step, index) => (
          <div key={index}>
            <Card className={`overflow-hidden ${step.color}`}>
              <CardContent className="flex items-center gap-4 py-4 px-6">
                <step.icon className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold">{step.title}</span>
              </CardContent>
            </Card>
            {index < mainSteps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Decision Point */}
      <Card className="mb-8 border-2 border-orange-500 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-900 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Payment Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Success Path */}
            <div className="space-y-2">
              <h4 className="font-semibold text-green-900 mb-3">✓ Payment Successful</h4>
              {successPath.map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <step.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{step.title}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-sm text-green-900">
                <strong>Result:</strong> Booking confirmed, customer receives PNR, voucher, and confirmation email
              </div>
            </div>

            {/* Failure Path */}
            <div className="space-y-2">
              <h4 className="font-semibold text-red-900 mb-3">✗ Payment Failed</h4>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Display Error Message</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Allow Retry Payment</span>
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded-lg text-sm text-red-900">
                <strong>Result:</strong> Booking stays pending, customer can retry payment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Search Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Destination:</span>
              <span className="text-slate-600">City/Location</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Check-in:</span>
              <span className="text-slate-600">Date</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Check-out:</span>
              <span className="text-slate-600">Date</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Guests:</span>
              <span className="text-slate-600">Number of guests</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Rooms:</span>
              <span className="text-slate-600">Number of rooms</span>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Data Returned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Available Hotels:</span>
              <span className="text-slate-600">List of properties</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Room Types:</span>
              <span className="text-slate-600">Single, Double, Suite, etc.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Rates:</span>
              <span className="text-slate-600">Per night pricing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Cancellation:</span>
              <span className="text-slate-600">Policy and terms</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-fit">Amenities:</span>
              <span className="text-slate-600">WiFi, Parking, Breakfast, etc.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Breakdown */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Pricing Engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium">Net Rate from Supplier</span>
            <span>Base Cost</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium">+ GC Travel Markup</span>
            <span>Profit Margin</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium">+ Taxes & Fees</span>
            <span>VAT, Service Fees</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-amber-100 rounded-lg font-bold">
            <span>=== Final Price ===</span>
            <span>Total to Customer</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
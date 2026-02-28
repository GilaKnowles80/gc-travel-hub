import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Search, Eye, MapPin, Calendar, Users, Plane, CheckCircle2, CreditCard, Mail, FileText } from "lucide-react";

export default function FlightBookingFlowDiagram() {
  const steps = [
    {
      phase: "Search & Filter",
      icon: Search,
      title: "Flight Search",
      description: "Enter origin, destination, dates, and number of passengers",
      color: "bg-blue-100 text-blue-900",
      details: ["Select departure location", "Choose destination", "Pick travel dates", "Specify passenger count"]
    },
    {
      phase: "Results",
      icon: Eye,
      title: "View Results",
      description: "Browse available flights with prices and details",
      color: "bg-purple-100 text-purple-900",
      details: ["Compare flight options", "Check amenities", "View price breakdown", "Read reviews"]
    },
    {
      phase: "Selection",
      icon: Plane,
      title: "Flight Details",
      description: "Select cabin class and view flight details",
      color: "bg-amber-100 text-amber-900",
      details: ["Choose cabin class", "View flight info", "Select seat type", "Check baggage allowance"]
    },
    {
      phase: "Checkout Step 1",
      icon: Users,
      title: "Passenger Info",
      description: "Enter passenger details and contact information",
      color: "bg-green-100 text-green-900",
      details: ["Full name", "Email address", "Phone number", "Passport number"]
    },
    {
      phase: "Checkout Step 2",
      icon: CheckCircle2,
      title: "Select Add-ons",
      description: "Choose optional services (baggage, seats, meals, insurance)",
      color: "bg-teal-100 text-teal-900",
      details: ["Extra baggage", "Seat selection", "Meal preferences", "Travel insurance"]
    },
    {
      phase: "Checkout Step 3",
      icon: FileText,
      title: "Review Booking",
      description: "Verify all details and pricing before payment",
      color: "bg-indigo-100 text-indigo-900",
      details: ["Confirm passenger info", "Verify add-ons", "Check total price", "Review terms"]
    },
    {
      phase: "Checkout Step 4",
      icon: CreditCard,
      title: "Payment",
      description: "Process payment via Stripe",
      color: "bg-red-100 text-red-900",
      details: ["Enter payment details", "Process transaction", "Generate PNR", "Confirm booking"]
    },
    {
      phase: "Confirmation",
      icon: Mail,
      title: "Booking Confirmed",
      description: "Receive confirmation email with PNR and e-ticket",
      color: "bg-emerald-100 text-emerald-900",
      details: ["Send confirmation email", "Issue e-ticket", "Log commission", "Update booking record"]
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Flight Booking Flow</h2>
        <p className="text-slate-600">Complete journey from search to confirmation</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Icon Section */}
                  <div className={`${step.color} w-32 flex items-center justify-center py-8 flex-shrink-0`}>
                    <div className="flex flex-col items-center gap-2">
                      <step.icon className="w-8 h-8" />
                      <span className="text-xs font-semibold text-center">{step.phase}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Process Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <span className="font-semibold min-w-fit">Total Steps:</span>
            <span>8 phases from initial search to booking confirmation</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold min-w-fit">Key Pages:</span>
            <span>Flights (search) → FlightDetail (selection) → FlightCheckout (4-step process)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold min-w-fit">Output:</span>
            <span>PNR generation, confirmation email, e-ticket, commission logging</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
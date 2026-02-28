import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Plane, MapPin, Bus, Ship, Train, Zap, DollarSign, BarChart3, Globe } from "lucide-react";

export default function SuperOTAFlowDiagram() {
  const superFlow = [
    {
      stage: "Customer Access",
      color: "bg-blue-50 border-l-4 border-blue-500",
      icon: "🌐",
      description: "Multi-channel entry point"
    },
    {
      stage: "Product Selection",
      color: "bg-purple-50 border-l-4 border-purple-500",
      icon: "🛍️",
      description: "Choose service type"
    },
    {
      stage: "Search & Inventory",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      icon: "🔍",
      description: "Query supplier APIs"
    },
    {
      stage: "Results Display",
      color: "bg-teal-50 border-l-4 border-teal-500",
      icon: "📊",
      description: "Show available options"
    },
    {
      stage: "Selection & Add-ons",
      color: "bg-amber-50 border-l-4 border-amber-500",
      icon: "✅",
      description: "Choose & customize"
    },
    {
      stage: "Details Entry",
      color: "bg-orange-50 border-l-4 border-orange-500",
      icon: "👤",
      description: "Customer information"
    },
    {
      stage: "Payment Processing",
      color: "bg-rose-50 border-l-4 border-rose-500",
      icon: "💳",
      description: "Stripe/PayMongo/Remittance"
    },
    {
      stage: "Confirmation",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      icon: "✅",
      description: "Issue booking/case"
    },
    {
      stage: "Revenue Recording",
      color: "bg-indigo-50 border-l-4 border-indigo-500",
      icon: "💰",
      description: "Log earnings"
    },
    {
      stage: "Admin Monitoring",
      color: "bg-slate-50 border-l-4 border-slate-500",
      icon: "📈",
      description: "Dashboard tracking"
    }
  ];

  const productRevenue = [
    {
      product: "Flights",
      icon: "✈️",
      margin: "Markup + Airline Commission",
      example: "₱500-2,000 per booking",
      profitMargin: "5-15%",
      strategy: "Volume-based, fixed markup + commission"
    },
    {
      product: "Hotels",
      icon: "🏨",
      margin: "Commission (10-25%)",
      example: "₱1,000-5,000 per booking",
      profitMargin: "10-25%",
      strategy: "Commission on nightly rate"
    },
    {
      product: "Bus/Ferry/Train",
      icon: "🚌",
      margin: "Service fee per ticket",
      example: "₱150-500 per ticket",
      profitMargin: "15-20%",
      strategy: "Fixed service fee, instant earnings"
    },
    {
      product: "Cruise",
      icon: "🚢",
      margin: "Commission (10-20%) + Service Fee",
      example: "₱5,000-15,000 per booking",
      profitMargin: "12-20%",
      strategy: "High-value, split commission model"
    },
    {
      product: "Car Rental",
      icon: "🚗",
      margin: "Commission + Daily Markup",
      example: "₱300-1,500 per rental",
      profitMargin: "8-20%",
      strategy: "Commission + service markup"
    },
    {
      product: "Visa Services",
      icon: "🛂",
      margin: "Pure Service Fee (High Margin)",
      example: "₱3,000-15,000 per visa",
      profitMargin: "40-60%",
      strategy: "Service fee only, instant earnings"
    }
  ];

  const travelPackages = [
    {
      package: "Beach Getaway",
      icon: "🏖️",
      includes: ["Flight", "Hotel (3 nights)", "Transport"],
      duration: "4 days / 3 nights",
      basePrice: "₱35,000",
      gcRevenue: "₱8,500-12,000",
      discount: "Bundle discount 10-15%"
    },
    {
      package: "Europe Cultural Tour",
      icon: "🏰",
      includes: ["Flight", "Hotel (7 nights)", "Train pass", "Visa assistance"],
      duration: "10 days / 9 nights",
      basePrice: "₱95,000",
      gcRevenue: "₱18,000-25,000",
      discount: "Bundle discount 15%"
    },
    {
      package: "Asia Adventure",
      icon: "🗻",
      includes: ["Flight", "Hotel (5 nights)", "Bus tour", "Activities"],
      duration: "7 days / 6 nights",
      basePrice: "₱28,000",
      gcRevenue: "₱6,000-9,000",
      discount: "Bundle discount 12%"
    },
    {
      package: "Cruise + Land Tour",
      icon: "⛴️",
      includes: ["Cruise (7 days)", "Pre-cruise hotel", "Land tour"],
      duration: "10 days",
      basePrice: "₱120,000",
      gcRevenue: "₱20,000-30,000",
      discount: "Bundle discount 10%"
    }
  ];

  const dataEntities = [
    { entity: "Booking", fields: "ID, ProductType, CustomerData, TotalPrice, Status" },
    { entity: "FlightBooking", fields: "FlightID, Route, Passengers, Cabin, Dates" },
    { entity: "HotelBooking", fields: "HotelID, CheckIn, CheckOut, Rooms, Guests" },
    { entity: "TransportBooking", fields: "VehicleType, Route, Dates, Seats" },
    { entity: "VisaCase", fields: "CaseID, Destination, Status, Documents" },
    { entity: "PaymentSplit", fields: "BookingID, TotalAmount, SupplierCost, MarkupAmount" },
    { entity: "User", fields: "Email, Role, Preferences, Travel History" }
  ];

  const adminDashboard = [
    { metric: "Total Bookings", value: "2,847", trend: "+12% MoM" },
    { metric: "Total Revenue", value: "₱5.2M", trend: "+18% MoM" },
    { metric: "Avg Order Value", value: "₱1,827", trend: "+5% MoM" },
    { metric: "Conversion Rate", value: "3.2%", trend: "+0.5% vs prev" },
    { metric: "Top Product", value: "Hotels", trend: "35% of sales" },
    { metric: "Processing Time", value: "2.4 hrs avg", trend: "-0.5 hrs" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">GC Travel - SUPER OTA SYSTEM</h2>
        <p className="text-slate-600">Complete integrated travel platform with all products (Flights, Hotels, Bus, Ferry, Train, Cruise, Car, Visa)</p>
      </div>

      {/* Main Super Flow */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">10-Stage Super OTA Flow</h3>
        <div className="space-y-3">
          {superFlow.map((stage, idx) => (
            <div key={idx}>
              <div className={`p-4 rounded-lg ${stage.color}`}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{stage.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Stage {idx + 1}: {stage.stage}</p>
                    <p className="text-sm text-slate-600">{stage.description}</p>
                  </div>
                </div>
              </div>
              {idx < superFlow.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Revenue Breakdown */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Revenue Model by Product</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productRevenue.map((product, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{product.product}</CardTitle>
                  </div>
                  <span className="text-3xl">{product.icon}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xs text-slate-600">Revenue Type</p>
                  <p className="text-sm font-semibold text-slate-900">{product.margin}</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-xs text-slate-600">Example Earning</p>
                  <p className="text-sm font-bold text-emerald-700">{product.example}</p>
                </div>
                <div className="p-2 bg-amber-50 rounded">
                  <p className="text-xs text-slate-600">Profit Margin</p>
                  <p className="text-sm font-semibold text-amber-700">{product.profitMargin}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-xs">
                  <p className="text-slate-600 mb-1">Strategy</p>
                  <p className="text-slate-700">{product.strategy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Travel Packages */}
      <Card className="mb-12 bg-gradient-to-r from-pink-50 to-rose-50 border-rose-300">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            🎁 Bundled Travel Packages - Higher Margins
          </CardTitle>
          <p className="text-sm text-rose-800 mt-2">Combining multiple products in one package creates higher profit per transaction</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {travelPackages.map((pkg, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-rose-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{pkg.package}</h4>
                    <p className="text-xs text-slate-600 mt-1">{pkg.duration}</p>
                  </div>
                  <span className="text-2xl">{pkg.icon}</span>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-xs font-semibold text-slate-700">Includes:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {pkg.includes.map((item, i) => (
                      <li key={i}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-rose-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Customer Pays:</span>
                    <span className="font-bold text-slate-900">{pkg.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">GC Revenue:</span>
                    <span className="font-bold text-emerald-700">{pkg.gcRevenue}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Bundle Discount:</span>
                    <span className="text-amber-600 font-semibold">{pkg.discount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Daily Revenue */}
      <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardHeader>
          <CardTitle className="text-green-900">💰 Sample Daily Revenue Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { product: "Flights", bookings: "12", avgRevenue: "₱1,200", daily: "₱14,400" },
              { product: "Hotels", bookings: "8", avgRevenue: "₱2,500", daily: "₱20,000" },
              { product: "Buses/Trains", bookings: "25", avgRevenue: "₱300", daily: "₱7,500" },
              { product: "Cruises", bookings: "2", avgRevenue: "₱10,000", daily: "₱20,000" },
              { product: "Car Rentals", bookings: "4", avgRevenue: "₱800", daily: "₱3,200" },
              { product: "Visa Services", bookings: "5", avgRevenue: "₱8,000", daily: "₱40,000" }
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white rounded border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{item.product}</p>
                    <p className="text-xs text-slate-600">{item.bookings} bookings × {item.avgRevenue}/avg</p>
                  </div>
                  <p className="font-bold text-emerald-700 text-lg">{item.daily}</p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-green-100 rounded border-2 border-green-400 mt-4">
              <div className="flex justify-between items-center">
                <p className="font-bold text-green-900 text-lg">Total Daily Revenue (GC Earnings)</p>
                <p className="font-bold text-green-900 text-2xl">₱105,100</p>
              </div>
              <p className="text-sm text-green-800 mt-2">₱3.15M monthly | ₱37.8M annually</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Dashboard Metrics */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Admin Dashboard - Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminDashboard.map((item, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">{item.metric}</p>
                <p className="text-3xl font-bold text-slate-900 mb-2">{item.value}</p>
                <p className="text-xs text-green-700 font-semibold">{item.trend}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Structure */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Integrated Data Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataEntities.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200">
                <p className="font-bold text-slate-900 text-sm mb-2">{item.entity}</p>
                <p className="text-xs text-slate-600">{item.fields}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
        <CardHeader>
          <CardTitle className="text-indigo-900">🏗️ System Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Frontend Layer</p>
              <p className="text-sm text-slate-600">React app with multi-product search, booking flow, payment gateway, user dashboard</p>
            </div>
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Backend Services</p>
              <p className="text-sm text-slate-600">Base44 SDK for entity management, Deno functions for supplier integration, Stripe/PayMongo for payments</p>
            </div>
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Supplier Integration</p>
              <p className="text-sm text-slate-600">Duffel (Flights), Biyaheko/Wanderlinx (Hotels/Tours), 12Go (Transport), Direct APIs for Cruises/Cars</p>
            </div>
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Admin Dashboard</p>
              <p className="text-sm text-slate-600">Real-time analytics, booking management, commission tracking, settlement reports, visa CRM</p>
            </div>
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Payment Processing</p>
              <p className="text-sm text-slate-600">Stripe (cards), PayMongo (local), Bank Transfer, Cash on Delivery options</p>
            </div>
            <div className="p-4 bg-white rounded border border-indigo-200">
              <p className="font-bold text-slate-900 mb-2">Revenue Recognition</p>
              <p className="text-sm text-slate-600">PaymentSplit entity tracks all earnings, commissions, markups per booking type</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Advantages */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900">🎯 GC Travel Super OTA - Key Advantages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "🌍", title: "One-Stop Shop", desc: "All travel needs in single platform" },
              { icon: "💰", title: "Multiple Revenue Streams", desc: "6+ product lines, each with profit" },
              { icon: "📦", title: "Bundled Packages", desc: "Higher value = higher margins" },
              { icon: "⚡", title: "Fast Implementation", desc: "Leverage existing integrations" },
              { icon: "📊", title: "Real-time Analytics", desc: "Track revenue by product/country" },
              { icon: "🔐", title: "Secure Transactions", desc: "PCI-compliant Stripe/PayMongo" },
              { icon: "🚀", title: "Scalability", desc: "Handle 1000+ daily bookings" },
              { icon: "👥", title: "Customer Loyalty", desc: "Multi-product users = repeat buyers" }
            ].map((advantage, i) => (
              <div key={i} className="p-4 bg-white rounded border border-amber-200">
                <p className="text-2xl mb-2">{advantage.icon}</p>
                <p className="font-bold text-slate-900 text-sm">{advantage.title}</p>
                <p className="text-xs text-slate-600 mt-1">{advantage.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
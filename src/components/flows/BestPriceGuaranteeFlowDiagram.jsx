import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, Shield, Zap, Filter, Star, AlertCircle, CheckCircle2, ArrowRight, BarChart3, Lock } from "lucide-react";

export default function BestPriceGuaranteeFlowDiagram() {
  const mainFlowStages = [
    {
      stage: 1,
      title: "Customer Enters Booking",
      icon: "🌐",
      color: "bg-blue-50 border-l-4 border-blue-500",
      description: "User opens website or mobile app"
    },
    {
      stage: 2,
      title: "Prompt & Encouragement",
      icon: "💬",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      description: "System displays: 'Find the best deal for your flight/hotel/car rental'"
    },
    {
      stage: 3,
      title: "Customer Search Input",
      icon: "🔍",
      color: "bg-purple-50 border-l-4 border-purple-500",
      inputs: [
        "Origin & Destination (e.g., Manila → London)",
        "Departure & Return dates",
        "Passenger count / Room count / Car type",
        "Trip type (One-way / Roundtrip)",
        "Cabin class (Economy / Business / First)"
      ]
    },
    {
      stage: 4,
      title: "Multi-Supplier Search",
      icon: "⚡",
      color: "bg-amber-50 border-l-4 border-amber-500",
      process: [
        "System queries multiple suppliers in parallel",
        "Amadeus, Duffel, Biyaheko, Wanderlinx, Tripzynx APIs",
        "Aggregates real-time pricing data",
        "Filters out unavailable options",
        "Calculates markup & final price"
      ]
    },
    {
      stage: 5,
      title: "Display Aggregated Deals",
      icon: "📊",
      color: "bg-green-50 border-l-4 border-green-500",
      features: [
        "Scrollable grid/list of deals",
        "Each card shows: Price, Supplier, Rating, Duration",
        "'Best Price Guarantee' badge for cheapest option",
        "Sort by price, rating, duration, or supplier",
        "Filter by amenities, airline, baggage, etc."
      ]
    },
    {
      stage: 6,
      title: "Customer Selects Deal",
      icon: "✅",
      color: "bg-indigo-50 border-l-4 border-indigo-500",
      actions: [
        "Clicks on deal card",
        "Pop-up shows full details (terms, policies, comparison)",
        "Reviews refund/cancellation policy",
        "Sees competitor prices for transparency",
        "Confirms selection"
      ]
    },
    {
      stage: 7,
      title: "Price Locked & Guarantee",
      icon: "🔒",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      guarantee: [
        "System locks in best price immediately",
        "Customer sees confirmation message",
        "'You've booked the best price! Guaranteed.'",
        "Booking reference generated",
        "Email sent with booking details & guarantee terms"
      ]
    },
    {
      stage: 8,
      title: "Post-Booking Benefits",
      icon: "🎁",
      color: "bg-rose-50 border-l-4 border-rose-500",
      benefits: [
        "Price drop alerts enabled automatically",
        "If price drops within 24 hours, customer notified",
        "Option to rebook at lower price",
        "Loyalty points earned",
        "Travel insurance recommendation"
      ]
    }
  ];

  const sampleDeals = [
    {
      id: 1,
      supplier: "Philippine Airlines",
      price: 45000,
      originalPrice: 52000,
      rating: 4.3,
      reviews: 1247,
      duration: "22h 15m",
      departure: "10:30 AM",
      arrival: "8:45 AM+1",
      seats: 6,
      baggage: "2x 23kg",
      mealIncluded: true,
      seatSelection: true,
      isPriceGuaranteed: true,
      stops: 1,
      cabin: "Economy",
      color: "from-blue-100 to-blue-200",
      borderColor: "border-l-4 border-blue-500"
    },
    {
      id: 2,
      supplier: "Singapore Airlines",
      price: 48000,
      originalPrice: 55000,
      rating: 4.8,
      reviews: 3456,
      duration: "18h 30m",
      departure: "2:15 PM",
      arrival: "12:30 AM+1",
      seats: 3,
      baggage: "2x 23kg",
      mealIncluded: true,
      seatSelection: true,
      isPriceGuaranteed: false,
      stops: 0,
      cabin: "Economy",
      color: "from-gray-100 to-gray-200",
      borderColor: "border-l-4 border-gray-500"
    },
    {
      id: 3,
      supplier: "Qatar Airways",
      price: 52000,
      originalPrice: 60000,
      rating: 4.7,
      reviews: 4123,
      duration: "20h 45m",
      departure: "6:00 PM",
      arrival: "4:15 AM+1",
      seats: 8,
      baggage: "2x 23kg",
      mealIncluded: true,
      seatSelection: true,
      isPriceGuaranteed: false,
      stops: 1,
      cabin: "Economy",
      color: "from-purple-100 to-purple-200",
      borderColor: "border-l-4 border-purple-500"
    },
    {
      id: 4,
      supplier: "AirAsia",
      price: 38000,
      originalPrice: 45000,
      rating: 4.1,
      reviews: 5234,
      duration: "25h 00m",
      departure: "11:45 PM",
      arrival: "11:00 AM+1",
      seats: 15,
      baggage: "1x 20kg",
      mealIncluded: false,
      seatSelection: false,
      isPriceGuaranteed: false,
      stops: 2,
      cabin: "Economy",
      color: "from-red-100 to-red-200",
      borderColor: "border-l-4 border-red-500"
    }
  ];

  const filterOptions = [
    {
      category: "Price Range",
      options: ["Under ₱40,000", "₱40,000 - ₱50,000", "₱50,000 - ₱60,000", "Over ₱60,000"]
    },
    {
      category: "Flight Duration",
      options: ["Under 18 hours", "18-22 hours", "22-26 hours", "Over 26 hours"]
    },
    {
      category: "Number of Stops",
      options: ["Non-stop", "1 Stop", "2+ Stops"]
    },
    {
      category: "Airline",
      options: ["Philippine Airlines", "Singapore Airlines", "Qatar Airways", "AirAsia"]
    },
    {
      category: "Amenities",
      options: ["Meal Included", "Seat Selection", "Extra Baggage", "Lounge Access"]
    },
    {
      category: "Rating",
      options: ["4.5+", "4.0+", "3.5+", "All"]
    }
  ];

  const sortOptions = [
    { label: "Price: Low to High", value: "price_asc", icon: "💰" },
    { label: "Price: High to Low", value: "price_desc", icon: "💸" },
    { label: "Rating: High to Low", value: "rating_desc", icon: "⭐" },
    { label: "Duration: Short to Long", value: "duration_asc", icon: "⏱️" },
    { label: "Departure: Early to Late", value: "departure_asc", icon: "🌅" },
    { label: "Best Value (Price + Rating)", value: "best_value", icon: "🏆" }
  ];

  const priceComparison = [
    { supplier: "AirAsia", price: 38000, percentage: 0, label: "Cheapest ✓" },
    { supplier: "Philippine Airlines", price: 45000, percentage: 18, label: "Best Review" },
    { supplier: "Singapore Airlines", price: 48000, percentage: 26, label: "Direct" },
    { supplier: "Qatar Airways", price: 52000, percentage: 37, label: "Luxury" },
    { supplier: "Booking.com", price: 55000, percentage: 45, label: "Third-party" }
  ];

  const dealCardFeatures = [
    {
      component: "Price Display",
      description: "Large, bold price with original price crossed out",
      includes: ["Current price (₱45,000)", "Original price (₱52,000)", "Savings amount (₱7,000)"]
    },
    {
      component: "Supplier Info",
      description: "Airline/hotel name with logo",
      includes: ["Airline logo", "Supplier name", "Cabin class badge"]
    },
    {
      component: "Rating & Reviews",
      description: "Star rating and review count",
      includes: ["Star rating (4.3/5)", "Review count (1,247 reviews)", "Sentiment indicator"]
    },
    {
      component: "Key Details",
      description: "Essential flight information",
      includes: ["Duration (22h 15m)", "Stops (1 stop)", "Baggage (2x 23kg)", "Meals included"]
    },
    {
      component: "Guarantee Badge",
      description: "Highlight best price guarantee",
      includes: ["'Best Price Guarantee' badge", "Lock icon", "Guarantee terms link"]
    },
    {
      component: "CTA Button",
      description: "Call-to-action for booking",
      includes: ["'Select Deal' button", "Hover effect", "Click tracking"]
    }
  ];

  const optionalFeatures = [
    {
      feature: "Price Drop Alerts",
      description: "Notify customer if price drops after booking",
      benefit: "Allow rebooking at lower price, increase customer satisfaction",
      implementation: "Email/push notification within 24 hours"
    },
    {
      feature: "Multi-Deal Comparison",
      description: "Side-by-side comparison of selected deals",
      benefit: "Help customers make informed decisions quickly",
      implementation: "Carousel slider showing 2-3 deals at once"
    },
    {
      feature: "Competitor Price Display",
      description: "Show prices from other booking sites",
      benefit: "Transparency builds trust, justifies price guarantee",
      implementation: "Small cards showing Booking.com, Kayak, etc. prices"
    },
    {
      feature: "Dynamic Sorting",
      description: "Re-sort deals on-the-fly",
      benefit: "Users find best deal matching their priorities",
      implementation: "Dropdown with sort options"
    },
    {
      feature: "Price Chart",
      description: "Graph showing price history & trends",
      benefit: "Users see if prices are rising or falling",
      implementation: "Line chart showing last 30 days of prices"
    },
    {
      feature: "Personalized Recommendations",
      description: "AI suggests best deal based on preferences",
      benefit: "Reduce decision paralysis, faster bookings",
      implementation: "'Recommended for you' section"
    },
    {
      feature: "Flexible Date Calendar",
      description: "Show prices for surrounding dates",
      benefit: "Users can shift dates for cheaper flights",
      implementation: "Calendar heatmap with prices"
    },
    {
      feature: "Loyalty Integration",
      description: "Show points/miles earned per deal",
      benefit: "Encourage bookings with frequent flyer programs",
      implementation: "Badge showing '8,500 miles' per deal"
    }
  ];

  const guaranteeTerms = [
    {
      term: "Best Price Lock",
      description: "Price locked immediately upon booking",
      period: "24 hours"
    },
    {
      term: "Price Drop Refund",
      description: "If price drops, customer gets refund for difference",
      period: "24-72 hours after booking"
    },
    {
      term: "Competitor Price Match",
      description: "Will match any lower price found elsewhere",
      period: "Before 24 hours",
      conditions: "Same flight, date, cabin class"
    },
    {
      term: "Satisfaction Guarantee",
      description: "Full refund if customer not satisfied",
      period: "Before cancellation deadline",
      conditions: "Refundable rate only"
    }
  ];

  const userJourney = [
    {
      step: 1,
      action: "User lands on flight search page",
      detail: "Sees headline: 'Find & lock the best price now'"
    },
    {
      step: 2,
      action: "Enters search criteria",
      detail: "Manila → London, 1-15 April, 1 passenger, Economy"
    },
    {
      step: 3,
      action: "System loads results",
      detail: "Displays 4-6 best deals from different airlines (5-10 sec loading)"
    },
    {
      step: 4,
      action: "User sees deal cards",
      detail: "AirAsia ₱38k (cheapest), PAL ₱45k (best reviews), SQ ₱48k (direct)"
    },
    {
      step: 5,
      action: "User hovers/clicks Philippine Airlines card",
      detail: "Pop-up shows full details, refund policy, competitor comparison"
    },
    {
      step: 6,
      action: "User clicks 'Select Deal'",
      detail: "Proceeds to passenger details, payment, confirmation"
    },
    {
      step: 7,
      action: "Booking confirmed",
      detail: "Sees 'Best Price Guaranteed ✓' message, receives confirmation email"
    },
    {
      step: 8,
      action: "Price drop monitoring begins",
      detail: "System checks for price drops every 6 hours for next 24 hours"
    }
  ];

  const implementationPhases = [
    {
      phase: "Phase 1 (Week 1-2)",
      tasks: [
        "Design deal card UI",
        "Create deal listing component",
        "Integrate multi-supplier search API",
        "Build price aggregation logic"
      ]
    },
    {
      phase: "Phase 2 (Week 2-3)",
      tasks: [
        "Implement filter & sort options",
        "Add deal detail pop-up",
        "Create price comparison view",
        "Build guarantee badge system"
      ]
    },
    {
      phase: "Phase 3 (Week 3-4)",
      tasks: [
        "Implement price drop monitoring",
        "Set up price alert notifications",
        "Create rebooking system",
        "Add analytics & tracking"
      ]
    },
    {
      phase: "Phase 4 (Week 4+)",
      tasks: [
        "AI personalized recommendations",
        "Price history charts",
        "Flexible date calendar",
        "Advanced comparison tools"
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Best Price Guarantee Selection Flow</h2>
        <p className="text-slate-600">Complete experience for comparing deals and locking in the best price</p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="flow">Main Flow</TabsTrigger>
          <TabsTrigger value="deals">Sample Deals</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="ui">UI Components</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Main Flow */}
        <TabsContent value="flow" className="space-y-4">
          {mainFlowStages.map((item, idx) => (
            <div key={idx}>
              <Card className={item.color}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-lg">
                        Stage {item.stage}: {item.title}
                      </p>
                      <p className="text-sm text-slate-700 mt-1">{item.description}</p>
                      {item.inputs && (
                        <ul className="mt-3 space-y-1">
                          {item.inputs.map((input, i) => (
                            <li key={i} className="text-sm text-slate-700">• {input}</li>
                          ))}
                        </ul>
                      )}
                      {item.process && (
                        <ul className="mt-3 space-y-1">
                          {item.process.map((proc, i) => (
                            <li key={i} className="text-sm text-slate-700">• {proc}</li>
                          ))}
                        </ul>
                      )}
                      {item.features && (
                        <ul className="mt-3 space-y-1">
                          {item.features.map((feature, i) => (
                            <li key={i} className="text-sm text-slate-700">• {feature}</li>
                          ))}
                        </ul>
                      )}
                      {item.actions && (
                        <ul className="mt-3 space-y-1">
                          {item.actions.map((action, i) => (
                            <li key={i} className="text-sm text-slate-700">• {action}</li>
                          ))}
                        </ul>
                      )}
                      {item.guarantee && (
                        <ul className="mt-3 space-y-1">
                          {item.guarantee.map((guar, i) => (
                            <li key={i} className="text-sm text-slate-700">• {guar}</li>
                          ))}
                        </ul>
                      )}
                      {item.benefits && (
                        <ul className="mt-3 space-y-1">
                          {item.benefits.map((benefit, i) => (
                            <li key={i} className="text-sm text-slate-700">• {benefit}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {idx < mainFlowStages.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        {/* Sample Deals */}
        <TabsContent value="deals">
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Sample Deal Cards: Manila → London (1-15 April)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleDeals.map((deal) => (
                  <div key={deal.id} className={`bg-gradient-to-r ${deal.color} ${deal.borderColor} p-4 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900">{deal.supplier}</p>
                          {deal.isPriceGuaranteed && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Best Price
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{deal.cabin} • {deal.stops === 0 ? 'Non-stop' : `${deal.stops} stop(s)`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">₱{deal.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-600 line-through">₱{deal.originalPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-slate-600">Departure</p>
                        <p className="text-sm font-semibold text-slate-900">{deal.departure}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Arrival</p>
                        <p className="text-sm font-semibold text-slate-900">{deal.arrival}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Duration</p>
                        <p className="text-sm font-semibold text-slate-900">{deal.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Seats Left</p>
                        <p className="text-sm font-semibold text-slate-900">{deal.seats}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">⭐ {deal.rating}/5 ({deal.reviews.toLocaleString()})</span>
                      <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">{deal.baggage}</span>
                      {deal.mealIncluded && <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">🍽️ Meal</span>}
                      {deal.seatSelection && <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">🪑 Seat Select</span>}
                    </div>

                    <button className="w-full bg-white text-slate-900 font-semibold py-2 rounded hover:bg-slate-50 transition-colors">
                      Select Deal →
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filters */}
        <TabsContent value="filters">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Sort Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Categories */}
              <div>
                <p className="font-bold text-slate-900 mb-3">Available Filters</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {filterOptions.map((filter, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-purple-200">
                      <p className="font-semibold text-slate-900 mb-2 text-sm">{filter.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {filter.options.map((option, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3 h-3" />
                            <span className="text-xs text-slate-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <p className="font-bold text-slate-900 mb-3">Sort Deals By</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortOptions.map((sort, idx) => (
                    <button
                      key={idx}
                      className="p-3 bg-white rounded border border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                    >
                      <p className="text-lg mb-1">{sort.icon}</p>
                      <p className="text-sm font-semibold text-slate-900">{sort.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Comparison */}
        <TabsContent value="comparison">
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-900">Price Comparison: Your Deal vs Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priceComparison.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.supplier}</p>
                        <p className="text-xs text-slate-600">{item.label}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">₱{item.price.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={item.percentage === 0 ? "bg-green-500" : "bg-blue-500"}
                        style={{ width: `${Math.min(item.percentage + 20, 100)}%` }}
                      />
                    </div>
                    {item.percentage > 0 && (
                      <p className="text-xs text-slate-600 mt-1">+₱{(item.price - priceComparison[0].price).toLocaleString()} ({item.percentage}% more)</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
            <CardHeader>
              <CardTitle className="text-emerald-900">Best Price Guarantee Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {guaranteeTerms.map((term, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-emerald-200">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">{term.term}</p>
                        <p className="text-sm text-slate-600 mt-1">{term.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-emerald-50 rounded">
                      <p className="text-xs text-emerald-900">
                        <span className="font-semibold">Period:</span> {term.period}
                      </p>
                      {term.conditions && (
                        <p className="text-xs text-emerald-900">
                          <span className="font-semibold">Conditions:</span> {term.conditions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Components */}
        <TabsContent value="ui">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Deal Card UI Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealCardFeatures.map((ui, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-amber-200">
                    <p className="font-bold text-slate-900 mb-1">{ui.component}</p>
                    <p className="text-sm text-slate-600 mb-2">{ui.description}</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {ui.includes.map((item, i) => (
                        <li key={i}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journey */}
        <TabsContent value="journey">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="text-green-900">Sample User Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userJourney.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-green-200">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <p className="text-lg font-bold text-green-600 w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                          {item.step}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.action}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
            <CardHeader>
              <CardTitle className="text-indigo-900">Optional Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {optionalFeatures.map((feature, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-indigo-200">
                    <p className="font-bold text-slate-900 mb-2">{feature.feature}</p>
                    <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                    <p className="text-xs text-indigo-700 font-semibold mb-1">✨ {feature.benefit}</p>
                    <p className="text-xs text-slate-500">🔧 {feature.implementation}</p>
                  </div>
                ))}
              </div>

              <Card className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300">
                <CardHeader>
                  <CardTitle className="text-violet-900 text-base">Implementation Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {implementationPhases.map((phase, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border border-violet-200">
                        <p className="font-bold text-slate-900 mb-2">{phase.phase}</p>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {phase.tasks.map((task, i) => (
                            <li key={i}>✓ {task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Benefits */}
      <Card className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Why Best Price Guarantee Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                benefit: "Builds Trust",
                description: "Customers feel confident booking with you, knowing prices are protected"
              },
              {
                benefit: "Increases Conversion",
                description: "Removes hesitation, reduces price comparison shopping elsewhere"
              },
              {
                benefit: "Reduces Cart Abandonment",
                description: "Guarantee provides reassurance, improves completion rate"
              },
              {
                benefit: "Competitive Advantage",
                description: "Differentiates from competitors, attracts price-conscious customers"
              },
              {
                benefit: "Real-time Data",
                description: "Multi-supplier aggregation shows actual available deals"
              },
              {
                benefit: "Customer Loyalty",
                description: "After booking, price drop alerts create ongoing engagement"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-rose-200">
                <p className="font-bold text-slate-900 mb-1">{item.benefit}</p>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Tips */}
      <Card className="mt-8 bg-gradient-to-r from-slate-50 to-gray-100 border-slate-300">
        <CardHeader>
          <CardTitle className="text-slate-900">Implementation Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Ensure real-time data sync with all supplier APIs (update every 15-30 seconds)",
              "Clearly display terms & conditions of guarantee (refundable only, within 24h, etc.)",
              "Add prominent 'Best Price Guarantee' badge to build confidence",
              "Implement automated price monitoring system for alerts",
              "Show competitor prices for full transparency",
              "Track metrics: conversion rate, average time on results page, guarantee claims",
              "Test with sample deals to ensure system reliability before launch",
              "Monitor API response times to ensure fast loading (target: <2 seconds)"
            ].map((tip, idx) => (
              <div key={idx} className="p-3 bg-white rounded border border-slate-200 flex gap-3">
                <span className="text-lg flex-shrink-0">✓</span>
                <p className="text-sm text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Search, Star, MapPin, Users, Filter, Grid3x3, List, CheckCircle2, ArrowRight, Globe, Award } from "lucide-react";

export default function InteractiveAirlineSelectionFlowDiagram() {
  const [selectedView, setSelectedView] = useState("grid");

  const mainFlowStages = [
    {
      stage: 1,
      title: "Customer Initiates Booking",
      icon: "🛫",
      color: "bg-blue-50 border-l-4 border-blue-500",
      description: "Customer opens flight booking page/app"
    },
    {
      stage: 2,
      title: "Airline Selection Prompt",
      icon: "✈️",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      description: "System displays: 'Choose your preferred airline' or 'Select airline to compare prices'"
    },
    {
      stage: 3,
      title: "Display Airline List",
      icon: "📋",
      color: "bg-purple-50 border-l-4 border-purple-500",
      features: [
        "Scrollable grid/carousel view",
        "Each card shows: Logo, Name, Alliance, Rating",
        "Search & filter options available"
      ]
    },
    {
      stage: 4,
      title: "Customer Searches/Filters",
      icon: "🔍",
      color: "bg-amber-50 border-l-4 border-amber-500",
      options: [
        "Search by airline name",
        "Filter by region/alliance (Star, SkyTeam, OneWorld)",
        "Filter by rating/reviews",
        "Sort by price or passenger rating"
      ]
    },
    {
      stage: 5,
      title: "Customer Selects Airline",
      icon: "✅",
      color: "bg-green-50 border-l-4 border-green-500",
      actions: [
        "Clicks on airline card",
        "Card highlights with border/background change",
        "Checkmark appears on selected card",
        "Optional pop-up with airline details"
      ]
    },
    {
      stage: 6,
      title: "Display Airline Details (Optional)",
      icon: "ℹ️",
      color: "bg-indigo-50 border-l-4 border-indigo-500",
      details: [
        "Airline history & reputation",
        "Fleet details & aircraft types",
        "Baggage policy",
        "Seat comfort rating",
        "Average passenger rating"
      ]
    },
    {
      stage: 7,
      title: "Show Available Flights",
      icon: "📅",
      color: "bg-rose-50 border-l-4 border-rose-500",
      description: "Display all flights for selected airline on chosen date with filters for time, price, cabin class"
    },
    {
      stage: 8,
      title: "Flight Selection & Booking",
      icon: "🎫",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        "Customer selects specific flight",
        "Chooses cabin class (Economy, Premium Economy, Business)",
        "Adds passengers & preferences",
        "Proceeds to payment"
      ]
    }
  ];

  const majorAirlines = [
    {
      name: "Philippine Airlines (PAL)",
      logo: "✈️",
      alliance: "Star Alliance",
      region: "Southeast Asia",
      rating: 4.3,
      reviews: 1247,
      destinations: "50+",
      popularRoutes: "Manila-US, Intra-Asia",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Cebu Pacific Air",
      logo: "✈️",
      alliance: "Independent",
      region: "Southeast Asia",
      rating: 4.5,
      reviews: 2156,
      destinations: "80+",
      popularRoutes: "Domestic, Regional",
      color: "from-yellow-400 to-orange-500"
    },
    {
      name: "Singapore Airlines",
      logo: "✈️",
      alliance: "Star Alliance",
      region: "Southeast Asia",
      rating: 4.8,
      reviews: 3456,
      destinations: "130+",
      popularRoutes: "Long-haul International",
      color: "from-slate-600 to-slate-800"
    },
    {
      name: "Cathay Pacific",
      logo: "✈️",
      alliance: "OneWorld",
      region: "East Asia",
      rating: 4.6,
      reviews: 2890,
      destinations: "200+",
      popularRoutes: "Asia-Pacific Hub",
      color: "from-red-500 to-red-700"
    },
    {
      name: "Thai Airways",
      logo: "✈️",
      alliance: "Star Alliance",
      region: "Southeast Asia",
      rating: 4.4,
      reviews: 1645,
      destinations: "75+",
      popularRoutes: "Bangkok Hub",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      name: "Qatar Airways",
      logo: "✈️",
      alliance: "OneWorld",
      region: "Middle East",
      rating: 4.7,
      reviews: 4123,
      destinations: "170+",
      popularRoutes: "Global Network",
      color: "from-purple-600 to-purple-800"
    },
    {
      name: "Emirates",
      logo: "✈️",
      alliance: "Independent",
      region: "Middle East",
      rating: 4.6,
      reviews: 3678,
      destinations: "160+",
      popularRoutes: "Dubai Hub",
      color: "from-red-600 to-gray-800"
    },
    {
      name: "AirAsia",
      logo: "✈️",
      alliance: "Independent",
      region: "Southeast Asia",
      rating: 4.1,
      reviews: 5234,
      destinations: "150+",
      popularRoutes: "Budget, Regional",
      color: "from-red-500 to-red-600"
    }
  ];

  const filterOptions = [
    {
      category: "Alliance",
      options: ["Star Alliance", "SkyTeam", "OneWorld", "Independent", "Regional"]
    },
    {
      category: "Region",
      options: ["Southeast Asia", "East Asia", "Middle East", "South Asia", "Americas"]
    },
    {
      category: "Rating",
      options: ["4.5+ ⭐⭐⭐⭐⭐", "4.0+ ⭐⭐⭐⭐", "3.5+ ⭐⭐⭐", "All"]
    },
    {
      category: "Price Range",
      options: ["Budget", "Standard", "Premium", "Luxury"]
    }
  ];

  const uiElements = [
    {
      component: "Airline Card",
      description: "Grid item showing airline info",
      includes: ["Logo (150x100px)", "Name & Alliance", "Rating (e.g., 4.5/5)", "Review count", "Hover effect", "Selection highlight"],
      interaction: "Click to select, hover for preview"
    },
    {
      component: "Search Bar",
      description: "Text input to search airline names",
      includes: ["Placeholder text: 'Search by airline'", "Real-time filtering", "Clear button (X)", "Search icon"],
      interaction: "Type to filter, see results instantly"
    },
    {
      component: "Filter Dropdown",
      description: "Multi-select filters",
      includes: ["Alliance filter", "Region filter", "Rating filter", "Price range filter"],
      interaction: "Select multiple filters, results update"
    },
    {
      component: "View Toggle",
      description: "Switch between Grid & List views",
      includes: ["Grid icon (3x3)", "List icon (≡)", "Active state indicator"],
      interaction: "Click to toggle view mode"
    },
    {
      component: "Detail Pop-up",
      description: "Modal showing airline details",
      includes: ["Close button (X)", "Airline info", "Fleet details", "Policies", "Ratings"],
      interaction: "Click airline → pop-up opens, click close → closes"
    },
    {
      component: "Flight Results",
      description: "Flights for selected airline",
      includes: ["Flight time", "Price", "Duration", "Cabin class options"],
      interaction: "Click flight to select & continue"
    }
  ];

  const interactionFlow = [
    {
      step: 1,
      action: "User sees airline grid/list",
      result: "8-12 major airlines displayed with logos & ratings"
    },
    {
      step: 2,
      action: "User searches 'Philippine' or filters by region",
      result: "List narrows to matching airlines (PAL visible)"
    },
    {
      step: 3,
      action: "User hovers over airline card",
      result: "Card highlights, shows tooltip with extra info"
    },
    {
      step: 4,
      action: "User clicks on PAL card",
      result: "Card selected (border/shadow change), optional pop-up shows"
    },
    {
      step: 5,
      action: "User confirms selection or closes pop-up",
      result: "System proceeds to show available flights for PAL"
    },
    {
      step: 6,
      action: "User sees flight list filtered by PAL",
      result: "All PAL flights on selected date, sorted by time/price"
    },
    {
      step: 7,
      action: "User clicks on flight, enters passenger details",
      result: "Proceeds to payment & booking confirmation"
    }
  ];

  const optionalFeatures = [
    {
      feature: "Multiple Airline Selection",
      description: "Allow users to select multiple airlines for side-by-side comparison",
      benefit: "Users can compare prices, times, ratings across airlines",
      implementation: "Checkbox on airline cards, comparison view"
    },
    {
      feature: "Sort Options",
      description: "Sort airlines by price, rating, or flight duration",
      benefit: "Users find best deals or most reliable airlines quickly",
      implementation: "Sort dropdown (Price/Rating/Duration)"
    },
    {
      feature: "Favorite Airlines",
      description: "Save preferred airlines for returning users",
      benefit: "Faster booking, personalized experience",
      implementation: "Heart icon on cards, stored in user profile"
    },
    {
      feature: "Recent Airlines",
      description: "Show airlines user booked recently",
      benefit: "Quick access to preferred carriers",
      implementation: "Section at top showing 'Recently Booked'"
    },
    {
      feature: "Real-time Seat Availability",
      description: "Show available seat count per flight",
      benefit: "Urgency indicator, helps users decide quickly",
      implementation: "Badge showing 'Only 5 seats left'"
    },
    {
      feature: "Dynamic Pricing",
      description: "Show price changes in real-time",
      benefit: "Transparency, urgency, encourages faster booking",
      implementation: "Price with 'Price just dropped!' label"
    },
    {
      feature: "Alliance Badges",
      description: "Highlight frequent flyer program benefits",
      benefit: "Show mile/point earning opportunities",
      implementation: "Alliance logo & link to earn miles"
    },
    {
      feature: "AI Recommendations",
      description: "Suggest airlines based on user history",
      benefit: "Personalized recommendations",
      implementation: "'Based on your preferences' section"
    }
  ];

  const userJourney = [
    {
      page: "Flight Search",
      action: "User enters route (Manila → London)",
      status: "Redirected to airline selection"
    },
    {
      page: "Airline Selection",
      action: "User sees all airlines & filters by 'Star Alliance'",
      status: "Sees PAL, Singapore Airlines, Thai Airways"
    },
    {
      page: "Airline Detail",
      action: "User clicks on PAL, sees fleet & seat comfort rating",
      status: "Confirms selection"
    },
    {
      page: "Flight Results",
      action: "System shows all PAL flights for Manila-London",
      status: "User sees time, price, duration"
    },
    {
      page: "Flight Selection",
      action: "User clicks on 10:30 AM flight, chooses Business",
      status: "Proceeds to passenger details"
    },
    {
      page: "Passenger Details",
      action: "User enters name, passport, contact info",
      status: "Validates information"
    },
    {
      page: "Add-ons",
      action: "User adds luggage, seat upgrade, travel insurance",
      status: "Calculates total price"
    },
    {
      page: "Payment",
      action: "User pays via credit card or e-wallet",
      status: "Payment processed"
    },
    {
      page: "Confirmation",
      action: "User sees booking reference & receives email",
      status: "Booking complete, ticket ready"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Interactive Airline Selection Flow</h2>
        <p className="text-slate-600">Complete user experience for selecting airline and booking flights</p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="flow">Main Flow</TabsTrigger>
          <TabsTrigger value="airlines">Airlines</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="ui">UI Elements</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
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
                      {item.features && (
                        <ul className="mt-3 space-y-1">
                          {item.features.map((feature, i) => (
                            <li key={i} className="text-sm text-slate-700">• {feature}</li>
                          ))}
                        </ul>
                      )}
                      {item.options && (
                        <ul className="mt-3 space-y-1">
                          {item.options.map((option, i) => (
                            <li key={i} className="text-sm text-slate-700">• {option}</li>
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
                      {item.details && (
                        <ul className="mt-3 space-y-1">
                          {item.details.map((detail, i) => (
                            <li key={i} className="text-sm text-slate-700">• {detail}</li>
                          ))}
                        </ul>
                      )}
                      {item.steps && (
                        <ul className="mt-3 space-y-1">
                          {item.steps.map((step, i) => (
                            <li key={i} className="text-sm text-slate-700">• {step}</li>
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

        {/* Airlines */}
        <TabsContent value="airlines">
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Major Airlines Available (8+ Major Carriers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {majorAirlines.map((airline, idx) => (
                  <div key={idx} className={`p-4 bg-gradient-to-br ${airline.color} rounded-lg text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}>
                    <p className="text-4xl mb-2">{airline.logo}</p>
                    <p className="font-bold text-sm mb-1 truncate">{airline.name}</p>
                    <p className="text-xs opacity-90 mb-2">{airline.alliance}</p>
                    <div className="space-y-1 text-xs">
                      <p>⭐ {airline.rating}/5 ({airline.reviews})</p>
                      <p>🌍 {airline.destinations} destinations</p>
                      <p className="opacity-75">{airline.region}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <Card className="bg-white border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Budget Airlines</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    AirAsia, Cebu Pacific, Lion Air, Scoot — Lower prices, basic amenities
                  </CardContent>
                </Card>
                <Card className="bg-white border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Full-Service Airlines</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    PAL, Singapore Airlines, Cathay Pacific — Premium comfort, loyalty programs
                  </CardContent>
                </Card>
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
                Filter & Search Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterOptions.map((filter, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-purple-200">
                    <p className="font-bold text-slate-900 mb-2">{filter.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {filter.options.map((option, i) => (
                        <button
                          key={i}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-white rounded border border-purple-200">
                  <p className="font-bold text-slate-900 mb-3">Search by Airline Name</p>
                  <div className="flex items-center gap-2 p-2 border border-slate-300 rounded">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g., 'Philippine Airlines', 'Qatar', 'Singapore'"
                      className="flex-1 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white rounded border border-purple-200">
                  <p className="font-bold text-slate-900 mb-3">Sort By</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sort" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Lowest Price</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sort" className="w-4 h-4" />
                      <span className="text-sm">Highest Rating</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sort" className="w-4 h-4" />
                      <span className="text-sm">Shortest Flight Duration</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Elements */}
        <TabsContent value="ui">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">UI Components & Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uiElements.map((ui, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900">{ui.component}</p>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{ui.description}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2"><span className="font-semibold">Includes:</span> {ui.includes.join(", ")}</p>
                    <p className="text-sm text-slate-600"><span className="font-semibold">Interaction:</span> {ui.interaction}</p>
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
              <CardTitle className="text-green-900">Complete User Journey: Manila → London</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userJourney.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900">{idx + 1}. {item.page}</p>
                        <p className="text-sm text-slate-700 mt-1">{item.action}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                        {item.status}
                      </span>
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
              <CardTitle className="text-indigo-900">Optional Features & Enhancements</CardTitle>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sample Interaction */}
      <Card className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300">
        <CardHeader>
          <CardTitle className="text-rose-900">Sample Interaction Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interactionFlow.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded border border-rose-200 flex gap-3">
                <span className="font-bold text-rose-700 flex-shrink-0 text-lg">{item.step}.</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-semibold">{item.action}</p>
                  <p className="text-xs text-slate-600 mt-1">→ {item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UI/UX Principles */}
      <Card className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
        <CardHeader>
          <CardTitle className="text-slate-900">UI/UX Design Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                principle: "Responsive Design",
                description: "Works seamlessly on mobile, tablet, desktop",
                implementation: "Grid layout adapts to screen size"
              },
              {
                principle: "Clear Visual Hierarchy",
                description: "Important info (airline name, rating) prominent",
                implementation: "Large logos, bold font, color contrast"
              },
              {
                principle: "Quick Search & Filter",
                description: "Users find preferred airline in seconds",
                implementation: "Real-time search, instant filter updates"
              },
              {
                principle: "Visual Feedback",
                description: "User knows what action they took",
                implementation: "Selection highlight, hover effects, animations"
              },
              {
                principle: "Smooth Transitions",
                description: "Elegant animations between states",
                implementation: "Fade-in cards, slide transitions, loading spinners"
              },
              {
                principle: "Accessibility",
                description: "Color-blind friendly, keyboard navigation",
                implementation: "High contrast, ARIA labels, keyboard support"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">{item.principle}</p>
                <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                <p className="text-xs text-slate-500">✓ {item.implementation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Roadmap */}
      <Card className="mt-8 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300">
        <CardHeader>
          <CardTitle className="text-violet-900">Implementation Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { phase: "Phase 1 (Week 1-2)", tasks: ["Design airline cards UI", "Fetch airline data from API", "Build grid/list layout"] },
              { phase: "Phase 2 (Week 2-3)", tasks: ["Implement search functionality", "Add filter logic", "Build selection system"] },
              { phase: "Phase 3 (Week 3-4)", tasks: ["Create airline detail pop-up", "Integrate flight search", "Add sort options"] },
              { phase: "Phase 4 (Week 4+)", tasks: ["Favorites system", "Recent airlines", "AI recommendations", "Real-time availability"] }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-violet-200">
                <p className="font-bold text-slate-900 mb-2">{item.phase}</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {item.tasks.map((task, i) => (
                    <li key={i}>✓ {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
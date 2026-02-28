import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Globe, BarChart3, DollarSign, Gauge, FileText, TrendingUp, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";

export default function AdvancedOTAPlatformRoadmap() {
  const [selectedPhase, setSelectedPhase] = useState("current");

  const features = {
    current: {
      title: "🟢 Current State - Manual/Semi-Automated",
      color: "bg-green-50 border-green-300",
      timeline: "Now",
      items: [
        {
          feature: "✓ Markup Model Commission",
          status: "Active",
          description: "Fixed markups per tour (₱500-2,000)"
        },
        {
          feature: "✓ Manual Supplier Confirmation",
          status: "Active",
          description: "Email/Phone based with 24-48h response"
        },
        {
          feature: "✓ Static Pricing",
          status: "Active",
          description: "Fixed rates per tour, season adjustments only"
        },
        {
          feature: "✓ Single Currency (PHP)",
          status: "Active",
          description: "All transactions in Philippine Pesos"
        },
        {
          feature: "✓ Admin Dashboard",
          status: "Active",
          description: "Manual tour management and commission tracking"
        }
      ]
    },
    phase1: {
      title: "🟡 Phase 1 - API Integration (Q2-Q3 2026)",
      color: "bg-yellow-50 border-yellow-300",
      timeline: "3-6 Months",
      items: [
        {
          feature: "🔌 API-Connected Tours",
          status: "Planned",
          description: "Real-time inventory from major suppliers (Biyaheko, Wanderlinx, Tripzynx)"
        },
        {
          feature: "⚡ Real-time Slot Checking",
          status: "Planned",
          description: "Instant availability verification, no 24h wait"
        },
        {
          feature: "📊 Live Occupancy",
          status: "Planned",
          description: "Dashboard shows real-time bookings per tour"
        },
        {
          feature: "🚀 Auto-Confirmation",
          status: "Planned",
          description: "Instant booking confirmations via API (2-5 min)"
        },
        {
          feature: "📱 Mobile App Integration",
          status: "Planned",
          description: "Native iOS/Android apps with push notifications"
        }
      ]
    },
    phase2: {
      title: "🔴 Phase 2 - Dynamic Pricing (Q3-Q4 2026)",
      color: "bg-orange-50 border-orange-300",
      timeline: "6-9 Months",
      items: [
        {
          feature: "💹 Dynamic Pricing Engine",
          status: "Planned",
          description: "AI-powered pricing based on demand, seasonality, competitor rates"
        },
        {
          feature: "🎯 Demand-Based Markup",
          status: "Planned",
          description: "Markup adjusts automatically (8% low season → 20% peak)"
        },
        {
          feature: "🤖 AI Price Suggestions",
          status: "Planned",
          description: "ML model recommends optimal markup for max revenue"
        },
        {
          feature: "📈 Revenue Optimization",
          status: "Planned",
          description: "Maximize profit while maintaining competitiveness"
        },
        {
          feature: "🔔 Price Change Alerts",
          status: "Planned",
          description: "Admin notified of dramatic supplier price changes"
        }
      ]
    },
    phase3: {
      title: "🚀 Phase 3 - Global Expansion (Q4 2026 - Q1 2027)",
      color: "bg-purple-50 border-purple-300",
      timeline: "9-12 Months",
      items: [
        {
          feature: "🌍 Multi-Currency Support",
          status: "Planned",
          description: "USD, EUR, SGD, etc. with real-time exchange rates"
        },
        {
          feature: "🗺️ International Tours",
          status: "Planned",
          description: "Tours in Asia, Europe, Americas with localized pricing"
        },
        {
          feature: "💳 Multi-Payment Gateway",
          status: "Planned",
          description: "Stripe, PayPal, local wallets (GCash, PayMaya)"
        },
        {
          feature: "🌐 Multi-Language UI",
          status: "Planned",
          description: "English, Tagalog, Chinese for regional markets"
        },
        {
          feature: "📍 Geo-Targeting",
          status: "Planned",
          description: "Show relevant tours based on user location"
        }
      ]
    },
    phase4: {
      title: "⭐ Phase 4 - Full OTA Platform (2027)",
      color: "bg-blue-50 border-blue-300",
      timeline: "12+ Months",
      items: [
        {
          feature: "🏪 Marketplace Model",
          status: "Planned",
          description: "Allow suppliers to list their own tours (commission: 15%)"
        },
        {
          feature: "⭐ User Reviews & Ratings",
          status: "Planned",
          description: "Verified reviews to build trust and rank tours"
        },
        {
          feature: "💰 Loyalty Program",
          status: "Planned",
          description: "Points per booking, redeemable for future travel"
        },
        {
          feature: "🤝 B2B Portal",
          status: "Planned",
          description: "Corporate booking with group discounts"
        },
        {
          feature: "📊 Advanced Analytics",
          status: "Planned",
          description: "Heatmaps, customer journey, conversion funnels"
        }
      ]
    }
  };

  const phaseComparison = [
    {
      aspect: "Processing Speed",
      current: "Manual (24-48h)",
      phase1: "API (2-5 min)",
      phase2: "Auto with Optimization",
      phase4: "Real-time Smart Routing"
    },
    {
      aspect: "Inventory",
      current: "50 tours",
      phase1: "500+ tours (API)",
      phase2: "1000+ tours (dynamic)",
      phase4: "5000+ tours (marketplace)"
    },
    {
      aspect: "Avg Markup",
      current: "₱1,500 (fixed)",
      phase1: "₱1,500 (dynamic)",
      phase2: "₱1,800 (optimized)",
      phase4: "₱2,500+ (marketplace)"
    },
    {
      aspect: "Monthly Revenue",
      current: "₱75,000",
      phase1: "₱150,000",
      phase2: "₱250,000",
      phase4: "₱500,000+"
    },
    {
      aspect: "Currencies",
      current: "PHP only",
      phase1: "PHP only",
      phase2: "5 currencies",
      phase4: "20+ currencies"
    }
  ];

  const advancedFeatures = [
    {
      title: "Split Payment System",
      icon: DollarSign,
      description: "Automatically split payment between your account and supplier",
      implementation: "Payment Gateway → Webhook → Auto-split to 2 accounts",
      benefit: "Supplier gets paid instantly, you keep markup"
    },
    {
      title: "Auto Voucher System",
      icon: FileText,
      description: "Generate and send vouchers automatically upon booking confirmation",
      implementation: "Booking confirmed → Generate PDF voucher → Email + SMS",
      benefit: "30-sec turnaround, improved customer experience"
    },
    {
      title: "Real-time Slot Management",
      icon: Gauge,
      description: "Inventory automatically decrements when booking confirmed",
      implementation: "API call → Check slots → Lock seat → Update inventory",
      benefit: "No overbooking, accurate availability always"
    },
    {
      title: "Commission Auto-Tracking",
      icon: TrendingUp,
      description: "Commission calculated and recorded in real-time per booking",
      implementation: "Booking → PaymentSplit created → Commission logged",
      benefit: "Always know your earnings, automated tax reporting"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Advanced OTA Platform Roadmap</h2>
        <p className="text-slate-600">Evolution from manual operations to full OTA platform with dynamic pricing and global reach</p>
      </div>

      {/* Phase Selector */}
      <Tabs defaultValue="current" onValueChange={setSelectedPhase} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="current" className="text-xs">Now</TabsTrigger>
          <TabsTrigger value="phase1" className="text-xs">Phase 1<br/>(Q2-Q3)</TabsTrigger>
          <TabsTrigger value="phase2" className="text-xs">Phase 2<br/>(Q3-Q4)</TabsTrigger>
          <TabsTrigger value="phase3" className="text-xs">Phase 3<br/>(Q4-Q1)</TabsTrigger>
          <TabsTrigger value="phase4" className="text-xs">Phase 4<br/>(2027)</TabsTrigger>
        </TabsList>

        {Object.entries(features).map(([key, phase]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card className={phase.color}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{phase.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Timeline: {phase.timeline}</p>
                  </div>
                  <span className="text-3xl">{['🟢', '🟡', '🔴', '🚀', '⭐'][Object.keys(features).indexOf(key)]}</span>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {phase.items.map((item, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <span className="text-2xl flex-shrink-0">{item.feature.charAt(0)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.feature}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                          item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Phase Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Growth Projection Across Phases
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Metric</th>
                <th className="text-left p-3 font-semibold">Now</th>
                <th className="text-left p-3 font-semibold">Phase 1</th>
                <th className="text-left p-3 font-semibold">Phase 2</th>
                <th className="text-left p-3 font-semibold">Phase 4</th>
              </tr>
            </thead>
            <tbody>
              {phaseComparison.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-900">{row.aspect}</td>
                  <td className="p-3 text-slate-700">{row.current}</td>
                  <td className="p-3 text-slate-700">{row.phase1}</td>
                  <td className="p-3 text-slate-700">{row.phase2}</td>
                  <td className="p-3 font-semibold text-green-700">{row.phase4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Advanced Features Deep Dive */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">🔥 Advanced Features to Implement Now</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {advancedFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="text-purple-900">{feature.title}</CardTitle>
                      <p className="text-sm text-purple-700 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Implementation</p>
                    <code className="text-xs text-slate-700 font-mono">{feature.implementation}</code>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-1">💡 Benefit</p>
                    <p className="text-sm text-purple-900">{feature.benefit}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Implementation Priority */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommended Implementation Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-200 text-red-900 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Immediate (This Month)</p>
                <p className="text-sm text-slate-700">✅ Implement split payment system + auto voucher generation. These directly increase profit and improve customer experience.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-200 text-yellow-900 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Short-term (1-3 Months)</p>
                <p className="text-sm text-slate-700">⚡ API integration with major suppliers (Biyaheko, Wanderlinx) for real-time confirmations. Reduces manual work by 80%.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-200 text-purple-900 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Medium-term (3-6 Months)</p>
                <p className="text-sm text-slate-700">🤖 Dynamic pricing engine with AI optimization. Unlock 20-30% additional profit by pricing intelligently.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Success Metrics by Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { phase: "Phase 1", metric: "50% faster bookings", icon: "⚡" },
              { phase: "Phase 1", metric: "2x more tours", icon: "📈" },
              { phase: "Phase 2", metric: "30% higher margins", icon: "💰" },
              { phase: "Phase 4", metric: "₱500K+ monthly revenue", icon: "🚀" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl mb-2">{item.icon}</span>
                <p className="text-xs text-slate-600 font-semibold uppercase">{item.phase}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{item.metric}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
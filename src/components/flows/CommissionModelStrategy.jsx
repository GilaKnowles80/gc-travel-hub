import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Zap, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function CommissionModelStrategy() {
  const [selectedModel, setSelectedModel] = useState("markup");

  const models = {
    markup: {
      title: "1️⃣ Markup Model (Recommended)",
      icon: Zap,
      color: "bg-green-100 text-green-900",
      borderColor: "border-green-500",
      description: "You buy at supplier's net rate, add a fixed amount markup",
      
      calculation: {
        example: "5-Night Hotel Stay",
        steps: [
          { label: "Supplier Net Rate", value: "₱5,000/night", desc: "What supplier charges" },
          { label: "× 5 nights", value: "₱25,000", desc: "Base cost" },
          { label: "+ Your Markup", value: "₱1,000 total", desc: "₱200-400 per night" },
          { label: "= Customer Pays", value: "₱26,000", desc: "What you charge customer" },
          { label: "Your Profit", value: "₱1,000", desc: "Earned immediately after payment" }
        ]
      },

      flow: [
        { step: "1. Customer Books", action: "Pays ₱26,000", status: "immediate" },
        { step: "2. You Receive", action: "Cash from Stripe", status: "T+2 days" },
        { step: "3. Pay Supplier", action: "Send ₱25,000", status: "T+3-5 days" },
        { step: "4. Keep Profit", action: "Pocket ₱1,000", status: "instant" }
      ],

      pros: [
        "✅ Immediate profit after payment",
        "✅ Clear pricing control",
        "✅ Predictable margins",
        "✅ Cash flow positive"
      ],
      cons: [
        "❌ Limited inventory (supplier restrictions)",
        "❌ Requires upfront capital for pay-per-hotel model",
        "❌ Price may be less competitive vs OTA"
      ],

      implementation: {
        entity: "PaymentSplit",
        fields: {
          supplier_cost: "₱25,000 (net rate)",
          markup_amount: "₱1,000 (your profit)",
          total_amount: "₱26,000 (what customer pays)",
          payment_status: "'paid' after Stripe success"
        }
      },

      profitMargin: {
        min: "4-8% (₱500-1,000 per booking)",
        max: "15-20% (₱2,000-3,000 per booking)",
        calculation: "(Markup Amount / Total Amount) × 100"
      }
    },

    commission: {
      title: "2️⃣ Commission Model",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-900",
      borderColor: "border-blue-500",
      description: "You sell at public rate, supplier pays you commission later",
      
      calculation: {
        example: "Hotel Booking",
        steps: [
          { label: "Public Display Rate", value: "₱5,500/night", desc: "Market rate shown to customer" },
          { label: "× 5 nights", value: "₱27,500", desc: "What customer pays" },
          { label: "Supplier Commission", value: "10% = ₱2,750", desc: "Hotel pays you later" },
          { label: "Supplier's Net", value: "₱24,750", desc: "Hotel keeps after commission" },
          { label: "Your Profit", value: "₱2,750", desc: "Commission from supplier (delayed)" }
        ]
      },

      flow: [
        { step: "1. Customer Books", action: "Pays ₱27,500", status: "T+0" },
        { step: "2. You Receive", action: "Full amount from customer", status: "T+2 days" },
        { step: "3. Pay Supplier", action: "₱24,750 (keeping commission)", status: "T+3 days" },
        { step: "4. Get Commission", action: "Hotel sends ₱2,750", status: "T+15-30 days" }
      ],

      pros: [
        "✅ More competitive pricing to customers",
        "✅ Access to more inventory",
        "✅ Higher commission rates available (10-15%)",
        "✅ Larger profit potential"
      ],
      cons: [
        "❌ Commission delayed 15-30 days",
        "❌ Depends on supplier payment reliability",
        "❌ Need to float the difference",
        "❌ Less predictable cash flow"
      ],

      implementation: {
        entity: "PaymentSplit + SupplierPayment",
        fields: {
          supplier_cost: "₱24,750 (what you owe supplier)",
          markup_amount: "₱2,750 (commission - pending)",
          total_amount: "₱27,500 (customer payment)",
          supplier_payment_status: "'pending' until supplier pays"
        }
      },

      profitMargin: {
        min: "5-10% commission (₱1,375-2,750)",
        max: "15% commission (₱4,125)",
        calculation: "Negotiated with supplier (5-15% standard)"
      }
    },

    hybrid: {
      title: "3️⃣ Hybrid Model (Best for Growth)",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-900",
      borderColor: "border-purple-500",
      description: "Mix markup on some hotels + commission on contracted ones",
      
      calculation: {
        example: "Portfolio of 2 Hotels",
        steps: [
          { label: "Hotel A (Markup)", value: "₱26,000", desc: "Net rate + ₱1,000 markup" },
          { label: "Hotel B (Commission)", value: "₱27,500", desc: "Public rate, 10% commission later" },
          { label: "Customer Pays", value: "₱53,500", desc: "Total for both hotels" },
          { label: "Your Earnings", value: "₱1,000 + ₱2,750", desc: "Mixed: instant + delayed" },
          { label: "Monthly Profit", value: "₱3,750", desc: "From just 2 bookings" }
        ]
      },

      flow: [
        { step: "1. Customer Books Mix", action: "Pays ₱53,500", status: "T+0" },
        { step: "2. Hotel A", action: "Pay ₱25,000 (net)", status: "T+3 days" },
        { step: "3. Hotel B", action: "Pay ₱24,750 (minus commission)", status: "T+3 days" },
        { step: "4. Instant Profit", action: "Get ₱1,000 from A", status: "T+3 days" },
        { step: "5. Delayed Commission", action: "Get ₱2,750 from B", status: "T+20 days" }
      ],

      pros: [
        "✅ Best cash flow optimization",
        "✅ Diversified revenue streams",
        "✅ Scalable with growth",
        "✅ Competitive pricing options",
        "✅ Risk balanced"
      ],
      cons: [
        "❌ More complex to manage",
        "❌ Requires tracking both payment types",
        "❌ Mixed payment timing"
      ],

      implementation: {
        entity: "PaymentSplit + Dynamic Pricing Rules",
        fields: {
          booking_type: "'markup' or 'commission'",
          payment_method: "Track both streams",
          supplier_cost: "Varies by type",
          markup_amount: "Markup OR commission"
        }
      },

      profitMargin: {
        markup: "4-8% instant (₱500-1,000)",
        commission: "10-15% delayed (₱2,750-4,125)",
        blended: "Average 7-12% total margin"
      }
    }
  };

  const selected = models[selectedModel];
  const Icon = selected.icon;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">GC Travel Commission Models</h2>
        <p className="text-slate-600">Choose your strategy: Instant profits, delayed commissions, or hybrid approach</p>
      </div>

      {/* Model Selector Tabs */}
      <Tabs defaultValue="markup" onValueChange={setSelectedModel} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="markup">Markup</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
        </TabsList>

        {Object.entries(models).map(([key, model]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {/* Model Header */}
            <Card className={model.color}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-xl">{model.title}</CardTitle>
                    <p className="text-sm mt-1 opacity-90">{model.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calculation Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calculation Example</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">{model.calculation.example}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {model.calculation.steps.map((step, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{step.label}</span>
                        <span className="font-bold text-amber-600">{step.value}</span>
                      </div>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                      {i < model.calculation.steps.length - 1 && <div className="h-px bg-slate-200 my-2" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Money Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Money Flow Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {model.flow.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.status === 'immediate' ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-900'
                        }`}>
                          {i + 1}
                        </div>
                        {i < model.flow.length - 1 && <div className="w-0.5 h-8 bg-slate-200 mt-1" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-sm">{item.step}</p>
                        <p className="text-xs text-slate-600">{item.action}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pros & Cons */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      {model.pros.map((pro, i) => (
                        <p key={i} className="text-sm text-green-700">{pro}</p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {model.cons.map((con, i) => (
                        <p key={i} className="text-sm text-red-700">{con}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Implementation */}
              <Card className="lg:col-span-2 bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">System Implementation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Primary Entity:</p>
                    <code className="text-xs bg-white p-2 rounded border block font-mono">{model.implementation.entity}</code>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-2">Data Fields:</p>
                    <div className="space-y-2">
                      {Object.entries(model.implementation.fields).map(([field, value]) => (
                        <div key={field} className="bg-white p-2 rounded border text-xs">
                          <code className="font-mono text-slate-700">{field}:</code>
                          <span className="text-slate-600 ml-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profit Margin */}
              <Card className="lg:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Profit Margin Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeof model.profitMargin.min === 'string' ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm">Minimum Margin:</p>
                        <p className="text-sm text-slate-700">{model.profitMargin.min}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Maximum Margin:</p>
                        <p className="text-sm text-slate-700">{model.profitMargin.max}</p>
                      </div>
                      {model.profitMargin.calculation && (
                        <div>
                          <p className="font-medium text-sm">Calculation:</p>
                          <code className="text-xs bg-white p-2 rounded block font-mono">{model.profitMargin.calculation}</code>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm">Markup Model:</p>
                        <p className="text-sm text-slate-700">{model.profitMargin.markup}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Commission Model:</p>
                        <p className="text-sm text-slate-700">{model.profitMargin.commission}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Blended Average:</p>
                        <p className="text-sm text-slate-700 font-bold">{model.profitMargin.blended}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Comparison Table */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Factor</th>
                <th className="text-left p-3 font-semibold">Markup</th>
                <th className="text-left p-3 font-semibold">Commission</th>
                <th className="text-left p-3 font-semibold">Hybrid</th>
              </tr>
            </thead>
            <tbody>
              {[
                { factor: "Cash Flow", markup: "🟢 Excellent", commission: "🟡 Delayed 15-30d", hybrid: "🟢 Best" },
                { factor: "Profit per Sale", markup: "₱500-2,000", commission: "₱1,375-4,125", hybrid: "₱1,750-6,125" },
                { factor: "Complexity", markup: "Low", commission: "Medium", hybrid: "High" },
                { factor: "Pricing Control", markup: "High", commission: "Medium", hybrid: "High" },
                { factor: "Inventory Access", markup: "Limited", commission: "Extensive", hybrid: "Both" },
                { factor: "Startup Capital", markup: "Required", commission: "Minimal", hybrid: "Moderate" },
                { factor: "Recommended For", markup: "Small/Medium", commission: "Large Volume", hybrid: "Scaling Fast" }
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium">{row.factor}</td>
                  <td className="p-3">{row.markup}</td>
                  <td className="p-3">{row.commission}</td>
                  <td className="p-3">{row.hybrid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardContent className="flex gap-4 pt-6">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Recommended Strategy for GC Travel</h3>
            <p className="text-sm text-green-800 mb-3">
              <strong>Start with Markup Model</strong> (Phase 1) to establish pricing control and immediate cash flow, then transition to <strong>Hybrid Model</strong> (Phase 2) as you grow, negotiating commission deals with preferred suppliers.
            </p>
            <p className="text-xs text-green-700">
              Timeline: Markup (Months 1-6) → Hybrid (Months 6+) → Full Commission Portfolio (Year 2+)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
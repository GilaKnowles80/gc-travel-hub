import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Bot, Users, Clock, CheckCircle2, AlertCircle, BarChart3, RotateCcw } from "lucide-react";

export default function ChatSupportFlowDiagram() {
  const [selectedFlow, setSelectedFlow] = useState("main");

  const mainFlowStages = [
    {
      stage: 1,
      title: "User Initiates Chat",
      icon: "💬",
      color: "bg-blue-50 border-l-4 border-blue-500",
      actions: [
        "User visits website/app",
        "Clicks 'Chat Support' button",
        "Chat interface opens"
      ]
    },
    {
      stage: 2,
      title: "Automated Greeting & Chatbot",
      icon: "🤖",
      color: "bg-purple-50 border-l-4 border-purple-500",
      actions: [
        "Bot sends greeting: 'Hi! How can I help?'",
        "Presents quick option buttons:",
        "📋 FAQ | 📦 Track Booking | 🔧 Technical | 👤 Agent"
      ]
    },
    {
      stage: 3,
      title: "User Selects Option",
      icon: "🎯",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      branching: true,
      branches: [
        { option: "FAQ/Self-Service", outcome: "Bot provides answers" },
        { option: "Track Booking", outcome: "System retrieves booking details" },
        { option: "Complex Issue", outcome: "Route to agent" }
      ]
    },
    {
      stage: 4,
      title: "Queue Management",
      icon: "⏱️",
      color: "bg-amber-50 border-l-4 border-amber-500",
      actions: [
        "Check agent availability",
        "Agents available? → Immediate routing",
        "No agents? → Queue or alternatives"
      ]
    },
    {
      stage: 5,
      title: "Agent Handling",
      icon: "👨‍💼",
      color: "bg-green-50 border-l-4 border-green-500",
      actions: [
        "Agent receives chat",
        "Agent reviews user query & history",
        "Agent responds & troubleshoots",
        "System logs conversation"
      ]
    },
    {
      stage: 6,
      title: "Issue Resolution",
      icon: "✅",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      actions: [
        "Agent resolves issue",
        "User confirms resolution",
        "Options: End chat or continue"
      ]
    },
    {
      stage: 7,
      title: "Escalation (If Needed)",
      icon: "🚀",
      color: "bg-orange-50 border-l-4 border-orange-500",
      actions: [
        "Complex issues → escalate to specialist",
        "Update user on status",
        "Specialist handles case"
      ]
    },
    {
      stage: 8,
      title: "Feedback & Close",
      icon: "⭐",
      color: "bg-rose-50 border-l-4 border-rose-500",
      actions: [
        "Bot asks: 'Was issue resolved?'",
        "Collect star rating (1-5)",
        "Optional comment field",
        "Session closed, logged"
      ]
    }
  ];

  const botCapabilities = [
    {
      capability: "FAQ Responses",
      description: "Answer common questions automatically",
      availability: "24/7",
      examples: ["Booking policies", "Refund process", "How to modify booking"]
    },
    {
      capability: "Order Tracking",
      description: "Real-time booking status updates",
      availability: "24/7",
      examples: ["Show booking details", "Cancellation status", "Payment status"]
    },
    {
      capability: "Troubleshooting",
      description: "Guide users through technical issues",
      availability: "24/7",
      examples: ["Payment problems", "App issues", "Login help"]
    },
    {
      capability: "Appointment Scheduling",
      description: "Book callback with agent",
      availability: "24/7",
      examples: ["Schedule consultation", "Visa appointment", "Callback time"]
    }
  ];

  const agentInterface = [
    { section: "User Info", data: "Name, email, phone, booking history, previous chats" },
    { section: "Current Issue", data: "User's current problem statement & context" },
    { section: "Chat History", data: "Previous conversations with this user" },
    { section: "KB/Scripts", data: "Knowledge base, response templates, FAQs" },
    { section: "Escalation Path", data: "Quick escalation buttons to higher-level support" },
    { section: "Tools", data: "Booking lookup, refund processor, appointment scheduler" }
  ];

  const queueScenarios = [
    {
      scenario: "Agents Available",
      icon: "✅",
      action: "Forward to next available agent",
      time: "< 30 seconds"
    },
    {
      scenario: "Queue < 5 min",
      icon: "⏳",
      action: "User joins queue, bot provides wait time estimate",
      time: "Real-time updates"
    },
    {
      scenario: "Queue > 10 min",
      icon: "📞",
      action: "Offer callback or ticket option",
      time: "Schedule for later"
    },
    {
      scenario: "All Agents Offline",
      icon: "🌙",
      action: "Bot handles, or collect message for morning response",
      time: "Next business day"
    }
  ];

  const escalationPaths = [
    { level: "Level 1", role: "Junior Agent", expertise: "Basic support, FAQs" },
    { level: "Level 2", role: "Senior Agent", expertise: "Complex bookings, refunds" },
    { level: "Level 3", role: "Specialist", expertise: "Visa issues, partnerships" },
    { level: "Level 4", role: "Manager", expertise: "Complaints, special requests" }
  ];

  const analytics = [
    { metric: "Avg Response Time", target: "< 30 sec (bot), < 2 min (agent)" },
    { metric: "Resolution Rate", target: "80%+ first contact resolution" },
    { metric: "Customer Satisfaction", target: "4.5+ / 5.0 rating" },
    { metric: "Bot Deflection", target: "60%+ of chats resolved by bot" },
    { metric: "Peak Hours", tracking: "Monitor for staffing needs" },
    { metric: "Common Issues", tracking: "Train bot on top issues" }
  ];

  const enhancements = [
    {
      feature: "Multi-Language Support",
      description: "Support Tagalog, English, and Spanish",
      implementation: "Language detection & translation API"
    },
    {
      feature: "CRM Integration",
      description: "Access customer history & preferences",
      implementation: "Pre-load user data automatically"
    },
    {
      feature: "AI Suggestions",
      description: "Real-time recommendations to agents",
      implementation: "ML-powered response suggestions"
    },
    {
      feature: "Sentiment Analysis",
      description: "Detect frustrated customers",
      implementation: "Auto-escalate negative sentiment"
    },
    {
      feature: "Proactive Chat",
      description: "Offer help before user asks",
      implementation: "Trigger on page behavior"
    },
    {
      feature: "Chat Handoff",
      description: "Seamless bot-to-agent transfer",
      implementation: "Full context preservation"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">24/7 Chat Support System</h2>
        <p className="text-slate-600">Complete customer support flow with AI chatbot and agent routing</p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="flow">Main Flow</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="bot">Bot Capabilities</TabsTrigger>
          <TabsTrigger value="agent">Agent Interface</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Main Flow */}
        <TabsContent value="flow" className="space-y-6">
          <div className="space-y-4">
            {mainFlowStages.map((item, idx) => (
              <div key={idx}>
                <Card className={item.color}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-4xl">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-lg">
                          Stage {item.stage}: {item.title}
                        </p>
                        <div className="mt-3 space-y-1">
                          {item.actions?.map((action, i) => (
                            <p key={i} className="text-sm text-slate-700">• {action}</p>
                          ))}
                        </div>
                        {item.branching && (
                          <div className="mt-4 space-y-2">
                            {item.branches?.map((branch, i) => (
                              <div key={i} className="p-2 bg-white rounded border border-slate-200 text-sm">
                                <span className="font-semibold text-slate-900">{branch.option}</span>
                                <span className="text-slate-600 ml-2">→ {branch.outcome}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {idx < mainFlowStages.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-slate-300 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Queue Management */}
        <TabsContent value="queue">
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Queue Management Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {queueScenarios.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-blue-200">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="font-bold text-slate-900">{item.scenario}</p>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{item.action}</p>
                    <p className="text-xs text-slate-500">⏱️ {item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Automatic Alternatives When Queue is Long</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded border border-amber-200">
                <p className="font-bold text-slate-900 mb-2">📞 Schedule Callback</p>
                <p className="text-sm text-slate-700">User selects preferred time → Agent calls at scheduled time</p>
              </div>
              <div className="p-4 bg-white rounded border border-amber-200">
                <p className="font-bold text-slate-900 mb-2">✉️ Leave a Message</p>
                <p className="text-sm text-slate-700">Create support ticket → Agent responds via email within 2 hours</p>
              </div>
              <div className="p-4 bg-white rounded border border-amber-200">
                <p className="font-bold text-slate-900 mb-2">⏳ Wait in Queue</p>
                <p className="text-sm text-slate-700">Show estimated wait time → Update every 30 seconds</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Capabilities */}
        <TabsContent value="bot">
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Chatbot Capabilities & Automation
              </CardTitle>
              <p className="text-sm text-purple-800 mt-2">Available 24/7, handles 60%+ of inquiries</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {botCapabilities.map((bot, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900">{bot.capability}</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {bot.availability}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{bot.description}</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {bot.examples.map((ex, i) => (
                        <p key={i}>• {ex}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="text-green-900">Bot Conversation Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded border border-green-200">
                <p className="font-bold text-slate-900 mb-3">Example 1: FAQ Resolution</p>
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">Bot: "How can I help?"</div>
                  <div className="bg-slate-50 p-2 rounded">User: "Can I modify my flight?"</div>
                  <div className="bg-blue-50 p-2 rounded">Bot: "Yes! Here's how... [instructions]. Resolved? ✅"</div>
                  <div className="bg-slate-50 p-2 rounded">User: "Yes, thanks!"</div>
                  <div className="bg-blue-50 p-2 rounded">Bot: "Rate your experience: ⭐⭐⭐⭐⭐"</div>
                </div>
              </div>
              <div className="p-4 bg-white rounded border border-green-200">
                <p className="font-bold text-slate-900 mb-3">Example 2: Escalation to Agent</p>
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">Bot: "How can I help?"</div>
                  <div className="bg-slate-50 p-2 rounded">User: "I need to cancel and refund"</div>
                  <div className="bg-blue-50 p-2 rounded">Bot: "This needs agent review. Connecting... Agent John will help you soon."</div>
                  <div className="bg-slate-50 p-2 rounded">Agent: "Hi! I see you need a refund..."</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Interface */}
        <TabsContent value="agent">
          <Card className="mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Agent Dashboard Components
              </CardTitle>
              <p className="text-sm text-teal-800 mt-2">Everything agents need to resolve issues quickly</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {agentInterface.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-teal-200">
                    <p className="font-bold text-slate-900 mb-2">{item.section}</p>
                    <p className="text-sm text-slate-700">{item.data}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300">
            <CardHeader>
              <CardTitle className="text-rose-900">Escalation Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalationPaths.map((level, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-rose-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900">{level.level}: {level.role}</p>
                        <p className="text-sm text-slate-600 mt-1">{level.expertise}</p>
                      </div>
                      <span className="text-sm bg-rose-100 text-rose-800 px-2 py-1 rounded">{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
            <CardHeader>
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Key Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analytics.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-indigo-200">
                    <p className="font-bold text-slate-900">{item.metric}</p>
                    <p className="text-sm text-slate-700 mt-2">
                      {item.target || item.tracking}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300">
            <CardHeader>
              <CardTitle className="text-emerald-900">Enhancements & Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {enhancements.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-emerald-200">
                    <p className="font-bold text-slate-900 mb-2">{item.feature}</p>
                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    <p className="text-xs text-emerald-700 font-semibold">🔧 {item.implementation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300">
            <CardHeader>
              <CardTitle className="text-orange-900">Sample Daily Report (Hypothetical)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">Total Chats</span>
                  <span className="text-lg font-bold text-orange-700">247</span>
                </div>
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">Bot Resolved (Auto)</span>
                  <span className="text-lg font-bold text-green-700">158 (64%)</span>
                </div>
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">Agent Handled</span>
                  <span className="text-lg font-bold text-blue-700">89 (36%)</span>
                </div>
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">Avg Response Time</span>
                  <span className="text-lg font-bold text-slate-700">1.2 minutes</span>
                </div>
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">Customer Satisfaction</span>
                  <span className="text-lg font-bold text-amber-700">4.7 / 5.0 ⭐</span>
                </div>
                <div className="p-3 bg-white rounded border border-orange-200 flex justify-between">
                  <span className="text-sm font-semibold">First Contact Resolution</span>
                  <span className="text-lg font-bold text-emerald-700">82%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Roadmap */}
      <Card className="mt-8 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300">
        <CardHeader>
          <CardTitle className="text-violet-900">📋 Implementation Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { phase: "Phase 1 (Month 1-2)", tasks: ["Set up chatbot platform", "Create FAQ database", "Basic greeting & routing"] },
              { phase: "Phase 2 (Month 2-3)", tasks: ["Integrate with Deno backend", "Connect to booking system", "Queue management"] },
              { phase: "Phase 3 (Month 3-4)", tasks: ["Agent dashboard UI", "Escalation workflow", "Chat history logging"] },
              { phase: "Phase 4 (Month 4+)", tasks: ["AI suggestions to agents", "Multi-language support", "Advanced analytics", "CRM integration"] }
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
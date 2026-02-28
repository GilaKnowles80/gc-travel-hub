import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, TrendingUp, AlertCircle, BarChart3, Database, CheckCircle2 } from "lucide-react";

export default function CustomerFeedbackFlowDiagram() {
  const mainFlowStages = [
    {
      stage: 1,
      title: "Service Completion",
      icon: "✅",
      color: "bg-green-50 border-l-4 border-green-500",
      description: "User completes booking, tour, flight, support interaction, or visa service"
    },
    {
      stage: 2,
      title: "Feedback Prompt Triggered",
      icon: "📋",
      color: "bg-blue-50 border-l-4 border-blue-500",
      description: "System automatically shows: 'Please rate your experience and leave feedback'"
    },
    {
      stage: 3,
      title: "Customer Input Collection",
      icon: "⭐",
      color: "bg-yellow-50 border-l-4 border-yellow-500",
      inputs: [
        "Rating: Click 1-5 stars",
        "Feedback: Free-text optional comment",
        "Email: Optional (for follow-up)"
      ]
    },
    {
      stage: 4,
      title: "Feedback Processing",
      icon: "🔄",
      color: "bg-purple-50 border-l-4 border-purple-500",
      processing: [
        "✓ Store rating value in database",
        "✓ Store feedback text",
        "✓ Link to Customer ID & Booking ID",
        "✓ Timestamp recording",
        "✓ Run sentiment analysis (ML)"
      ]
    },
    {
      stage: 5,
      title: "Sentiment Analysis",
      icon: "🤖",
      color: "bg-cyan-50 border-l-4 border-cyan-500",
      sentiment: [
        "Positive (⭐⭐⭐⭐⭐, ⭐⭐⭐⭐): Compliment tags, praise keywords",
        "Neutral (⭐⭐⭐): Mixed feedback, balanced opinion",
        "Negative (⭐⭐, ⭐): Complaint keywords, issue flags"
      ]
    },
    {
      stage: 6,
      title: "Rating Aggregation",
      icon: "📊",
      color: "bg-indigo-50 border-l-4 border-indigo-500",
      formula: "Average Rating = (Sum of all ratings) / (Total number of ratings)"
    },
    {
      stage: 7,
      title: "Customer Acknowledgement",
      icon: "✔️",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      display: [
        "Thank you message displayed",
        "Current rating shown (e.g., 4.8/5)",
        "Feedback confirmation",
        "Option to view recent comments"
      ]
    },
    {
      stage: 8,
      title: "Admin Review & Action",
      icon: "👨‍💼",
      color: "bg-rose-50 border-l-4 border-rose-500",
      admin: [
        "Admin dashboard updated in real-time",
        "View all feedback & ratings",
        "Sentiment trend analysis",
        "Flag issues for follow-up",
        "Use insights for improvements"
      ]
    }
  ];

  const ratingSystem = [
    {
      stars: 5,
      label: "Excellent",
      emoji: "⭐⭐⭐⭐⭐",
      description: "Outstanding service, highly satisfied",
      color: "bg-emerald-100 border-emerald-300"
    },
    {
      stars: 4,
      label: "Good",
      emoji: "⭐⭐⭐⭐",
      description: "Very satisfied, minor issues",
      color: "bg-green-100 border-green-300"
    },
    {
      stars: 3,
      label: "Average",
      emoji: "⭐⭐⭐",
      description: "Satisfied, some improvements needed",
      color: "bg-yellow-100 border-yellow-300"
    },
    {
      stars: 2,
      label: "Poor",
      emoji: "⭐⭐",
      description: "Dissatisfied, several issues",
      color: "bg-orange-100 border-orange-300"
    },
    {
      stars: 1,
      label: "Very Poor",
      emoji: "⭐",
      description: "Very dissatisfied, major problems",
      color: "bg-red-100 border-red-300"
    }
  ];

  const feedbackTypes = [
    {
      type: "Service Quality",
      description: "Overall service experience, staff behavior, responsiveness",
      examples: ["Fast booking process", "Professional agent", "Poor communication"]
    },
    {
      type: "Product Quality",
      description: "Quality of flights, hotels, tours, visa services",
      examples: ["Great hotel", "Flight was comfortable", "Tour not as advertised"]
    },
    {
      type: "Price Value",
      description: "Perception of pricing fairness relative to service",
      examples: ["Great price", "Overpriced", "Good value for money"]
    },
    {
      type: "Support Experience",
      description: "Helpdesk, chat support, customer service quality",
      examples: ["Agent very helpful", "Long wait time", "Quick resolution"]
    },
    {
      type: "Technical Issues",
      description: "App/website bugs, functionality problems",
      examples: ["App crashed", "Booking page slow", "Easy to use"]
    }
  ];

  const sentimentAnalysis = [
    {
      sentiment: "POSITIVE",
      icon: "😊",
      color: "bg-emerald-100 border-emerald-300",
      keywords: ["excellent", "great", "amazing", "perfect", "love", "fantastic", "best", "highly recommend"],
      action: "Celebrate feedback, share testimonials, reward customer"
    },
    {
      sentiment: "NEUTRAL",
      icon: "😐",
      color: "bg-yellow-100 border-yellow-300",
      keywords: ["okay", "fine", "average", "some good some bad", "mixed", "decent"],
      action: "Identify improvement areas from comment"
    },
    {
      sentiment: "NEGATIVE",
      icon: "😞",
      color: "bg-red-100 border-red-300",
      keywords: ["bad", "poor", "disappointed", "frustrated", "terrible", "waste", "refund", "problem"],
      action: "Auto-flag for follow-up, offer resolution, prevent churn"
    }
  ];

  const adminDashboard = [
    { metric: "Overall Rating", display: "4.7 / 5.0 ⭐", trend: "↑ 0.2 from last month" },
    { metric: "Total Ratings", display: "2,847", trend: "+156 this week" },
    { metric: "5-Star Percentage", display: "62%", trend: "Most common rating" },
    { metric: "1-Star Percentage", display: "3%", trend: "Needs follow-up" },
    { metric: "Positive Feedback", display: "68%", trend: "+5% trend" },
    { metric: "Negative Feedback", display: "12%", trend: "-2% trend" },
    { metric: "Avg Response Time", display: "24 hours", trend: "Follow-up by admin" }
  ];

  const automationRules = [
    {
      trigger: "Rating = 5 stars",
      action: "Auto-send thank you email, ask permission to share testimonial",
      benefit: "Build social proof & user-generated content"
    },
    {
      trigger: "Rating = 1-2 stars",
      action: "Auto-flag for admin review, trigger follow-up email",
      benefit: "Prevent negative reviews, improve retention"
    },
    {
      trigger: "Rating = 3 stars + complaint keywords",
      action: "Route to senior support for resolution",
      benefit: "Upgrade satisfaction, collect insights"
    },
    {
      trigger: "Feedback mentions 'refund'",
      action: "Auto-escalate to finance team",
      benefit: "Quick issue resolution"
    },
    {
      trigger: "Sentiment = Negative",
      action: "Offer 10% discount on next booking",
      benefit: "Recover dissatisfied customers"
    }
  ];

  const optionalFeatures = [
    {
      feature: "Anonymous Feedback",
      description: "Allow unlinked feedback without customer identification",
      benefit: "Increase honest responses, reduce bias",
      implementation: "Optional 'Rate Anonymously' toggle"
    },
    {
      feature: "Featured Testimonials",
      description: "Display top 5-star reviews on website & social media",
      benefit: "Build trust, increase conversions",
      implementation: "Showcase section on Home page & Instagram"
    },
    {
      feature: "Negative Feedback Flag",
      description: "Auto-detect and flag complaints for immediate follow-up",
      benefit: "Quick issue resolution, damage control",
      implementation: "Alert admin, auto-send recovery email"
    },
    {
      feature: "Email Follow-up",
      description: "Send personalized email to 1-2 star raters with resolution offer",
      benefit: "Turn detractors into promoters",
      implementation: "Automated email sequence"
    },
    {
      feature: "Net Promoter Score (NPS)",
      description: "Calculate 'Would you recommend us?' metric (0-10 scale)",
      benefit: "Industry standard metric for growth",
      implementation: "Add NPS question in feedback form"
    },
    {
      feature: "Feedback Trends Report",
      description: "Weekly/monthly report of sentiment changes, top complaints",
      benefit: "Strategic insights for product improvements",
      implementation: "Weekly email to leadership"
    }
  ];

  const dataModel = [
    { entity: "Feedback", fields: "ID, CustomerID, BookingID, Rating, TextComment, Sentiment, Timestamp" },
    { entity: "Rating", fields: "ID, FeedbackID, Value (1-5), IsAnonymous" },
    { entity: "SentimentScore", fields: "ID, FeedbackID, Sentiment (Pos/Neu/Neg), Confidence, Keywords" },
    { entity: "FeedbackAnalytics", fields: "PeriodID, AvgRating, TotalRatings, SentimentBreakdown" },
    { entity: "AdminAction", fields: "ID, FeedbackID, ActionType, Status, AssignedTo, Timestamp" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Feedback & Rating System</h2>
        <p className="text-slate-600">Complete flow for collecting, analyzing, and acting on customer feedback</p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="flow">Main Flow</TabsTrigger>
          <TabsTrigger value="ratings">Rating System</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
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
                        <div className="mt-3 space-y-1">
                          {item.inputs.map((input, i) => (
                            <p key={i} className="text-sm text-slate-700">• {input}</p>
                          ))}
                        </div>
                      )}
                      {item.processing && (
                        <div className="mt-3 space-y-1">
                          {item.processing.map((proc, i) => (
                            <p key={i} className="text-sm text-slate-700">{proc}</p>
                          ))}
                        </div>
                      )}
                      {item.sentiment && (
                        <div className="mt-3 space-y-2">
                          {item.sentiment.map((sent, i) => (
                            <p key={i} className="text-sm text-slate-700">{sent}</p>
                          ))}
                        </div>
                      )}
                      {item.formula && (
                        <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                          <code className="text-sm text-slate-700">{item.formula}</code>
                        </div>
                      )}
                      {item.display && (
                        <div className="mt-3 space-y-1">
                          {item.display.map((disp, i) => (
                            <p key={i} className="text-sm text-slate-700">• {disp}</p>
                          ))}
                        </div>
                      )}
                      {item.admin && (
                        <div className="mt-3 space-y-1">
                          {item.admin.map((adm, i) => (
                            <p key={i} className="text-sm text-slate-700">• {adm}</p>
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
        </TabsContent>

        {/* Rating System */}
        <TabsContent value="ratings">
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300">
            <CardHeader>
              <CardTitle className="text-yellow-900 flex items-center gap-2">
                <Star className="w-5 h-5" />
                5-Star Rating Scale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingSystem.map((rating, idx) => (
                  <div key={idx} className={`p-4 rounded border-2 ${rating.color}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900">{rating.emoji} {rating.label}</p>
                        <p className="text-sm text-slate-600 mt-1">{rating.description}</p>
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded font-semibold">{rating.stars}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-blue-900">Common Feedback Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {feedbackTypes.map((type, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-blue-200">
                    <p className="font-bold text-slate-900 mb-2">{type.type}</p>
                    <p className="text-sm text-slate-600 mb-3">{type.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      {type.examples.map((ex, i) => (
                        <p key={i}>▪ <em>"{ex}"</em></p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis */}
        <TabsContent value="sentiment">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">AI Sentiment Analysis</CardTitle>
              <p className="text-sm text-purple-800 mt-2">Automatically classify feedback as Positive, Neutral, or Negative</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentAnalysis.map((sent, idx) => (
                  <div key={idx} className={`p-4 rounded border-2 ${sent.color}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{sent.icon}</span>
                      <p className="font-bold text-slate-900 text-lg">{sent.sentiment}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Common Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {sent.keywords.map((keyword, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded font-mono">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Action:</span> {sent.action}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Panel */}
        <TabsContent value="admin">
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
            <CardHeader>
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Admin Dashboard Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminDashboard.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-indigo-200">
                    <p className="text-sm text-slate-600 mb-1">{item.metric}</p>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{item.display}</p>
                    <p className="text-xs text-slate-500">{item.trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300">
            <CardHeader>
              <CardTitle className="text-rose-900">Admin Actions on Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded border border-rose-200">
                <p className="font-bold text-slate-900 mb-2">✅ 5-Star Rating Received</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Auto-send congratulations & thank you email</li>
                  <li>• Request permission to showcase as testimonial</li>
                  <li>• Add to 'Featured Reviews' section</li>
                  <li>• Offer exclusive 5% discount for next booking</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded border border-rose-200">
                <p className="font-bold text-slate-900 mb-2">⚠️ 1-2 Star Rating Received</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Auto-flag in admin dashboard for immediate review</li>
                  <li>• Send personalized apology & resolution email</li>
                  <li>• Offer refund, discount, or service recovery</li>
                  <li>• Schedule follow-up call with customer</li>
                  <li>• Track whether customer upgrades rating</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded border border-rose-200">
                <p className="font-bold text-slate-900 mb-2">📊 Weekly Trend Analysis</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Average rating trend (up/down)</li>
                  <li>• Top complaints this week</li>
                  <li>• Most praised features/services</li>
                  <li>• Recommended improvements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation">
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300">
            <CardHeader>
              <CardTitle className="text-teal-900">Automated Response Rules</CardTitle>
              <p className="text-sm text-teal-800 mt-2">Trigger actions based on ratings and feedback content</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-teal-200">
                    <div className="mb-3">
                      <p className="font-bold text-slate-900 text-sm">Trigger:</p>
                      <p className="text-sm text-slate-700 bg-teal-50 p-2 rounded mt-1">{rule.trigger}</p>
                    </div>
                    <div className="mb-3">
                      <p className="font-bold text-slate-900 text-sm">Action:</p>
                      <p className="text-sm text-slate-700">{rule.action}</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-900">💡 Benefit: {rule.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optional Features */}
        <TabsContent value="features">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="text-green-900">Advanced Features & Enhancements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {optionalFeatures.map((feature, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-green-200">
                    <p className="font-bold text-slate-900 mb-2">{feature.feature}</p>
                    <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                    <p className="text-xs text-green-700 font-semibold mb-2">✨ {feature.benefit}</p>
                    <p className="text-xs text-slate-500">🔧 {feature.implementation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-900">Data Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataModel.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-slate-200">
                    <p className="font-bold text-slate-900 text-sm mb-1">{item.entity}</p>
                    <code className="text-xs text-slate-600">{item.fields}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sample Feedback Flow */}
      <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <CardHeader>
          <CardTitle className="text-amber-900">Sample Customer Feedback Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: "Customer books flight", status: "Booking confirmed" },
              { step: 2, action: "System triggers: 'Rate your experience'", status: "Feedback prompt shown" },
              { step: 3, action: "Customer gives 5 stars + comment", status: "⭐⭐⭐⭐⭐ 'Best booking experience ever!'" },
              { step: 4, action: "Sentiment analysis runs", status: "Sentiment: POSITIVE ✅" },
              { step: 5, action: "Rating stored in database", status: "Rating added, total now 4.8/5" },
              { step: 6, action: "Thank you message shown", status: "'Thank you! Your rating: 4.8/5'" },
              { step: 7, action: "Auto-email sent to customer", status: "Permission to share testimonial requested" },
              { step: 8, action: "Admin dashboard updated", status: "New 5-star visible in real-time metrics" }
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white rounded border border-amber-200 flex gap-3">
                <span className="font-bold text-amber-700 flex-shrink-0">{item.step}.</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-semibold">{item.action}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Timeline */}
      <Card className="mt-8 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300">
        <CardHeader>
          <CardTitle className="text-violet-900">Implementation Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { phase: "Phase 1 (Week 1-2)", tasks: ["Design feedback form UI", "Create Feedback entity", "Build basic rating system"] },
              { phase: "Phase 2 (Week 2-3)", tasks: ["Implement sentiment analysis (AI)", "Add feedback prompt trigger", "Build rating calculation logic"] },
              { phase: "Phase 3 (Week 3-4)", tasks: ["Create admin dashboard", "Set up automation rules", "Email notification system"] },
              { phase: "Phase 4 (Week 4+)", tasks: ["Anonymous feedback toggle", "Testimonial showcase on homepage", "NPS survey integration"] }
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
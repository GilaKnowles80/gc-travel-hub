import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Globe, FileText, CheckCircle2, AlertCircle, DollarSign, Clock, Shield, Users, BarChart3, Stamp, Mail, Phone } from "lucide-react";

export default function VisaProcessingFlowDiagram() {
  const [selectedVisa, setSelectedVisa] = useState(null);

  const flowStages = [
    {
      stage: "Inquiry & Assessment",
      color: "bg-blue-50 border-l-4 border-blue-500",
      steps: [
        { title: "Client Inquiry", icon: Mail, desc: "Walk-in, Website, Messenger, WhatsApp, Phone Call" },
        { title: "Visa Assessment", icon: Globe, desc: "Destination, Purpose, Dates, Applicant Profile" },
        { title: "Requirement Check", icon: FileText, desc: "Passport, Financial Docs, Employment, Supporting Papers" }
      ]
    },
    {
      stage: "Document Collection",
      color: "bg-amber-50 border-l-4 border-amber-500",
      steps: [
        { title: "Send Checklist", icon: "📋", desc: "Detailed requirements list based on destination" },
        { title: "Client Submission", icon: "📤", desc: "Online upload or physical document submission" },
        { title: "Document Verification", icon: CheckCircle2, desc: "Completeness, format, financial capacity review" }
      ]
    },
    {
      stage: "Application Preparation",
      color: "bg-purple-50 border-l-4 border-purple-500",
      steps: [
        { title: "Form Preparation", icon: FileText, desc: "Fill visa application form with client data" },
        { title: "Client Review", icon: "👁️", desc: "Client reviews all details and signs forms" },
        { title: "Fee Collection", icon: DollarSign, desc: "Embassy Fee + Your Service Fee collected" }
      ]
    },
    {
      stage: "Submission & Processing",
      color: "bg-teal-50 border-l-4 border-teal-500",
      steps: [
        { title: "Appointment Scheduling", icon: Clock, desc: "Embassy, Consulate, or Visa Application Center" },
        { title: "Biometrics (if required)", icon: "🔍", desc: "Fingerprints, photo capture, interview" },
        { title: "Application Submission", icon: Stamp, desc: "Official application lodged with embassy" }
      ]
    },
    {
      stage: "Decision & Release",
      color: "bg-emerald-50 border-l-4 border-emerald-500",
      steps: [
        { title: "Status Tracking", icon: Clock, desc: "Monitor application status regularly" },
        { title: "Decision Released", icon: CheckCircle2, desc: "Approved or Denied notification from embassy" },
        { title: "Passport Return", icon: "📕", desc: "Release passport to client, record revenue" }
      ]
    }
  ];

  const visaTypes = [
    {
      name: "Tourist/Leisure",
      icon: "🏖️",
      duration: "15-90 days",
      processing: "5-15 days",
      fee: "₱2,000-₱8,000",
      service: "₱3,000-₱5,000",
      description: "Holiday, sightseeing, vacation",
      countries: "Japan, S. Korea, Thailand, Vietnam"
    },
    {
      name: "Business",
      icon: "💼",
      duration: "30-180 days",
      processing: "7-20 days",
      fee: "₱3,000-₱12,000",
      service: "₱5,000-₱8,000",
      description: "Meetings, conferences, trade",
      countries: "USA, Canada, Singapore, Hong Kong"
    },
    {
      name: "Schengen",
      icon: "🇪🇺",
      duration: "90 days (180 period)",
      processing: "10-25 days",
      fee: "₱4,000-₱10,000",
      service: "₱8,000-₱12,000",
      description: "Europe multi-country access",
      countries: "France, Germany, Italy, Spain, Netherlands"
    },
    {
      name: "Work/Residency",
      icon: "🏢",
      duration: "1-3 years",
      processing: "20-60 days",
      fee: "₱8,000-₱25,000",
      service: "₱10,000-₱15,000",
      description: "Employment, relocation, study",
      countries: "Canada, Australia, UAE, UK"
    }
  ];

  const revenueModels = [
    {
      title: "Service Fee Model (Recommended)",
      icon: "✅",
      recommended: true,
      description: "Charge fixed service fee on top of embassy fee",
      flow: [
        { step: "Embassy Visa Fee", amount: "₱5,000", detail: "Exact amount charged by embassy" },
        { step: "Your Service Fee", amount: "₱7,000", detail: "Processing, documentation, coordination" },
        { step: "Total Client Pays", amount: "₱12,000", detail: "Sum of both fees" }
      ],
      profitMargin: {
        min: "₱3,000-5,000 per visa",
        max: "₱10,000-15,000 (complex cases)",
        percentage: "40-60% service markup"
      },
      pros: ["Transparent pricing", "Clear earnings", "Predictable revenue", "Client understands value"],
      cons: ["Higher customer cost", "May lose price-sensitive clients"],
      useCases: "Best for all visa types - simple and clear"
    },
    {
      title: "Commission Model",
      icon: "📊",
      recommended: false,
      description: "Earn % from embassy or visa partner network",
      flow: [
        { step: "Embassy Fees", amount: "Passed through", detail: "Customer pays embassy directly" },
        { step: "Partner Commission", amount: "5-15%", detail: "From visa processing partner" },
        { step: "Your Profit", amount: "Variable", detail: "Only on referred/processed visas" }
      ],
      profitMargin: {
        min: "₱250-1,000 per visa",
        max: "₱5,000+ (volume based)",
        percentage: "5-15% commission"
      },
      pros: ["Lower customer pricing", "Volume dependent", "Partnership revenue"],
      cons: ["Lower margins", "Delayed payment", "Less predictable"],
      useCases: "For high-volume, budget segment"
    }
  ];

  const requiredDocuments = [
    { category: "Passport & ID", items: ["Valid passport (6+ months validity)", "Birth certificate", "National ID/Driver's license"] },
    { category: "Financial", items: ["Bank statements (3-6 months)", "Proof of income (employment letter)", "Income tax returns (ITR)", "Sponsor affidavit if applicable"] },
    { category: "Employment", items: ["Employment certificate", "Leave approval from employer", "Employment contract copy", "Office ID"] },
    { category: "Travel Plans", items: ["Flight booking confirmation", "Hotel reservation", "Tour itinerary", "Travel insurance"] },
    { category: "Personal", items: ["Completed visa form", "Passport-size photos (4x6)", "Marriage certificate (if married)", "Divorce papers (if applicable)"] },
    { category: "Medical", items: ["Health insurance (if required)", "Medical exam results", "Vaccination records (if applicable)"] }
  ];

  const destinationVisas = [
    {
      country: "Japan",
      visa: "Tourist Visa",
      duration: "90 days",
      fee: "₱3,500",
      service: "₱4,000-5,000",
      processing: "5-7 days",
      requirements: "Passport (6m+), Bank statement, Flight booking",
      approval: "95%+"
    },
    {
      country: "South Korea",
      visa: "Tourist Visa",
      duration: "90 days",
      fee: "₱3,000",
      service: "₱4,000-5,000",
      processing: "5-10 days",
      requirements: "Passport (6m+), Financial proof, Hotel booking",
      approval: "98%+"
    },
    {
      country: "Australia",
      visa: "Visitor Visa",
      duration: "12 months",
      fee: "₱8,000",
      service: "₱7,000-9,000",
      processing: "7-21 days",
      requirements: "Passport, Bank proof, Health exam",
      approval: "92%"
    },
    {
      country: "USA",
      visa: "B1/B2 Visa",
      duration: "10 years",
      fee: "₱8,800",
      service: "₱10,000-12,000",
      processing: "10-30 days",
      requirements: "Passport, DS-160, Photo, Interview",
      approval: "70-80%"
    },
    {
      country: "Canada",
      visa: "Visitor Visa",
      duration: "6 months",
      fee: "₱6,200",
      service: "₱8,000-10,000",
      processing: "15-25 days",
      requirements: "Passport, Financial proof, Letter of support",
      approval: "75-85%"
    },
    {
      country: "Schengen (EU)",
      visa: "Schengen Visa",
      duration: "90/180 days",
      fee: "₱4,500",
      service: "₱8,000-12,000",
      processing: "10-25 days",
      requirements: "Passport, Travel insurance, Bank proof, Itinerary",
      approval: "85-90%"
    }
  ];

  const adminOperations = [
    { icon: "👥", title: "Client Case Management", desc: "Track each visa application from start to finish" },
    { icon: "📋", title: "Document Checklist", desc: "Ensure all required docs submitted before processing" },
    { icon: "📅", title: "Appointment Scheduler", desc: "Schedule embassy/consulate appointments" },
    { icon: "💳", title: "Payment Tracking", desc: "Monitor service fee and embassy fee collections" },
    { icon: "📊", title: "Status Monitoring", desc: "Track application status with embassies" },
    { icon: "📈", title: "Approval Reports", desc: "Track visa approval/rejection rates by country" }
  ];

  const timeline = [
    { phase: "Initial Inquiry", duration: "Day 1-2", actions: ["Assessment", "Send requirements", "Client consultation"] },
    { phase: "Document Collection", duration: "Day 3-14", actions: ["Client gathers docs", "Submit to agency", "Verification"] },
    { phase: "Application Prep", duration: "Day 15-17", actions: ["Fill forms", "Client signs", "Collect fees"] },
    { phase: "Submission", duration: "Day 18-20", actions: ["Schedule appointment", "Biometrics (if needed)", "Submit application"] },
    { phase: "Processing", duration: "Day 21-40", actions: ["Embassy reviews", "Status monitoring", "Follow-ups"] },
    { phase: "Delivery", duration: "Day 41+", actions: ["Decision announced", "Return passport", "Client notified"] }
  ];

  const complianceChecklist = [
    { item: "Service Agreement", detail: "Signed contract clearly stating 'Visa Assistance Only'" },
    { item: "No Guarantees", detail: "Clear disclaimer that approval not guaranteed" },
    { item: "Data Security", detail: "Secure storage of passports, financial docs" },
    { item: "Transparent Fees", detail: "Clear breakdown of all charges to client" },
    { item: "Licensing", detail: "Valid travel agency or visa processor license" },
    { item: "Confidentiality", detail: "NDA for handling sensitive client information" },
    { item: "Communication Log", detail: "Document all client communications" },
    { item: "Error Correction", detail: "Process for document corrections/resubmission" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Tourist Visa Processing Flow - Complete System</h2>
        <p className="text-slate-600">End-to-end visa service with document management, fee collection, and compliance tracking</p>
      </div>

      {/* Main Flow Stages */}
      <div className="mb-12 space-y-4">
        {flowStages.map((stage, idx) => (
          <div key={idx}>
            <div className={`p-4 rounded-lg ${stage.color}`}>
              <h3 className="font-bold text-slate-900 text-lg">Stage {idx + 1}: {stage.stage}</h3>
            </div>
            <div className="ml-4 mt-3 space-y-3">
              {stage.steps.map((step, stepIdx) => {
                const Icon = typeof step.icon === "string" ? null : step.icon;
                return (
                  <div key={stepIdx}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 py-4 px-6">
                        {Icon ? (
                          <Icon className="w-6 h-6 text-slate-600 flex-shrink-0" />
                        ) : (
                          <span className="text-2xl flex-shrink-0">{step.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{step.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{step.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                    {stepIdx < stage.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {idx < flowStages.length - 1 && (
              <div className="flex justify-center py-4">
                <div className="w-1 h-8 bg-gradient-to-b from-slate-300 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Visa Types */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">🛂 Visa Types & Service Fees</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visaTypes.map((visa, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVisa(i)}>
              <CardContent className="pt-6">
                <p className="text-4xl mb-3">{visa.icon}</p>
                <h4 className="font-bold text-slate-900 mb-1">{visa.name}</h4>
                <p className="text-xs text-slate-600 mb-3">{visa.description}</p>
                <div className="space-y-1 text-xs">
                  <div><span className="text-slate-500">Duration:</span> <span className="font-semibold">{visa.duration}</span></div>
                  <div><span className="text-slate-500">Processing:</span> <span className="font-semibold">{visa.processing}</span></div>
                  <div><span className="text-slate-500">Embassy Fee:</span> <span className="font-semibold text-blue-700">{visa.fee}</span></div>
                  <div><span className="text-slate-500">Our Service:</span> <span className="font-semibold text-emerald-700">{visa.service}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Models */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">💰 Revenue Models - Choose Your Strategy</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {revenueModels.map((model, i) => (
            <Card
              key={i}
              className={`overflow-hidden border-2 ${
                model.recommended
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                  : "border-slate-200"
              }`}
            >
              <CardHeader className={model.recommended ? "bg-green-100" : "bg-slate-100"}>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{model.title}</CardTitle>
                    <p className="text-xs text-slate-600 mt-1">{model.description}</p>
                  </div>
                  <span className="text-2xl">{model.icon}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Flow */}
                <div className="space-y-3">
                  {model.flow.map((item, j) => (
                    <div key={j} className="flex justify-between items-start p-2 bg-white rounded border border-slate-100">
                      <span className="text-sm font-medium text-slate-900">{item.step}</span>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">{item.amount}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Profit Margin */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-bold text-amber-900 uppercase mb-1">Profit Margin</p>
                  <p className="text-xs text-amber-900 space-y-0.5">
                    <div>Min: {model.profitMargin.min}</div>
                    <div>Max: {model.profitMargin.max}</div>
                    <div className="font-bold text-amber-700">{model.profitMargin.percentage}</div>
                  </p>
                </div>

                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    {model.pros.map((pro, j) => (
                      <p key={j} className="text-xs text-green-700">✓ {pro}</p>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {model.cons.map((con, j) => (
                      <p key={j} className="text-xs text-red-700">✗ {con}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card className="mb-12 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
        <CardHeader>
          <CardTitle className="text-indigo-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Typical Visa Processing Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-indigo-300 mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-900">{item.phase}</p>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{item.duration}</span>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {item.actions.map((action, j) => (
                      <li key={j}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card className="mb-12 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 border-2">
        <CardHeader>
          <CardTitle className="text-orange-900">📋 Required Documents Checklist (Varies by Destination)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {requiredDocuments.map((category, i) => (
              <div key={i} className="p-4 bg-white rounded border border-orange-100">
                <p className="font-semibold text-slate-900 mb-2 text-sm">{category.category}</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <CheckCircle2 className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Destinations */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Popular Tourist Visa Destinations
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 font-semibold">Country</th>
                <th className="text-left p-3 font-semibold">Visa Type</th>
                <th className="text-left p-3 font-semibold">Duration</th>
                <th className="text-left p-3 font-semibold">Embassy Fee</th>
                <th className="text-left p-3 font-semibold">Our Service</th>
                <th className="text-left p-3 font-semibold">Processing</th>
                <th className="text-left p-3 font-semibold">Approval %</th>
              </tr>
            </thead>
            <tbody>
              {destinationVisas.map((visa, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{visa.country}</td>
                  <td className="p-3">{visa.visa}</td>
                  <td className="p-3 text-xs">{visa.duration}</td>
                  <td className="p-3 font-bold text-blue-700">{visa.fee}</td>
                  <td className="p-3 font-bold text-emerald-700">{visa.service}</td>
                  <td className="p-3 text-xs">{visa.processing}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                      {visa.approval}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Admin Operations */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Admin Back Office Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminOperations.map((op, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <p className="text-2xl mb-2">{op.icon}</p>
                <p className="font-semibold text-slate-900 text-sm mb-1">{op.title}</p>
                <p className="text-xs text-slate-600">{op.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fare Breakdown Example */}
      <Card className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">💳 Sample Visa Service Breakdown - USA B1/B2 Visa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Embassy Visa Fee (MRV)</span>
                  <span className="font-bold text-slate-900">₱8,800</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Document Processing</span>
                  <span className="font-bold text-slate-900">₱2,000</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Form Preparation</span>
                  <span className="font-bold text-slate-900">₱2,000</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Consultation & Guidance</span>
                  <span className="font-bold text-slate-900">₱2,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Appointment Scheduling</span>
                  <span className="font-bold text-slate-900">₱1,500</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded border border-purple-100">
                  <span className="text-sm font-medium">Coordination & Follow-up</span>
                  <span className="font-bold text-slate-900">₱2,000</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-3 bg-purple-100 rounded border border-purple-300 mt-2">
              <span className="font-bold text-purple-900">Total Service Fee (Your Earnings)</span>
              <span className="font-bold text-purple-900 text-lg">₱10,000</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-100 rounded border border-slate-300">
              <span className="font-bold text-slate-900">Total Client Pays</span>
              <span className="font-bold text-slate-900 text-lg">₱18,800</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="text-sm font-bold text-emerald-900 mb-2">🎯 Your Earnings Per Visa:</p>
              <ul className="text-xs text-emerald-900 space-y-1">
                <li>✓ Total Service Fee = ₱10,000</li>
                <li>✓ Processing Time = ~15-30 days</li>
                <li>✓ Profit Margin = 53% on total client payment</li>
                <li className="font-bold text-emerald-700 border-t border-emerald-300 pt-1 mt-1">
                  💰 Net Earnings: ₱10,000 per visa application
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            🔐 Compliance & Legal Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {complianceChecklist.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded border border-red-100">
                <div className="flex gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="font-semibold text-slate-900 text-sm">{item.item}</p>
                </div>
                <p className="text-xs text-slate-600 ml-7">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-300">
            <p className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Disclaimers:</p>
            <ul className="text-xs text-yellow-900 space-y-1">
              <li>• Clearly state "Visa Assistance Only" - you are NOT a sponsor or guarantor</li>
              <li>• No approval guarantee - visa decision is entirely up to the embassy</li>
              <li>• Refund policy - specify what happens if visa is denied</li>
              <li>• Data protection - ensure client data is securely stored and compliant with privacy laws</li>
              <li>• Service agreement - always use a signed contract with clear terms</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, DollarSign, Calendar, BarChart3, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function VisaCRMSystem() {
  const [activeTab, setActiveTab] = useState("overview");

  const crmModules = [
    {
      name: "Client Management",
      icon: Users,
      color: "bg-blue-50 border-blue-300",
      fields: [
        { field: "Client ID", type: "Auto-generated", required: true },
        { field: "Full Name", type: "Text", required: true },
        { field: "Passport Number", type: "Text", required: true },
        { field: "Nationality", type: "Select", required: true },
        { field: "Contact Number", type: "Phone", required: true },
        { field: "Email", type: "Email", required: true },
        { field: "Travel History", type: "Text", required: false },
        { field: "Previous Visa Status", type: "Select", required: false }
      ]
    },
    {
      name: "Visa Case Management",
      icon: FileText,
      color: "bg-purple-50 border-purple-300",
      fields: [
        { field: "Case ID", type: "Auto-generated", required: true },
        { field: "Destination Country", type: "Select", required: true },
        { field: "Visa Type", type: "Select (Tourist/Business/Visit)", required: true },
        { field: "Travel Dates", type: "Date Range", required: true },
        { field: "Application Status", type: "Select", required: true, options: ["Inquiry", "Documents Pending", "Under Review", "Submitted", "Biometrics Done", "Approved", "Denied", "Released"] }
      ]
    },
    {
      name: "Document Tracker",
      icon: FileText,
      color: "bg-amber-50 border-amber-300",
      fields: [
        { field: "Passport", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Bank Certificate", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Bank Statement (3-6 months)", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "COE / Business Documents", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Income Tax Return (ITR)", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Flight Booking", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Hotel Booking", type: "Checkbox", status: "✔️/❌/🔄" },
        { field: "Travel Insurance", type: "Checkbox", status: "✔️/❌/🔄" }
      ]
    },
    {
      name: "Payment Tracking",
      icon: DollarSign,
      color: "bg-emerald-50 border-emerald-300",
      fields: [
        { field: "Embassy Fee", type: "Currency", required: true },
        { field: "GC Travel Service Fee", type: "Currency", required: true },
        { field: "Total Paid", type: "Auto-calculated", required: true },
        { field: "Payment Method", type: "Select (Cash/Card/Bank Transfer)", required: true },
        { field: "OR / Invoice Number", type: "Text", required: true },
        { field: "Payment Date", type: "Date", required: true },
        { field: "Profit per Case", type: "Auto-calculated", required: false }
      ]
    },
    {
      name: "Appointment Scheduler",
      icon: Calendar,
      color: "bg-rose-50 border-rose-300",
      fields: [
        { field: "Embassy / VAC Location", type: "Select", required: true },
        { field: "Appointment Date", type: "Date & Time", required: true },
        { field: "Biometrics Date", type: "Date & Time", required: false },
        { field: "Submission Date", type: "Date", required: true },
        { field: "Expected Decision Date", type: "Date", required: false },
        { field: "Appointment Confirmation #", type: "Text", required: false },
        { field: "Notes / Special Instructions", type: "Text Area", required: false }
      ]
    },
    {
      name: "Reporting Dashboard",
      icon: BarChart3,
      color: "bg-indigo-50 border-indigo-300",
      metrics: [
        { metric: "Approval Rate %", description: "Track visa approval success rate" },
        { metric: "Revenue by Country", description: "Total earnings per destination" },
        { metric: "Monthly Visa Sales", description: "Number of visas processed/earned" },
        { metric: "Top Destination", description: "Most requested visa country" },
        { metric: "Average Processing Time", description: "Days from inquiry to approval" },
        { metric: "Pending Documents", description: "Count of incomplete cases" }
      ]
    }
  ];

  const statusFlow = [
    { status: "Inquiry", icon: "📧", color: "bg-blue-100", description: "Initial client contact" },
    { status: "Documents Pending", icon: "📁", color: "bg-yellow-100", description: "Awaiting client documents" },
    { status: "Under Review", icon: "🔍", color: "bg-orange-100", description: "GC Travel reviewing docs" },
    { status: "Submitted", icon: "✉️", color: "bg-purple-100", description: "Application sent to embassy" },
    { status: "Biometrics Done", icon: "👆", color: "bg-pink-100", description: "Fingerprints/photos captured" },
    { status: "Approved", icon: "✅", color: "bg-green-100", description: "Visa approved by embassy" },
    { status: "Denied", icon: "❌", color: "bg-red-100", description: "Visa rejected" },
    { status: "Released", icon: "📕", color: "bg-slate-100", description: "Passport returned to client" }
  ];

  const automationRules = [
    {
      trigger: "Document Uploaded",
      action: "Update tracker status",
      automatedTask: "Mark document as ✔️ and notify reviewer"
    },
    {
      trigger: "All Documents Complete",
      action: "Send notification",
      automatedTask: "Alert admin to review and prepare application"
    },
    {
      trigger: "Status Changed to 'Submitted'",
      action: "Start countdown",
      automatedTask: "Begin processing time tracker"
    },
    {
      trigger: "Appointment Date Approaching",
      action: "Send reminder",
      automatedTask: "Email/SMS client 7 days & 1 day before appointment"
    },
    {
      trigger: "Decision Status Updated",
      action: "Update case & notify",
      automatedTask: "Mark as Approved/Denied and contact client"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">GC Travel Visa CRM System</h2>
        <p className="text-slate-600">Comprehensive internal case management for visa processing</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Modules Overview</TabsTrigger>
          <TabsTrigger value="status">Status Flow</TabsTrigger>
          <TabsTrigger value="automation">Automations</TabsTrigger>
          <TabsTrigger value="dashboard">Sample Dashboard</TabsTrigger>
        </TabsList>

        {/* Modules Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {crmModules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <Card key={idx} className={`border-2 ${module.color}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {module.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {module.fields ? (
                      <div className="space-y-2">
                        {module.fields.map((f, i) => (
                          <div key={i} className="p-2 bg-white rounded border border-slate-200 text-sm">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-slate-900">{f.field}</span>
                              {f.required && <span className="text-xs text-red-600 font-bold">*</span>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{f.type}</p>
                            {f.options && (
                              <p className="text-xs text-slate-500 mt-1">
                                Options: {f.options.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.metrics.map((m, i) => (
                          <div key={i} className="p-2 bg-white rounded border border-slate-200">
                            <p className="font-semibold text-slate-900 text-sm">{m.metric}</p>
                            <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Status Flow */}
        <TabsContent value="status">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Visa Case Status Flow</CardTitle>
              <p className="text-sm text-slate-600 mt-2">8-stage lifecycle from inquiry to release</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusFlow.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16">
                      <div className={`w-full p-3 rounded text-center font-bold ${item.color}`}>
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold text-slate-900">{item.status}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    {idx < statusFlow.length - 1 && (
                      <div className="absolute left-8 top-full h-8 w-0.5 bg-slate-300 -translate-x-1/2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Status Transition Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-slate-900 text-sm">Inquiry → Documents Pending</p>
                  <p className="text-xs text-slate-600 mt-1">Automatically triggered when client contact is established</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-slate-900 text-sm">Documents Pending → Under Review</p>
                  <p className="text-xs text-slate-600 mt-1">Manual transition when all documents are uploaded</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-slate-900 text-sm">Under Review → Submitted</p>
                  <p className="text-xs text-slate-600 mt-1">Manual transition when application is sent to embassy</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-slate-900 text-sm">Submitted → Approved/Denied/Biometrics Done</p>
                  <p className="text-xs text-slate-600 mt-1">Manual update based on embassy communication</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-slate-900 text-sm">Approved → Released</p>
                  <p className="text-xs text-slate-600 mt-1">Manual transition when visa is returned to client</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations */}
        <TabsContent value="automation">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Automated Workflows & Triggers
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">Systems that run automatically to reduce manual work</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule, idx) => (
                  <div key={idx} className="p-4 bg-white rounded border border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 text-xs">TRIGGER</span>
                          {rule.trigger}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          <span className="font-semibold">Action:</span> {rule.action}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="font-semibold">Automated Task:</span> {rule.automatedTask}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle>Reminders & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border border-amber-200">
                  <p className="font-semibold text-slate-900 text-sm">📧 Document Reminder</p>
                  <p className="text-xs text-slate-600 mt-1">Auto-send email to client 3 days after "Documents Pending" status if docs not uploaded</p>
                </div>
                <div className="p-3 bg-white rounded border border-amber-200">
                  <p className="font-semibold text-slate-900 text-sm">📅 Appointment Reminder</p>
                  <p className="text-xs text-slate-600 mt-1">Send SMS/Email 7 days and 1 day before scheduled appointment</p>
                </div>
                <div className="p-3 bg-white rounded border border-amber-200">
                  <p className="font-semibold text-slate-900 text-sm">⏰ Processing Delay Alert</p>
                  <p className="text-xs text-slate-600 mt-1">Alert admin if case is in "Submitted" status longer than expected processing time</p>
                </div>
                <div className="p-3 bg-white rounded border border-amber-200">
                  <p className="font-semibold text-slate-900 text-sm">🎉 Approval Notification</p>
                  <p className="text-xs text-slate-600 mt-1">Immediate SMS/Email to client when visa is approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sample Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-700">92.5%</p>
                  <p className="text-sm text-blue-600 mt-2">Approval Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-700">₱185K</p>
                  <p className="text-sm text-green-600 mt-2">Monthly Revenue</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-700">247</p>
                  <p className="text-sm text-purple-600 mt-2">Visas Processed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-700">🇯🇵</p>
                  <p className="text-sm text-amber-600 mt-2">Top Destination</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Visa Cases</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 font-semibold">Case ID</th>
                    <th className="text-left p-3 font-semibold">Client Name</th>
                    <th className="text-left p-3 font-semibold">Destination</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Service Fee</th>
                    <th className="text-left p-3 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "VS-001", name: "Maria Santos", dest: "Japan", status: "Approved", fee: "₱5,000", progress: 100 },
                    { id: "VS-002", name: "Juan Dela Cruz", dest: "USA", status: "Biometrics Done", fee: "₱10,000", progress: 70 },
                    { id: "VS-003", name: "Ana Garcia", dest: "Schengen", status: "Submitted", fee: "₱8,000", progress: 60 },
                    { id: "VS-004", name: "Carlos Reyes", dest: "Australia", status: "Under Review", fee: "₱7,000", progress: 40 },
                    { id: "VS-005", name: "Rosa Martinez", dest: "Canada", status: "Documents Pending", fee: "₱8,500", progress: 20 }
                  ].map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.id}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.dest}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          item.status === "Approved" ? "bg-green-100 text-green-800" :
                          item.status === "Denied" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-700">{item.fee}</td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Features Section */}
      <Card className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle>CRM Key Features & Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "Real-time Dashboard", desc: "Track all cases and metrics at a glance" },
              { icon: "🔔", title: "Smart Notifications", desc: "Automated reminders reduce follow-up time" },
              { icon: "📋", title: "Document Management", desc: "Centralized checklist tracking per case" },
              { icon: "💰", title: "Revenue Tracking", desc: "Profit calculation per case automatically" },
              { icon: "📅", title: "Appointment Sync", desc: "Embassy/VAC appointment scheduling integrated" },
              { icon: "📈", title: "Analytics Reports", desc: "Approval rates, revenue by country, trends" }
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-white rounded border border-slate-200">
                <p className="text-2xl mb-2">{feature.icon}</p>
                <p className="font-semibold text-slate-900 text-sm">{feature.title}</p>
                <p className="text-xs text-slate-600 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
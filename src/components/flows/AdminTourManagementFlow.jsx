import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Upload, Users, DollarSign, TrendingUp, FileText, RotateCcw, Database, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminTourManagementFlow() {
  const adminOperations = [
    {
      id: "add-tour",
      icon: Plus,
      title: "Add New Tour",
      color: "bg-blue-100 text-blue-900",
      description: "Create and list new tours",
      workflow: [
        { step: "1. Fill Tour Details", data: "Title, Destination, Duration, Description" },
        { step: "2. Set Net Rate", data: "Cost from supplier (₱8,000)" },
        { step: "3. Set Selling Price", data: "What customer sees (₱9,500)" },
        { step: "4. Add Itinerary", data: "Day-by-day breakdown" },
        { step: "5. Define Inclusions", data: "Meals, Transport, Activities" },
        { step: "6. Set Availability", data: "Departure dates and slots" },
        { step: "7. Publish Tour", data: "Goes live on platform" }
      ],
      systemFlow: "Tour entity created → Indexed for search → Displayed on website"
    },
    {
      id: "set-markup",
      icon: Settings,
      title: "Set Markup %",
      color: "bg-green-100 text-green-900",
      description: "Configure profit margins per tour",
      workflow: [
        { step: "1. Select Tour", data: "Choose which tour" },
        { step: "2. Set Default Markup", data: "₱500 - ₱2,000 per booking" },
        { step: "3. Create Seasons", data: "Peak (15%), Shoulder (10%), Off (8%)" },
        { step: "4. Set Min/Max Prices", data: "Floor: ₱8,500 | Ceiling: ₱12,000" },
        { step: "5. Apply Multiplier", data: "Group booking discounts" },
        { step: "6. Test Pricing", data: "Verify calculations" },
        { step: "7. Activate", data: "Changes apply immediately" }
      ],
      systemFlow: "PackageMarkupSettings entity → Applied per booking → Auto-calculated in checkout"
    },
    {
      id: "upload-rates",
      icon: Upload,
      title: "Upload Contract Rates",
      color: "bg-purple-100 text-purple-900",
      description: "Bulk import supplier pricing",
      workflow: [
        { step: "1. Get Contract File", data: "CSV/Excel from supplier" },
        { step: "2. Validate Format", data: "Check columns: Tour ID, Rate, Date" },
        { step: "3. Import Rates", data: "Bulk upload to system" },
        { step: "4. Map Suppliers", data: "Link rates to supplier" },
        { step: "5. Update Effective Date", data: "When rates take effect" },
        { step: "6. Preview Changes", data: "See impact on pricing" },
        { step: "7. Confirm & Deploy", data: "New rates go live" }
      ],
      systemFlow: "CSV upload → Parse & validate → Update Tour.price_per_person → Recalculate customer prices"
    },
    {
      id: "manage-supplier",
      icon: Users,
      title: "Manage Supplier",
      color: "bg-orange-100 text-orange-900",
      description: "Supplier relationships and contracts",
      workflow: [
        { step: "1. Add Supplier", data: "Name, Contact, Agreement Type" },
        { step: "2. Set Payment Terms", data: "Net 15, Net 30, Deposit" },
        { step: "3. Upload Contract", data: "Rate sheet, Ts&Cs" },
        { step: "4. Configure API", data: "API key, Webhook URL (if applicable)" },
        { step: "5. Set Commission %", data: "If commission model: 5-15%" },
        { step: "6. Assign Tours", data: "Link supplier to specific tours" },
        { step: "7. Monitor Performance", data: "Track confirmations, issues" }
      ],
      systemFlow: "SupplierCredentials entity → Linked to tours → Payment tracking via SupplierPayment"
    },
    {
      id: "monitor-payments",
      icon: DollarSign,
      title: "Monitor Payments",
      color: "bg-emerald-100 text-emerald-900",
      description: "Track customer and supplier payments",
      workflow: [
        { step: "1. View Pending Bookings", data: "Awaiting payment confirmation" },
        { step: "2. Check Stripe Webhooks", data: "Verify payment processing" },
        { step: "3. Match Payments", data: "Link stripe tx to bookings" },
        { step: "4. Update Status", data: "Mark as 'paid' in system" },
        { step: "5. Track Refunds", data: "Monitor refund requests" },
        { step: "6. Reconcile Daily", data: "Compare system vs bank" },
        { step: "7. Escalate Issues", data: "Flag fraud/failures" }
      ],
      systemFlow: "Payment table ← Stripe webhook → TourBooking.payment_status updated → PaymentSplit recorded"
    },
    {
      id: "track-commission",
      icon: TrendingUp,
      title: "Track Commission",
      color: "bg-pink-100 text-pink-900",
      description: "Monitor revenue and profit per booking",
      workflow: [
        { step: "1. View PaymentSplit", data: "See breakdown per booking" },
        { step: "2. Calculate Total", data: "Sum markup across all tours" },
        { step: "3. Filter by Period", data: "Daily, Weekly, Monthly, Yearly" },
        { step: "4. Group by Supplier", data: "Commission per supplier" },
        { step: "5. Calculate Margins", data: "(Profit / Revenue) × 100" },
        { step: "6. Export Data", data: "CSV for accounting" },
        { step: "7. Bonus Calculations", data: "Extra % if targets met" }
      ],
      systemFlow: "PaymentSplit entity → Query markup_amount → Dashboard totals → Reports generated"
    },
    {
      id: "generate-reports",
      icon: FileText,
      title: "Generate Reports",
      color: "bg-indigo-100 text-indigo-900",
      description: "Business intelligence and analytics",
      workflow: [
        { step: "1. Select Report Type", data: "Booking, Revenue, Commission, Supplier" },
        { step: "2. Pick Date Range", data: "Start and end dates" },
        { step: "3. Apply Filters", data: "By supplier, destination, tour type" },
        { step: "4. Aggregate Data", data: "Process entities and calculate KPIs" },
        { step: "5. Format Output", data: "PDF, Excel, or display on dashboard" },
        { step: "6. Add Insights", data: "Trends, top performers, issues" },
        { step: "7. Share/Export", data: "Email to stakeholders" }
      ],
      systemFlow: "Query TourBooking + PaymentSplit → Aggregate → Generate PDF/Excel → Store for audit"
    },
    {
      id: "issue-refunds",
      icon: RotateCcw,
      title: "Issue Refunds",
      color: "bg-red-100 text-red-900",
      description: "Process cancellations and refunds",
      workflow: [
        { step: "1. View Refund Request", data: "From customer or admin" },
        { step: "2. Check Cancellation Policy", data: "Full, partial, or non-refundable" },
        { step: "3. Calculate Refund Amount", data: "Gross - cancellation fees" },
        { step: "4. Approve/Deny", data: "Admin decision" },
        { step: "5. Initiate Refund", data: "Process via Stripe" },
        { step: "6. Notify Customer", data: "Email confirmation" },
        { step: "7. Update Records", data: "Mark as refunded, adjust supplier payment" }
      ],
      systemFlow: "Refund request → TourBooking.status = 'cancelled' → PaymentSplit.refund_status updated → Stripe refund triggered"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard - Tour Management</h2>
        <p className="text-slate-600">Internal operations for GC Travel admins to manage tours, pricing, suppliers, and commissions</p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Tours", value: "50+", icon: "🎫" },
          { label: "Total Commission", value: "₱125,000", icon: "💰" },
          { label: "Pending Bookings", value: "12", icon: "⏳" },
          { label: "Avg Markup", value: "₱1,500", icon: "📈" }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="text-center">
                <span className="text-3xl mb-2">{stat.icon}</span>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Operations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {adminOperations.map((op) => {
          const Icon = op.icon;
          return (
            <Card key={op.id} className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${op.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <CardTitle className="text-sm">{op.title}</CardTitle>
                </div>
                <p className="text-xs mt-1 opacity-80">{op.description}</p>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Detailed Workflows */}
      <div className="space-y-6">
        {adminOperations.map((op) => {
          const Icon = op.icon;
          return (
            <Card key={op.id} className="border-2">
              <CardHeader className={op.color}>
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <CardTitle>{op.title}</CardTitle>
                    <p className="text-sm mt-1 opacity-80">{op.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Workflow Steps */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Step-by-Step Process</h4>
                    <div className="space-y-3">
                      {op.workflow.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                              {i + 1}
                            </div>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium text-slate-900">{item.step}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.data}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Impact */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Backend System Flow</h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <code className="text-xs text-slate-700 leading-relaxed block font-mono">
                        {op.systemFlow}
                      </code>
                    </div>

                    {/* Related Entities */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Affected Entities</p>
                      <div className="space-y-2">
                        {op.id === "add-tour" && (
                          <>
                            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">Tour</div>
                            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">TourBooking</div>
                          </>
                        )}
                        {op.id === "set-markup" && (
                          <>
                            <div className="text-xs bg-green-50 p-2 rounded border border-green-100">PackageMarkupSettings</div>
                            <div className="text-xs bg-green-50 p-2 rounded border border-green-100">DynamicPrice</div>
                          </>
                        )}
                        {op.id === "upload-rates" && (
                          <>
                            <div className="text-xs bg-purple-50 p-2 rounded border border-purple-100">Tour</div>
                            <div className="text-xs bg-purple-50 p-2 rounded border border-purple-100">SupplierCredentials</div>
                          </>
                        )}
                        {op.id === "manage-supplier" && (
                          <>
                            <div className="text-xs bg-orange-50 p-2 rounded border border-orange-100">SupplierCredentials</div>
                            <div className="text-xs bg-orange-50 p-2 rounded border border-orange-100">SupplierPayment</div>
                          </>
                        )}
                        {op.id === "monitor-payments" && (
                          <>
                            <div className="text-xs bg-emerald-50 p-2 rounded border border-emerald-100">Payment</div>
                            <div className="text-xs bg-emerald-50 p-2 rounded border border-emerald-100">TourBooking</div>
                          </>
                        )}
                        {op.id === "track-commission" && (
                          <>
                            <div className="text-xs bg-pink-50 p-2 rounded border border-pink-100">PaymentSplit</div>
                            <div className="text-xs bg-pink-50 p-2 rounded border border-pink-100">TourBooking</div>
                          </>
                        )}
                        {op.id === "generate-reports" && (
                          <>
                            <div className="text-xs bg-indigo-50 p-2 rounded border border-indigo-100">TourBooking</div>
                            <div className="text-xs bg-indigo-50 p-2 rounded border border-indigo-100">PaymentSplit</div>
                          </>
                        )}
                        {op.id === "issue-refunds" && (
                          <>
                            <div className="text-xs bg-red-50 p-2 rounded border border-red-100">TourBooking</div>
                            <div className="text-xs bg-red-50 p-2 rounded border border-red-100">PaymentSplit</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Security & Permissions */}
      <Card className="mt-12 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Admin Access Control & Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Role-Based Permissions</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Super Admin:</strong> All operations</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Tour Manager:</strong> Add/edit tours, set markup</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Finance Admin:</strong> Payments, commissions, refunds</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Supplier Manager:</strong> Supplier details, contracts</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Audit & Compliance</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>All admin actions logged in AuditLog</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Timestamp, user, action, before/after values</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Reports accessible via AdminAuditLogs page</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>2FA required for sensitive operations</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
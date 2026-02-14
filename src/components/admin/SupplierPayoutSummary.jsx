import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { DollarSign, AlertCircle, CheckCircle, TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SupplierPayoutSummary() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["supplier-payments-summary"],
    queryFn: () => base44.entities.SupplierPayment.list("-created_date", 200),
  });

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    const pending = payments.filter(p => p.payment_status === "pending");
    const paid = payments.filter(p => p.payment_status === "paid");
    
    const pendingAmount = pending.reduce((sum, p) => sum + (p.supplier_amount || 0), 0);
    const paidAmount = paid.reduce((sum, p) => sum + (p.supplier_amount || 0), 0);
    const totalMarkup = payments.reduce((sum, p) => sum + (p.markup_retained || 0), 0);

    // Group by supplier
    const bySupplier = payments.reduce((acc, p) => {
      const supplier = p.supplier || "unknown";
      if (!acc[supplier]) {
        acc[supplier] = { pending: 0, paid: 0, count: 0 };
      }
      if (p.payment_status === "pending") {
        acc[supplier].pending += p.supplier_amount || 0;
      }
      if (p.payment_status === "paid") {
        acc[supplier].paid += p.supplier_amount || 0;
      }
      acc[supplier].count++;
      return acc;
    }, {});

    return {
      pendingCount: pending.length,
      paidCount: paid.length,
      pendingAmount,
      paidAmount,
      totalMarkup,
      bySupplier,
    };
  }, [payments]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₱{summary.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.pendingCount} payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₱{summary.paidAmount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.paidCount} payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Total Markup Retained
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₱{summary.totalMarkup.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your profit
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-500" />
              Total Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ₱{(summary.pendingAmount + summary.paidAmount).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {payments.length} total payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Supplier Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Supplier Breakdown
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Outstanding and paid amounts per supplier
            </p>
          </div>
          <Link to={createPageUrl("AdminSupplierPayments")}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(summary.bySupplier).map(([supplier, data]) => (
              <div
                key={supplier}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 capitalize">
                    {supplier}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.count} transactions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {data.pending > 0 && (
                    <div className="text-right">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Pending: ₱{data.pending.toLocaleString()}
                      </Badge>
                    </div>
                  )}
                  {data.paid > 0 && (
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Paid: ₱{data.paid.toLocaleString()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {Object.keys(summary.bySupplier).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No supplier payments recorded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
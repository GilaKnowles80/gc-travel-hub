import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function CommissionsTable({ commissions }) {
  const totalPending = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commission_amount, 0);
  const totalPaid = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commission_amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Commissions</CardTitle>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-slate-600">Pending:</span>
              <span className="font-bold ml-2">₱{totalPending.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-600">Paid:</span>
              <span className="font-bold ml-2 text-green-600">₱{totalPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Booking ID</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-right p-3 text-sm font-medium text-slate-600">Booking Value</th>
                <th className="text-right p-3 text-sm font-medium text-slate-600">Rate</th>
                <th className="text-right p-3 text-sm font-medium text-slate-600">Commission</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => (
                <tr key={commission.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-sm text-slate-600">
                    {moment(commission.created_date).format("MMM D, YYYY")}
                  </td>
                  <td className="p-3 text-sm font-mono text-slate-700">
                    {commission.booking_id?.substring(0, 8)}...
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{commission.booking_type}</Badge>
                  </td>
                  <td className="p-3 text-right text-sm text-slate-700">
                    ₱{commission.booking_value?.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-sm text-slate-600">
                    {commission.commission_rate}%
                  </td>
                  <td className="p-3 text-right font-bold text-amber-600">
                    ₱{commission.commission_amount?.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <Badge className={statusColors[commission.status]}>
                      {commission.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {commissions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No commissions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
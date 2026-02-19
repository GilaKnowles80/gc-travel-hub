import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import moment from "moment";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function SalesPerformanceChart({ leads, commissions }) {
  // Monthly leads trend
  const monthlyData = leads.reduce((acc, lead) => {
    const month = moment(lead.created_date).format("MMM YYYY");
    if (!acc[month]) {
      acc[month] = { month, total: 0, won: 0 };
    }
    acc[month].total++;
    if (lead.status === "won") acc[month].won++;
    return acc;
  }, {});

  const leadsChartData = Object.values(monthlyData).slice(-6);

  // Status distribution
  const statusData = leads.reduce((acc, lead) => {
    const status = lead.status || "unknown";
    if (!acc[status]) {
      acc[status] = { name: status, value: 0 };
    }
    acc[status].value++;
    return acc;
  }, {});

  const statusChartData = Object.values(statusData);

  // Commission trend
  const commissionData = commissions.reduce((acc, comm) => {
    const month = moment(comm.created_date).format("MMM YYYY");
    if (!acc[month]) {
      acc[month] = { month, amount: 0 };
    }
    acc[month].amount += comm.commission_amount || 0;
    return acc;
  }, {});

  const commissionChartData = Object.values(commissionData).slice(-6);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leads Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Total Leads" />
              <Bar dataKey="won" fill="#10b981" name="Won Leads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={commissionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} name="Commission (PHP)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
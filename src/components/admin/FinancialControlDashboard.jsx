import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Banknote, CreditCard } from "lucide-react";
import moment from "moment";

export default function FinancialControlDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const { data, isLoading } = useQuery({
    queryKey: ["financial-control", selectedPeriod],
    queryFn: async () => {
      const [payments, supplierPayments] = await Promise.all([
        base44.entities.Payment.filter({ status: "completed" }),
        base44.entities.SupplierPayment.list(),
      ]);

      const now = moment();
      const filterFn = (item) => {
        const d = moment(item.created_date);
        if (selectedPeriod === "today") return d.isSame(now, "day");
        if (selectedPeriod === "week") return d.isSame(now, "week");
        if (selectedPeriod === "month") return d.isSame(now, "month");
        return true; // all time
      };

      const filtered = payments.filter(filterFn);
      const totalReceived = filtered.reduce((s, p) => s + (p.amount || 0), 0);
      const gcProfit = totalReceived * 0.20;
      const supplierCost = totalReceived * 0.80;

      // Supplier breakdown
      const bySupplier = {};
      supplierPayments.filter(filterFn).forEach(sp => {
        const name = sp.supplier_name || "unknown";
        if (!bySupplier[name]) bySupplier[name] = { name, paid: 0, pending: 0, count: 0 };
        if (sp.payment_status === "paid") bySupplier[name].paid += sp.amount_due || 0;
        else bySupplier[name].pending += sp.amount_due || 0;
        bySupplier[name].count += 1;
      });

      // Daily summary for chart (last 7 days)
      const dailySummary = Array.from({ length: 7 }, (_, i) => {
        const day = moment().subtract(6 - i, "days");
        const dayPayments = payments.filter(p => moment(p.created_date).isSame(day, "day"));
        const dayTotal = dayPayments.reduce((s, p) => s + (p.amount || 0), 0);
        return {
          date: day.format("ddd DD"),
          revenue: dayTotal,
          profit: dayTotal * 0.20,
          supplierCost: dayTotal * 0.80,
        };
      });

      return {
        totalReceived,
        gcProfit,
        supplierCost,
        transactionCount: filtered.length,
        supplierBreakdown: Object.values(bySupplier),
        dailySummary,
        splitData: [
          { name: "GC Profit (20%)", value: gcProfit, color: "#22c55e" },
          { name: "Supplier Cost (80%)", value: supplierCost, color: "#3b82f6" },
        ],
      };
    },
  });

  const periods = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  const fmt = (n) => `₱${(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Control Dashboard</h2>
          <p className="text-slate-500 text-sm">80/20 Revenue Split — Stripe → GC Profit + Supplier Settlement</p>
        </div>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === p.key ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500">Total Received (Stripe)</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : fmt(data?.totalReceived)}</p>
            <p className="text-xs text-slate-500 mt-1">{data?.transactionCount || 0} transactions</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-green-200 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-xs text-green-700">GC Profit (20%)</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{isLoading ? "..." : fmt(data?.gcProfit)}</p>
            <p className="text-xs text-green-600 mt-1">→ Cash-in to GCash</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-200 rounded-lg flex items-center justify-center">
                <Banknote className="w-5 h-5 text-blue-700" />
              </div>
              <p className="text-xs text-blue-700">Supplier Cost (80%)</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{isLoading ? "..." : fmt(data?.supplierCost)}</p>
            <p className="text-xs text-blue-600 mt-1">→ Duffel / Amadeus / Sabre</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-200 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <p className="text-xs text-amber-700">Margin</p>
            </div>
            <p className="text-2xl font-bold text-amber-700">20%</p>
            <p className="text-xs text-amber-600 mt-1">Fixed GC Markup</p>
          </CardContent>
        </Card>
      </div>

      {/* GCash Info Banner */}
      <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-green-900 text-lg">💰 Your 20% Profit Destination</p>
              <p className="text-green-700 text-sm">Transfer from Stripe balance → Bank → GCash</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-green-600">Account Name</p>
                <p className="font-bold text-green-900">Gila Cain Knowles</p>
              </div>
              <div>
                <p className="text-xs text-green-600">GCash Number</p>
                <p className="font-bold text-green-900">+63-915-440-1150</p>
              </div>
              <div>
                <p className="text-xs text-green-600">Split</p>
                <p className="font-bold text-green-900">20% / transaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Split Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Split Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.totalReceived > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.splitData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.splitData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No transactions yet</div>
            )}
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs">GC Profit 20%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs">Supplier 80%</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Revenue Split (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.dailySummary || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="profit" stackId="a" fill="#22c55e" name="GC Profit (20%)" />
                <Bar dataKey="supplierCost" stackId="a" fill="#3b82f6" name="Supplier (80%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Breakdown */}
      {data?.supplierBreakdown?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Settlement Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.supplierBreakdown.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900 capitalize">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.count} booking(s)</p>
                  </div>
                  <div className="flex gap-4 text-sm text-right">
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-bold text-green-700">{fmt(s.paid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pending</p>
                      <p className="font-bold text-red-600">{fmt(s.pending)}</p>
                    </div>
                    <Badge className={s.pending > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                      {s.pending > 0 ? "Action Required" : "Settled"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Calculation */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">💼 Live Split Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <SplitCalculator />
        </CardContent>
      </Card>
    </div>
  );
}

function SplitCalculator() {
  const [amount, setAmount] = useState(100000);
  const profit = amount * 0.20;
  const supplier = amount * 0.80;
  const fmt = (n) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-600 mb-1 block">Customer Pays (₱)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value) || 0)}
          className="w-full md:w-64 border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-xs text-slate-500 mb-1">Total via Stripe</p>
          <p className="text-xl font-bold text-blue-800">{fmt(amount)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-400 text-center">
          <p className="text-xs text-green-600 mb-1">Your GCash Profit (20%)</p>
          <p className="text-2xl font-bold text-green-700">{fmt(profit)}</p>
          <p className="text-xs text-green-600 mt-1">Gila Cain Knowles</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-xs text-slate-500 mb-1">To Supplier (80%)</p>
          <p className="text-xl font-bold text-blue-800">{fmt(supplier)}</p>
          <p className="text-xs text-slate-500 mt-1">Duffel / Amadeus / Sabre</p>
        </div>
      </div>
    </div>
  );
}
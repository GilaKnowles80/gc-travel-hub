import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Plane, Globe, Wallet, Calendar, Loader2,
} from "lucide-react";
import moment from "moment";

const PH_KEYWORDS = [
  "philippines", "manila", "ceb", "cebu", "boracay", "palawan", "el nido",
  "puerto princesa", "bohol", "tagbilaran", "cagayan de oro", "cdo", "davao",
  "iloilo", "bacolod", "clark", "angeles", "kalibo", "roxas", "tacloban",
  "dumaguete", "siargao", "camiguin", "legazpi", "legaspi", "naga", "cauayan",
  "laoag", "zamboanga", "cotabato", "general santos", "gensan", "butuan",
  "surigao", "dipolog", "pagadian", "san jose", "busuanga", "coron",
  "puerto galera", "batangas", "subic", "vigan", "baguio", "tagaytay",
  "mactan", "mindoro", "ormoc", "tagum", "ilocos", "la union", "sagada",
  "banaue", "batanes", "basco", "caticlan", "panglao", "siquijor", "masbate",
  "catanduanes", "marinduque", "tablas", "romblon", "antique", "capiz",
  "negros", "panay", "leyte", "samal", "mnl", "crk", "klo", "ilo", "dgt",
  "tag", "bxu", "cgy", "dvo", "ges", "lapu", "cebu",
];

function isDomestic(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return PH_KEYWORDS.some((k) => lower.includes(k));
}

function monthKey(dateStr) {
  if (!dateStr) return null;
  const m = moment(dateStr);
  if (!m.isValid()) return null;
  return m.format("YYYY-MM");
}

function monthLabel(key) {
  return moment(key + "-01").format("MMM YY");
}

function isEarned(b) {
  if (b.payment_status === "paid" || b.payment_status === "partial") return true;
  if (b.status === "completed" || b.status === "confirmed") return true;
  return false;
}

function peso(n) {
  return "₱" + (n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
          </div>
          <div className={`rounded-xl p-3 ${accent === "text-amber-600" ? "bg-amber-50" : accent === "text-blue-600" ? "bg-blue-50" : accent === "text-emerald-600" ? "bg-emerald-50" : "bg-slate-50"}`}>
            <Icon className={`w-6 h-6 ${accent}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Earnings() {
  const [yearFilter, setYearFilter] = useState("all");

  const { data: records, isLoading } = useQuery({
    queryKey: ["earnings-overview"],
    queryFn: async () => {
      const [
        tours, flights, hotels, hotelMeta, ferries, buses, cars,
        tourBookings, cruiseBookings, trainBookings, packageBookings,
      ] = await Promise.all([
        base44.entities.Booking.list("-created_date", 500),
        base44.entities.FlightBooking.list("-created_date", 500),
        base44.entities.HotelBooking.list("-created_date", 500),
        base44.entities.Hotel.list("-created_date", 500),
        base44.entities.FerryBooking.list("-created_date", 500),
        base44.entities.BusBooking.list("-created_date", 500),
        base44.entities.CarRentalBooking.list("-created_date", 500),
        base44.entities.TourBooking.list("-created_date", 500).catch(() => []),
        base44.entities.CruiseBooking.list("-created_date", 500).catch(() => []),
        base44.entities.TrainBooking.list("-created_date", 500).catch(() => []),
        base44.entities.PackageBooking.list("-created_date", 500).catch(() => []),
      ]);

      const hotelMap = {};
      (hotelMeta || []).forEach((h) => { hotelMap[h.id] = h.location || ""; });

      const out = [];

      const push = (b, locationText, type) => {
        if (!isEarned(b)) return;
        const key = monthKey(b.created_date);
        if (!key) return;
        out.push({
          month: key,
          domestic: isDomestic(locationText),
          price: Number(b.total_price) || 0,
          type,
        });
      };

      tours.forEach((b) => push(b, b.destination, "Tour"));
      flights.forEach((b) => push(b, b.route, "Flight"));
      hotels.forEach((b) => push(b, hotelMap[b.hotel_id] || b.hotel_name || "", "Hotel"));
      ferries.forEach((b) => push(b, b.route, "Ferry"));
      buses.forEach((b) => push(b, b.route, "Bus"));
      cars.forEach((b) => push(b, b.pickup_location, "Car Rental"));
      (tourBookings || []).forEach((b) => push(b, b.destination || b.route || "", "Tour Booking"));
      (cruiseBookings || []).forEach((b) => push(b, b.route || b.destination || "", "Cruise"));
      (trainBookings || []).forEach((b) => push(b, b.route || b.destination || "", "Train"));
      (packageBookings || []).forEach((b) => push(b, b.destination || b.route || "", "Package"));

      return out;
    },
  });

  const availableYears = useMemo(() => {
    const years = new Set();
    (records || []).forEach((r) => years.add(r.month.substring(0, 4)));
    return Array.from(years).sort().reverse();
  }, [records]);

  const monthly = useMemo(() => {
    const map = {};
    (records || []).forEach((r) => {
      if (yearFilter !== "all" && !r.month.startsWith(yearFilter)) return;
      if (!map[r.month]) map[r.month] = { month: r.month, domestic: 0, international: 0 };
      if (r.domestic) map[r.month].domestic += r.price;
      else map[r.month].international += r.price;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [records, yearFilter]);

  const totals = useMemo(() => {
    let domestic = 0, international = 0;
    monthly.forEach((m) => { domestic += m.domestic; international += m.international; });
    return { domestic, international, total: domestic + international };
  }, [monthly]);

  const lastTotal = monthly.length ? monthly[monthly.length - 1].domestic + monthly[monthly.length - 1].international : 0;
  const prevTotal = monthly.length > 1 ? monthly[monthly.length - 2].domestic + monthly[monthly.length - 2].international : 0;
  const growth = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0;

  let cum = 0;
  const chartData = monthly.map((m) => {
    cum += m.domestic + m.international;
    return {
      month: monthLabel(m.month),
      Domestic: Math.round(m.domestic),
      International: Math.round(m.international),
      Cumulative: Math.round(cum),
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-slate-500">Loading earnings data…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-amber-500" />
            Monthly Earnings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Domestic vs international revenue across all booking types, grouped by month.
          </p>
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full md:w-44">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Domestic" value={peso(totals.domestic)} sub="Philippines bookings" accent="text-blue-600" />
        <StatCard icon={Plane} label="International" value={peso(totals.international)} sub="Overseas bookings" accent="text-amber-600" />
        <StatCard icon={Wallet} label="Total Earnings" value={peso(totals.total)} sub={`${monthly.length} months`} accent="text-emerald-600" />
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">MoM Growth</p>
                <p className={`mt-1 text-2xl font-bold ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-slate-400">vs last month</p>
              </div>
              <div className={`rounded-xl p-3 ${growth >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                {growth >= 0
                  ? <TrendingUp className="w-6 h-6 text-emerald-600" />
                  : <TrendingDown className="w-6 h-6 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No earnings data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => "₱" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                <Tooltip
                  formatter={(v) => peso(v)}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Legend />
                <Bar dataKey="Domestic" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="International" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Growth */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Cumulative Growth</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No data to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => "₱" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                <Tooltip formatter={(v) => peso(v)} contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Area type="monotone" dataKey="Cumulative" stroke="#10b981" strokeWidth={2} fill="url(#cumGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4 font-medium">Month</th>
                    <th className="py-2 pr-4 font-medium text-right">Domestic</th>
                    <th className="py-2 pr-4 font-medium text-right">International</th>
                    <th className="py-2 pr-4 font-medium text-right">Total</th>
                    <th className="py-2 font-medium text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, i) => {
                    const total = m.domestic + m.international;
                    const prev = i > 0 ? monthly[i - 1].domestic + monthly[i - 1].international : 0;
                    const g = prev > 0 ? ((total - prev) / prev) * 100 : null;
                    return (
                      <tr key={m.month} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-slate-700">{monthLabel(m.month)}</td>
                        <td className="py-2.5 pr-4 text-right text-blue-600">{peso(m.domestic)}</td>
                        <td className="py-2.5 pr-4 text-right text-amber-600">{peso(m.international)}</td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-slate-800">{peso(total)}</td>
                        <td className="py-2.5 text-right">
                          {g === null ? (
                            <span className="text-slate-300">—</span>
                          ) : g >= 0 ? (
                            <span className="text-emerald-600">+{g.toFixed(1)}%</span>
                          ) : (
                            <span className="text-red-500">{g.toFixed(1)}%</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-semibold text-slate-800">
                    <td className="py-3 pr-4">Total</td>
                    <td className="py-3 pr-4 text-right text-blue-600">{peso(totals.domestic)}</td>
                    <td className="py-3 pr-4 text-right text-amber-600">{peso(totals.international)}</td>
                    <td className="py-3 pr-4 text-right">{peso(totals.total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
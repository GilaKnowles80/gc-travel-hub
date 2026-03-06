import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Filter, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const BOOKING_TYPES = [
  { key: "FlightBooking", label: "Flight", color: "bg-blue-100 text-blue-700" },
  { key: "HotelBooking", label: "Hotel", color: "bg-purple-100 text-purple-700" },
  { key: "Booking", label: "Tour", color: "bg-green-100 text-green-700" },
  { key: "FerryBooking", label: "Ferry", color: "bg-cyan-100 text-cyan-700" },
  { key: "BusBooking", label: "Bus", color: "bg-orange-100 text-orange-700" },
  { key: "CarRentalBooking", label: "Car Rental", color: "bg-red-100 text-red-700" },
];

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
  refunded: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export default function FinancialSpreadsheet() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const fetches = BOOKING_TYPES.map(({ key, label }) =>
      base44.entities[key].list("-created_date", 500).then(items =>
        items.map(item => ({
          id: item.id,
          type: label,
          date: item.created_date,
          customer_name: item.passenger_name || item.customer_name || item.guest_name || item.driver_name || "—",
          customer_email: item.passenger_email || item.customer_email || item.guest_email || item.driver_email || "—",
          customer_phone: item.passenger_phone || item.customer_phone || item.guest_phone || item.driver_phone || "—",
          description: item.route || item.tour_title || item.hotel_name || item.flight_number || item.bus_company || item.car_type || "—",
          total_price: item.total_price || 0,
          supplier: item.supplier || "direct",
          supplier_amount: item.total_price ? Math.round(item.total_price * 0.75 * 100) / 100 : 0,
          agency_revenue: item.total_price ? Math.round(item.total_price * 0.25 * 100) / 100 : 0,
          payment_status: item.payment_status || "unpaid",
          booking_status: item.status || "pending",
          special_requests: item.special_requests || "",
        }))
      ).catch(() => [])
    );

    const results = await Promise.all(fetches);
    const combined = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
    setRows(combined);
    setLoading(false);
  }

  const filtered = rows.filter(r => {
    const matchSearch =
      !search ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.id.includes(search);
    const matchType = filterType === "all" || r.type === filterType;
    const matchStatus = filterStatus === "all" || r.payment_status === filterStatus;
    return matchSearch && matchType && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "amount_desc") return b.total_price - a.total_price;
    if (sortBy === "amount_asc") return a.total_price - b.total_price;
    return 0;
  });

  const totalRevenue = filtered.filter(r => r.payment_status === "paid").reduce((s, r) => s + r.total_price, 0);
  const agencyRevenue = filtered.filter(r => r.payment_status === "paid").reduce((s, r) => s + r.agency_revenue, 0);
  const supplierPayouts = filtered.filter(r => r.payment_status === "paid").reduce((s, r) => s + r.supplier_amount, 0);
  const unpaidTotal = filtered.filter(r => r.payment_status === "unpaid").reduce((s, r) => s + r.total_price, 0);

  function exportCSV() {
    const headers = ["Date","Type","Customer Name","Email","Phone","Description","Total (₱)","Supplier (75%)","Agency (25%)","Payment Status","Booking Status","Supplier","ID"];
    const csvRows = [headers.join(",")];
    filtered.forEach(r => {
      csvRows.push([
        r.date ? format(new Date(r.date), "yyyy-MM-dd") : "",
        r.type,
        `"${r.customer_name}"`,
        r.customer_email,
        r.customer_phone,
        `"${r.description}"`,
        r.total_price,
        r.supplier_amount,
        r.agency_revenue,
        r.payment_status,
        r.booking_status,
        r.supplier,
        r.id,
      ].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GC-Travel-Financial-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total Collected</p>
            <p className="text-2xl font-bold text-green-700">₱{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-1">{filtered.filter(r => r.payment_status === "paid").length} paid bookings</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Agency Revenue (25%)</p>
            <p className="text-2xl font-bold text-amber-700">₱{agencyRevenue.toLocaleString()}</p>
            <TrendingUp className="w-4 h-4 text-amber-500 mt-1" />
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Supplier Payouts (75%)</p>
            <p className="text-2xl font-bold text-blue-700">₱{supplierPayouts.toLocaleString()}</p>
            <TrendingDown className="w-4 h-4 text-blue-500 mt-1" />
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Unpaid / Pending</p>
            <p className="text-2xl font-bold text-red-700">₱{unpaidTotal.toLocaleString()}</p>
            <p className="text-xs text-red-500 mt-1">{filtered.filter(r => r.payment_status === "unpaid").length} bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Financial Ledger — All Bookings
              <Badge className="bg-slate-100 text-slate-600">{filtered.length} records</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={exportCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by name, email, booking..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {BOOKING_TYPES.map(t => <SelectItem key={t.key} value={t.label}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spreadsheet Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Date</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Type</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Customer</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Phone</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Booking Details</th>
                  <th className="px-3 py-3 text-right whitespace-nowrap">Total (₱)</th>
                  <th className="px-3 py-3 text-right whitespace-nowrap">Supplier 75%</th>
                  <th className="px-3 py-3 text-right whitespace-nowrap">Agency 25%</th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">Payment</th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-12 text-slate-400">Loading financial data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-12 text-slate-400">No records found</td></tr>
                ) : (
                  filtered.map((row, i) => {
                    const typeInfo = BOOKING_TYPES.find(t => t.label === row.type);
                    return (
                      <tr key={row.id} className={i % 2 === 0 ? "bg-white hover:bg-amber-50/40" : "bg-slate-50/50 hover:bg-amber-50/40"} style={{ transition: "background 0.1s" }}>
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">
                          {row.date ? format(new Date(row.date), "MM/dd/yyyy") : "—"}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Badge className={`text-xs ${typeInfo?.color || "bg-slate-100 text-slate-600"}`}>{row.type}</Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-800 text-xs">{row.customer_name}</div>
                          <div className="text-slate-400 text-xs">{row.customer_email}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{row.customer_phone}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[180px] truncate">{row.description}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800 whitespace-nowrap">
                          ₱{row.total_price.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right text-blue-600 whitespace-nowrap">
                          ₱{row.supplier_amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right text-amber-600 font-medium whitespace-nowrap">
                          ₱{row.agency_revenue.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[row.payment_status] || "bg-slate-100 text-slate-600"}`}>
                            {row.payment_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[row.booking_status] || "bg-slate-100 text-slate-600"}`}>
                            {row.booking_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs capitalize">{row.supplier}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="bg-slate-800 text-white text-xs font-semibold">
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-right uppercase tracking-wide">TOTALS ({filtered.length} records)</td>
                    <td className="px-3 py-3 text-right">₱{filtered.reduce((s, r) => s + r.total_price, 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-blue-300">₱{filtered.reduce((s, r) => s + r.supplier_amount, 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-amber-300">₱{filtered.reduce((s, r) => s + r.agency_revenue, 0).toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
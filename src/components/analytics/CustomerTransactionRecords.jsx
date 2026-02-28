import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Receipt, Calendar, Phone, Mail, ChevronDown, ChevronUp, Download, Shield } from "lucide-react";
import moment from "moment";

const TWO_YEARS_AGO = moment().subtract(2, "years").toISOString();

const BOOKING_TYPES = [
  { label: "All Types", value: "all" },
  { label: "Flight", value: "flight" },
  { label: "Hotel", value: "hotel" },
  { label: "Tour", value: "tour" },
  { label: "Bus", value: "bus" },
  { label: "Ferry", value: "ferry" },
  { label: "Train", value: "train" },
  { label: "Car Rental", value: "car_rental" },
  { label: "Cruise", value: "cruise" },
  { label: "Visa", value: "visa" },
];

function getReferenceNumber(record, type) {
  return (
    record.supplier_reference ||
    record.payment_provider_id ||
    record.stripe_session_id ||
    record.stripe_payment_intent ||
    record.booking_reference ||
    record.id?.substring(0, 12).toUpperCase()
  );
}

function getCustomerName(record) {
  return record.passenger_name || record.guest_name || record.applicant_name || record.user_email || "—";
}
function getCustomerEmail(record) {
  return record.passenger_email || record.guest_email || record.applicant_email || record.user_email || "—";
}
function getCustomerPhone(record) {
  return record.passenger_phone || record.guest_phone || record.applicant_phone || "—";
}
function getRoute(record, type) {
  if (type === "flight") return record.route || `${record.origin || "?"} → ${record.destination || "?"}`;
  if (type === "hotel") return record.hotel_name || "—";
  if (type === "bus") return `${record.origin_terminal || "?"} → ${record.destination_terminal || "?"}`;
  if (type === "ferry") return `${record.origin_port || "?"} → ${record.destination_port || "?"}`;
  if (type === "train") return `${record.origin_station || "?"} → ${record.destination_station || "?"}`;
  if (type === "car_rental") return record.car_model || record.vehicle || "—";
  if (type === "cruise") return record.cruise_line || record.itinerary_name || "—";
  if (type === "visa") return record.country || "—";
  return record.tour_title || "—";
}

function statusColor(status) {
  const map = {
    confirmed: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export default function CustomerTransactionRecords() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const { data: allRecords = [], isLoading } = useQuery({
    queryKey: ["customer-transaction-records"],
    queryFn: async () => {
      const [flights, hotels, tours, buses, ferries, trains, cars, cruises, visas, payments] = await Promise.all([
        base44.entities.FlightBooking.list("-created_date", 500),
        base44.entities.HotelBooking.list("-created_date", 500),
        base44.entities.Booking.list("-created_date", 500),
        base44.entities.BusBooking.list("-created_date", 500),
        base44.entities.FerryBooking.list("-created_date", 500),
        base44.entities.TrainBooking.list("-created_date", 500),
        base44.entities.CarRentalBooking.list("-created_date", 500),
        base44.entities.CruiseBooking.list("-created_date", 500),
        base44.entities.VisaAppointment.list("-created_date", 500),
        base44.entities.Payment.list("-created_date", 500),
      ]);

      const tagged = [
        ...flights.map(r => ({ ...r, _type: "flight" })),
        ...hotels.map(r => ({ ...r, _type: "hotel" })),
        ...tours.map(r => ({ ...r, _type: "tour" })),
        ...buses.map(r => ({ ...r, _type: "bus" })),
        ...ferries.map(r => ({ ...r, _type: "ferry" })),
        ...trains.map(r => ({ ...r, _type: "train" })),
        ...cars.map(r => ({ ...r, _type: "car_rental" })),
        ...cruises.map(r => ({ ...r, _type: "cruise" })),
        ...visas.map(r => ({ ...r, _type: "visa" })),
      ];

      // Only keep last 2 years
      const cutoff = moment().subtract(2, "years");
      const filtered = tagged.filter(r => moment(r.created_date).isAfter(cutoff));

      // Enrich with payment info
      const paymentMap = {};
      payments.forEach(p => { paymentMap[p.booking_id] = p; });
      return filtered.map(r => ({ ...r, _payment: paymentMap[r.id] || null }));
    }
  });

  const filtered = allRecords.filter(r => {
    if (typeFilter !== "all" && r._type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      getCustomerName(r).toLowerCase().includes(q) ||
      getCustomerEmail(r).toLowerCase().includes(q) ||
      getCustomerPhone(r).includes(q) ||
      getReferenceNumber(r)?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q) ||
      getRoute(r, r._type).toLowerCase().includes(q)
    );
  }).sort((a, b) => moment(b.created_date).diff(moment(a.created_date)));

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const headers = ["Date", "Type", "Customer Name", "Email", "Phone", "Route/Service", "Reference No.", "Amount", "Status"];
    const rows = filtered.map(r => [
      moment(r.created_date).format("YYYY-MM-DD HH:mm"),
      r._type,
      getCustomerName(r),
      getCustomerEmail(r),
      getCustomerPhone(r),
      getRoute(r, r._type),
      getReferenceNumber(r),
      r.total_price || r._payment?.amount || "—",
      r.status || r._payment?.status || "—"
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customer_transactions.csv"; a.click();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Records retained for <strong>2 years</strong> from transaction date for complaints backtracking and compliance purposes.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search by name, email, phone, reference no., route..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{BOOKING_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="text-sm text-slate-500 mb-3">{filtered.length} records found</div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No records found.</div>
      ) : (
        <div className="space-y-2">
          {paginated.map((record) => {
            const isExpanded = expandedRow === record.id;
            const ref = getReferenceNumber(record);
            const amount = record.total_price || record._payment?.amount;
            return (
              <Card key={record.id} className="overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedRow(isExpanded ? null : record.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{getCustomerName(record)}</span>
                      <Badge variant="outline" className="text-xs capitalize">{record._type?.replace("_", " ")}</Badge>
                      <Badge className={`text-xs ${statusColor(record.status)}`}>{record.status || "—"}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Receipt className="w-3 h-3" />{ref}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{moment(record.created_date).format("MMM DD, YYYY")}</span>
                      <span>{getRoute(record, record._type)}</span>
                      {amount && <span className="font-medium text-slate-700">₱{Number(amount).toLocaleString()}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <CardContent className="border-t bg-slate-50 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Customer Details</p>
                        <p className="flex items-center gap-2 text-slate-600"><Mail className="w-3 h-3" />{getCustomerEmail(record)}</p>
                        <p className="flex items-center gap-2 text-slate-600 mt-1"><Phone className="w-3 h-3" />{getCustomerPhone(record)}</p>
                        {record.passport_number && <p className="text-slate-600 mt-1">Passport: {record.passport_number}</p>}
                        {record.date_of_birth && <p className="text-slate-600 mt-1">DOB: {record.date_of_birth}</p>}
                        {record.nationality && <p className="text-slate-600 mt-1">Nationality: {record.nationality}</p>}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Booking Details</p>
                        <p className="text-slate-600">Type: <span className="capitalize">{record._type?.replace("_", " ")}</span></p>
                        <p className="text-slate-600">Route/Service: {getRoute(record, record._type)}</p>
                        {record.cabin_class && <p className="text-slate-600">Class: {record.cabin_class}</p>}
                        {record.number_of_passengers && <p className="text-slate-600">Passengers: {record.number_of_passengers}</p>}
                        {record.check_in_date && <p className="text-slate-600">Check-in: {record.check_in_date}</p>}
                        {record.check_out_date && <p className="text-slate-600">Check-out: {record.check_out_date}</p>}
                        {record.special_requests && <p className="text-slate-600 mt-1">Notes: {record.special_requests}</p>}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-2">Payment & References</p>
                        <p className="text-slate-600">Ref No.: <span className="font-mono font-medium">{ref}</span></p>
                        <p className="text-slate-600">Record ID: <span className="font-mono text-xs">{record.id}</span></p>
                        {record._payment?.stripe_session_id && <p className="text-slate-600 text-xs mt-1">Stripe Session: {record._payment.stripe_session_id}</p>}
                        {record._payment?.stripe_payment_intent && <p className="text-slate-600 text-xs mt-1">Payment Intent: {record._payment.stripe_payment_intent}</p>}
                        {record._payment?.payment_method && <p className="text-slate-600 mt-1">Method: {record._payment.payment_method}</p>}
                        {record._payment?.receipt_url && (
                          <a href={record._payment.receipt_url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs mt-1 block">View Receipt</a>
                        )}
                        <p className="text-slate-600 mt-1">Status: <span className="capitalize">{record.status || "—"}</span></p>
                        {amount && <p className="text-slate-800 font-bold mt-1">Total: ₱{Number(amount).toLocaleString()}</p>}
                        <p className="text-xs text-slate-400 mt-2">Created: {moment(record.created_date).format("MMM DD, YYYY HH:mm")}</p>
                        <p className="text-xs text-slate-400">Expires from records: {moment(record.created_date).add(2, "years").format("MMM DD, YYYY")}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
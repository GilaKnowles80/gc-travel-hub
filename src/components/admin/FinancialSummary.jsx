import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle, TrendingUp, Percent } from "lucide-react";

// Markup applied to booking types that don't store a supplier cost (matches the
// existing 12% convention used elsewhere in the admin dashboard).
const NON_FLIGHT_MARKUP = 0.12;

const TINTS = {
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
};

export default function FinancialSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-financial-summary"],
    queryFn: async () => {
      const [
        flightBookings,
        hotelBookings,
        tourBookings,
        trainBookings,
        ferryBookings,
        busBookings,
        carBookings,
        packages,
      ] = await Promise.all([
        base44.entities.FlightBooking.list(),
        base44.entities.HotelBooking.list(),
        base44.entities.TourBooking.list(),
        base44.entities.TrainBooking.list(),
        base44.entities.FerryBooking.list(),
        base44.entities.BusBooking.list(),
        base44.entities.CarRentalBooking.list(),
        base44.entities.PackageBooking.list(),
      ]);
      return [
        ...flightBookings,
        ...hotelBookings,
        ...tourBookings,
        ...trainBookings,
        ...ferryBookings,
        ...busBookings,
        ...carBookings,
        ...packages,
      ];
    },
  });

  const bookings = data || [];
  const now = new Date();
  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  const monthBookings = bookings.filter((b) => {
    if (!b.created_date) return false;
    const d = new Date(b.created_date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const paidOrConfirmed = (b) =>
    b.payment_status === "paid" || b.status === "confirmed";
  const paidThisMonth = monthBookings.filter(paidOrConfirmed);

  const monthlyRevenue = paidThisMonth.reduce(
    (s, b) => s + (b.total_price || b.final_price || 0),
    0
  );
  const monthlyConfirmedCount = monthBookings.filter(
    (b) => b.status === "confirmed"
  ).length;

  // Profit: real markup where a supplier fare is stored (flights), else the
  // standard markup on the booking total.
  const monthlyProfit = paidThisMonth.reduce((s, b) => {
    const price = b.total_price || b.final_price || 0;
    if (typeof b.supplier_fare === "number" && b.supplier_fare > 0) {
      return s + Math.max(0, price - b.supplier_fare);
    }
    return s + price * NON_FLIGHT_MARKUP;
  }, 0);

  const profitMargin =
    monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  const fmt = (n) => `₱${Math.round(n).toLocaleString()}`;

  const cards = [
    {
      title: "Monthly Revenue",
      value: fmt(monthlyRevenue),
      sub: monthLabel,
      icon: DollarSign,
      tint: "green",
    },
    {
      title: "Confirmed Bookings",
      value: monthlyConfirmedCount,
      sub: "this month",
      icon: CheckCircle,
      tint: "blue",
    },
    {
      title: "Est. Profit",
      value: fmt(monthlyProfit),
      sub: "this month",
      icon: TrendingUp,
      tint: "emerald",
    },
    {
      title: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      sub: "of monthly revenue",
      icon: Percent,
      tint: "amber",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-slate-900">
            Financial Performance — {monthLabel}
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 p-4 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{c.title}</p>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${TINTS[c.tint]}`}
                  >
                    <c.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {c.value}
                </p>
                <p className="text-xs text-slate-400 mt-1 capitalize">{c.sub}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
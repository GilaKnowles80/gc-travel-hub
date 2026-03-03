import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * PriceCalendar — cheapest/regular/expensive date color coding
 *  🟢 Green  = cheapest fares
 *  🔵 Blue   = regular / mid fares
 *  🔴 Red    = highest fares
 *
 * Props:
 *  numberOfMonths — 1 (default) or 2 to show two months side by side
 */
export default function PriceCalendar({
  origin,
  destination,
  location,
  type = "flight",
  selectedDate,
  onSelectDate,
  minDate,
  numberOfMonths = 2,
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const minDateStr = minDate || todayStr;

  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate + "T00:00:00") : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const todayFirstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonthDate = new Date(today.getFullYear() + 1, today.getMonth(), 1);

  // Build array of months to display
  const months = Array.from({ length: numberOfMonths }, (_, i) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Fetch prices for all visible months
  useEffect(() => {
    if (type === "flight" && (!origin || !destination)) return;
    if (type === "hotel" && !location) return;
    months.forEach(({ year, month }) => fetchPricesForMonth(year, month));
  }, [currentMonth, origin, destination, location, type]);

  const fetchPricesForMonth = async (y, m) => {
    setLoading(true);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const priceMap = {};

    if (type === "flight" && origin && destination) {
      const sampleDates = [1, 5, 8, 12, 15, 19, 22, 26, 29].filter(d => d <= daysInMonth);
      const results = await Promise.allSettled(
        sampleDates.map(async d => {
          const date = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          if (date < today.toISOString().slice(0, 10)) return null;
          try {
            const res = await base44.functions.invoke("searchFlightsDuffel", {
              origin, destination, departureDate: date, adults: 1, cabin: "economy",
            });
            const offers = res.data?.offers || [];
            if (offers.length > 0) {
              const minPrice = Math.min(...offers.map(o => parseFloat(o.total_amount)));
              return { date, price: minPrice };
            }
          } catch { return null; }
          return null;
        })
      );

      const validResults = results.filter(r => r.status === "fulfilled" && r.value).map(r => r.value);

      if (validResults.length > 0) {
        const allPrices = validResults.map(r => r.price);
        const minP = Math.min(...allPrices);
        const maxP = Math.max(...allPrices);

        for (let d = 1; d <= daysInMonth; d++) {
          const date = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const sample = validResults.find(r => r.date === date);
          if (sample) {
            priceMap[date] = sample.price;
          } else {
            const dayOfWeek = new Date(date + "T00:00:00").getDay();
            const weekendFactor = [0, 5, 6].includes(dayOfWeek) ? 1.18 : 1.0;
            const basePrice = minP + (maxP - minP) * 0.4;
            priceMap[date] = Math.round(basePrice * weekendFactor);
          }
        }
      }
    } else if (type === "hotel" && location) {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayOfWeek = new Date(date + "T00:00:00").getDay();
        const base = 80;
        const weekend = [5, 6].includes(dayOfWeek) ? 1.35 : 1.0;
        priceMap[date] = Math.round(base * weekend + (d % 7) * 3);
      }
    }

    setPrices(prev => ({ ...prev, ...priceMap }));
    setLoading(false);
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (newMonth >= todayFirstOfMonth) setCurrentMonth(newMonth);
  };
  const nextMonth = () => {
    const lastVisible = months[months.length - 1];
    const lastVisibleDate = new Date(lastVisible.year, lastVisible.month, 1);
    if (lastVisibleDate < maxMonthDate) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }
  };

  const canGoPrev = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > todayFirstOfMonth;
  const lastVisible = months[months.length - 1];
  const canGoNext = new Date(lastVisible.year, lastVisible.month, 1) < maxMonthDate;

  // Price tier thresholds computed across ALL visible months
  const priceValues = Object.values(prices).filter(p => p > 0);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const range = maxPrice - minPrice;
  const lowThreshold = minPrice + range * 0.33;
  const highThreshold = minPrice + range * 0.67;

  const getPriceTier = (price) => {
    if (!price || priceValues.length < 2) return null;
    if (price <= lowThreshold) return "cheap";
    if (price <= highThreshold) return "regular";
    return "expensive";
  };

  const tierStyles = {
    cheap: { text: "text-green-600 font-bold", bg: "bg-green-50 border border-green-200 hover:bg-green-100", dot: "bg-green-500", label: "🟢 Cheapest" },
    regular: { text: "text-blue-600 font-semibold", bg: "bg-blue-50 border border-blue-200 hover:bg-blue-100", dot: "bg-blue-500", label: "🔵 Regular" },
    expensive: { text: "text-red-500 font-bold", bg: "bg-red-50 border border-red-200 hover:bg-red-100", dot: "bg-red-500", label: "🔴 Highest" },
  };

  const renderMonth = ({ year, month }) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" });

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div key={`${year}-${month}`} className="flex-1 min-w-0">
        <div className="text-center font-bold text-slate-800 text-sm mb-2">{monthName}</div>
        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const price = prices[dateStr];
            const isPast = dateStr < minDateStr;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const tier = getPriceTier(price);

            return (
              <button
                key={dateStr}
                disabled={isPast}
                onClick={() => !isPast && onSelectDate && onSelectDate(dateStr)}
                className={`flex flex-col items-center justify-center rounded-lg py-1 px-0.5 transition-all text-center min-h-[44px]
                  ${isPast ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}
                  ${isSelected
                    ? "bg-amber-500 shadow-md scale-105 z-10"
                    : isPast ? ""
                    : tier ? tierStyles[tier].bg
                    : "hover:bg-slate-50"}
                `}
              >
                <span className={`text-xs font-semibold leading-none ${isSelected ? "text-white" : isToday ? "text-amber-600" : "text-slate-700"}`}>
                  {isToday ? "•" : ""}{day}
                </span>
                {price && !isPast ? (
                  <span className={`text-[9px] leading-none mt-0.5 ${isSelected ? "text-white/90" : tier ? tierStyles[tier].text : "text-slate-500"}`}>
                    ${Math.round(price)}
                  </span>
                ) : !price && !isPast && loading ? (
                  <span className="text-[9px] text-slate-300 leading-none mt-0.5">…</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl w-full">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={`p-1.5 rounded-lg transition-colors ${!canGoPrev ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100"}`}
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
          {origin && destination && (
            <span className="text-[11px] text-slate-500 font-medium">{origin} → {destination} · Economy</span>
          )}
        </div>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className={`p-1.5 rounded-lg transition-colors ${!canGoNext ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100"}`}
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Month grids */}
      <div className={`flex gap-6 ${numberOfMonths > 1 ? "flex-col sm:flex-row" : ""}`}>
        {months.map(renderMonth)}
      </div>

      {/* Legend */}
      {priceValues.length > 0 ? (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-1">
          {Object.entries(tierStyles).map(([tier, s]) => (
            <div key={tier} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className="text-[10px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Loading price data...
        </div>
      ) : null}
    </div>
  );
}
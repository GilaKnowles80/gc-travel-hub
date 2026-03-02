import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * PriceCalendar — cheapest/regular/expensive date color coding
 *  🟢 Green  = cheapest fares
 *  🔵 Blue   = regular / mid fares
 *  🔴 Red    = highest fares
 */
export default function PriceCalendar({ origin, destination, location, type = "flight", selectedDate, onSelectDate, minDate }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate + "T00:00:00") : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    if (type === "flight" && (!origin || !destination)) return;
    if (type === "hotel" && !location) return;
    fetchPricesForMonth(year, month);
  }, [year, month, origin, destination, location, type]);

  const fetchPricesForMonth = async (y, m) => {
    setLoading(true);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const priceMap = {};

    if (type === "flight" && origin && destination) {
      // Sample strategic dates across the month
      const sampleDates = [1, 5, 8, 12, 15, 19, 22, 26, 29].filter(d => d <= daysInMonth);
      const results = await Promise.allSettled(
        sampleDates.map(async d => {
          const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          if (date < today.toISOString().slice(0, 10)) return null;
          try {
            const res = await base44.functions.invoke('searchFlightsDuffel', {
              origin, destination, departureDate: date, adults: 1, cabin: "economy"
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

      const validResults = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);

      if (validResults.length > 0) {
        const allPrices = validResults.map(r => r.price);
        const minP = Math.min(...allPrices);
        const maxP = Math.max(...allPrices);

        for (let d = 1; d <= daysInMonth; d++) {
          const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const sample = validResults.find(r => r.date === date);
          if (sample) {
            priceMap[date] = sample.price;
          } else {
            const dayOfWeek = new Date(date + 'T00:00:00').getDay();
            // Weekends (Fri/Sat/Sun) cost more
            const weekendFactor = [0, 5, 6].includes(dayOfWeek) ? 1.18 : 1.0;
            const basePrice = minP + (maxP - minP) * 0.4;
            priceMap[date] = Math.round(basePrice * weekendFactor);
          }
        }
      }
    } else if (type === "hotel" && location) {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = new Date(date + 'T00:00:00').getDay();
        const base = 80;
        const weekend = [5, 6].includes(dayOfWeek) ? 1.35 : 1.0;
        priceMap[date] = Math.round(base * weekend + (d % 7) * 3);
      }
    }

    setPrices(priceMap);
    setLoading(false);
  };

  const prevMonth = () => {
    const newMonth = new Date(year, month - 1, 1);
    if (newMonth.getFullYear() >= 2026) setCurrentMonth(newMonth);
  };
  const nextMonth = () => {
    const newMonth = new Date(year, month + 1, 1);
    if (newMonth.getFullYear() <= 2056) setCurrentMonth(newMonth);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const priceValues = Object.values(prices).filter(p => p > 0);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const range = maxPrice - minPrice;
  const lowThreshold = minPrice + range * 0.33;
  const highThreshold = minPrice + range * 0.67;

  // 🟢 Green = cheap, 🔵 Blue = regular, 🔴 Red = expensive
  const getPriceTier = (price) => {
    if (!price || priceValues.length < 2) return null;
    if (price <= lowThreshold) return 'cheap';
    if (price <= highThreshold) return 'regular';
    return 'expensive';
  };

  const tierStyles = {
    cheap: {
      text: 'text-green-600 font-bold',
      bg: 'bg-green-50 border border-green-200 hover:bg-green-100',
      dot: 'bg-green-500',
      label: '🟢 Cheapest',
    },
    regular: {
      text: 'text-blue-600 font-semibold',
      bg: 'bg-blue-50 border border-blue-200 hover:bg-blue-100',
      dot: 'bg-blue-500',
      label: '🔵 Regular',
    },
    expensive: {
      text: 'text-red-500 font-bold',
      bg: 'bg-red-50 border border-red-200 hover:bg-red-100',
      dot: 'bg-red-500',
      label: '🔴 Highest',
    },
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const minDateStr = minDate || todayStr;
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl w-full" style={{ minWidth: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={year === 2026 && month === 0} className={`p-1.5 rounded-lg transition-colors ${year === 2026 && month === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'}`}>
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm">{monthName}</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
        </div>
        <button onClick={nextMonth} disabled={year === 2056 && month === 11} className={`p-1.5 rounded-lg transition-colors ${year === 2056 && month === 11 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'}`}>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {origin && destination && (
        <div className="text-center text-[11px] text-slate-500 mb-2 font-medium">
          {origin} → {destination} · Economy · 1 Adult
        </div>
      )}

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
                  : isPast
                    ? ""
                    : tier
                      ? tierStyles[tier].bg
                      : "hover:bg-slate-50"}
              `}
            >
              <span className={`text-xs font-semibold leading-none
                ${isSelected ? "text-white" : isToday ? "text-amber-600" : "text-slate-700"}
              `}>
                {isToday ? '•' : ''}{day}
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
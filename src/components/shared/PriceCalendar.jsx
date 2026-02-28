import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * PriceCalendar - shows cheapest/expensive dates with color indicators
 * Props:
 *   origin, destination - for flights (IATA codes)
 *   location - for hotels
 *   type - "flight" | "hotel"
 *   selectedDate - currently selected date (YYYY-MM-DD)
 *   onSelectDate - callback(dateString)
 */
export default function PriceCalendar({ origin, destination, location, type = "flight", selectedDate, onSelectDate }) {
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
      // Sample a few dates to get price range indication
      const sampleDates = [1, 8, 15, 22].filter(d => d <= daysInMonth);
      const results = await Promise.allSettled(
        sampleDates.map(async d => {
          const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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
      
      // Interpolate prices for all days based on sampled data
      if (validResults.length > 0) {
        const prices = validResults.map(r => r.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);

        // Assign interpolated prices with slight variation per day
        for (let d = 1; d <= daysInMonth; d++) {
          const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const sample = validResults.find(r => r.date === date);
          if (sample) {
            priceMap[date] = sample.price;
          } else {
            // Interpolate with slight daily variation
            const dayOfWeek = new Date(date + 'T00:00:00').getDay();
            const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) ? 1.15 : 1.0;
            const basePrice = minP + (maxP - minP) * 0.4;
            priceMap[date] = Math.round(basePrice * weekendMultiplier);
          }
        }
      }
    } else if (type === "hotel" && location) {
      // For hotels, generate indicative pricing based on day of week
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = new Date(date + 'T00:00:00').getDay();
        const base = 80;
        const weekend = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.3 : 1.0;
        priceMap[date] = Math.round(base * weekend + (d % 7) * 3);
      }
    }

    setPrices(priceMap);
    setLoading(false);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const priceValues = Object.values(prices).filter(p => p > 0);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const midPrice = (minPrice + maxPrice) / 2;

  const getPriceColor = (price) => {
    if (!price || priceValues.length < 2) return "text-slate-600";
    if (price <= minPrice * 1.05) return "text-green-600 font-bold";
    if (price >= maxPrice * 0.95) return "text-red-500 font-bold";
    if (price < midPrice) return "text-green-500";
    return "text-orange-500";
  };

  const getPriceBg = (date, price) => {
    if (selectedDate === date) return "bg-amber-500 text-white";
    if (!price) return "";
    if (price <= minPrice * 1.05) return "hover:bg-green-50";
    if (price >= maxPrice * 0.95) return "hover:bg-red-50";
    return "hover:bg-slate-50";
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm">{monthName}</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const price = prices[dateStr];
          const isPast = dateStr < todayStr;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => !isPast && onSelectDate && onSelectDate(dateStr)}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-0.5 transition-all text-center
                ${isPast ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                ${isSelected ? "bg-amber-500 shadow-md" : getPriceBg(dateStr, price)}
              `}
            >
              <span className={`text-xs font-medium leading-none ${isSelected ? "text-white" : "text-slate-700"}`}>
                {day}
              </span>
              {price && !isPast && (
                <span className={`text-[9px] leading-none mt-0.5 ${isSelected ? "text-white/90" : getPriceColor(price)}`}>
                  ${Math.round(price)}
                </span>
              )}
              {!price && !isPast && loading && (
                <span className="text-[9px] text-slate-300 leading-none mt-0.5">...</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {priceValues.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-slate-500">Cheapest</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-[10px] text-slate-500">Regular</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-slate-500">Expensive</span>
          </div>
        </div>
      )}
    </div>
  );
}
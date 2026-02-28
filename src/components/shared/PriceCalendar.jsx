import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { base44 } from "@/api/base44Client";

/**
 * PriceCalendar - shows cheapest prices on each date cell
 * Props:
 *  - type: "flight" | "hotel"
 *  - origin, destination (for flights)
 *  - onSelectDate: (dateString) => void
 *  - selectedDate: string (yyyy-MM-dd)
 *  - minDate: string (yyyy-MM-dd)
 */
export default function PriceCalendar({ type = "flight", origin, destination, onSelectDate, selectedDate, minDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const today = startOfDay(new Date());
  const minDateObj = minDate ? startOfDay(new Date(minDate)) : today;

  useEffect(() => {
    fetchPrices();
  }, [currentMonth, origin, destination, type]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate realistic sample price data for a ${type === "flight" ? "flight" : "hotel"} price calendar.
${type === "flight" ? `Route: ${origin || "MNL"} to ${destination || "SIN"}` : `Hotel stay`}
Month: ${format(currentMonth, "MMMM yyyy")}
Return a JSON object where keys are dates in format "yyyy-MM-dd" from ${monthStart} to ${monthEnd}, 
and values are the cheapest available price in USD for that date.
Vary prices naturally: some dates cheap (weekdays), some expensive (weekends/holidays).
Make some dates null (no availability).
Use realistic prices: flights $80-$600, hotels $30-$300.`,
        response_json_schema: {
          type: "object",
          additionalProperties: { type: "number" }
        }
      });
      setPrices(result || {});
    } catch (e) {
      setPrices({});
    }
    setLoading(false);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDayOfWeek = startOfMonth(currentMonth).getDay(); // 0=Sun

  const allPrices = Object.values(prices).filter(Boolean);
  const minPrice = allPrices.length ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : null;

  const getPriceColor = (price) => {
    if (!price || minPrice === null) return "";
    const range = maxPrice - minPrice;
    if (range === 0) return "text-green-600 bg-green-50";
    const ratio = (price - minPrice) / range;
    if (ratio < 0.33) return "text-green-600 bg-green-50 font-semibold";
    if (ratio < 0.66) return "text-amber-600 bg-amber-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-full min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="text-sm font-semibold text-slate-800">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
          Loading prices...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const price = prices[dateStr];
            const isPast = isBefore(day, minDateObj);
            const isSelected = selectedDate === dateStr;
            const isToday = isSameDay(day, today);
            const isCheapest = price && minPrice !== null && price === minPrice;

            return (
              <button
                key={dateStr}
                disabled={isPast || !price}
                onClick={() => !isPast && price && onSelectDate(dateStr)}
                className={`
                  flex flex-col items-center py-1 px-0.5 rounded-lg transition-all text-center
                  ${isSelected ? "bg-amber-500 text-white shadow-md scale-105" : ""}
                  ${!isSelected && !isPast && price ? `hover:scale-105 cursor-pointer ${getPriceColor(price)}` : ""}
                  ${isPast ? "opacity-30 cursor-not-allowed" : ""}
                  ${!price && !isPast ? "opacity-40 cursor-not-allowed" : ""}
                  ${isToday && !isSelected ? "ring-1 ring-amber-400" : ""}
                `}
              >
                <span className={`text-[11px] font-medium ${isSelected ? "text-white" : ""}`}>
                  {format(day, "d")}
                </span>
                {price ? (
                  <span className={`text-[9px] leading-tight ${isSelected ? "text-white/90" : ""}`}>
                    ${Math.round(price)}
                    {isCheapest && !isSelected && <span className="block text-[8px] text-green-600 font-bold">LOW</span>}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300">—</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 justify-center text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Cheap</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Regular</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Expensive</span>
      </div>
    </div>
  );
}
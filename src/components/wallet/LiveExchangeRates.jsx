import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

// Displays live exchange rates (PHP base). Polls every 30s and subscribes to
// CurrencyRate entity changes so the banner stays current without a refresh.
const DISPLAY = [
  { code: "USD", label: "USD/PHP" },
  { code: "EUR", label: "EUR/PHP" },
  { code: "GBP", label: "GBP/PHP" },
  { code: "SGD", label: "SGD/PHP" },
];

export default function LiveExchangeRates() {
  const queryClient = useQueryClient();

  const { data: rates = [] } = useQuery({
    queryKey: ["currency-rates"],
    queryFn: async () => {
      return await base44.entities.CurrencyRate.list();
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Realtime: refetch whenever a CurrencyRate record changes.
  useEffect(() => {
    const unsubscribe = base44.entities.CurrencyRate.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // CurrencyRate stores PHP -> target. Display target/PHP (1 USD = X PHP) = 1 / rate.
  const rateFor = (code) => {
    const rec = rates.find((r) => r.target_currency === code && r.base_currency === "PHP");
    if (!rec || !rec.rate) return null;
    return (1 / rec.rate).toFixed(2);
  };

  const lastUpdated = rates
    .map((r) => new Date(r.last_updated || 0).getTime())
    .sort((a, b) => b - a)[0];

  return (
    <Card className="p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          Live Exchange Rates
        </h4>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-[10px] text-slate-500 font-medium">LIVE</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {DISPLAY.map(({ code, label }) => {
          const value = rateFor(code);
          return (
            <div key={code}>
              <p className="text-slate-600">{label}</p>
              <p className="font-bold">{value ?? "—"}</p>
            </div>
          );
        })}
      </div>
      {lastUpdated ? (
        <p className="text-[10px] text-slate-400 mt-3">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      ) : null}
    </Card>
  );
}
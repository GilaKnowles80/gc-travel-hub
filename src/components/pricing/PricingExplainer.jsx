import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-0 shadow-sm rounded-2xl bg-blue-50 border-blue-200 border">
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Dynamic Pricing</p>
            <p className="text-sm text-blue-700">Prices adjust based on demand & seasonality</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-blue-600 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-blue-200"
          >
            <div className="p-4 space-y-3 text-sm text-blue-800">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">How It Works:</h4>
                <ul className="space-y-2 ml-4 list-disc">
                  <li><strong>Seasonal Pricing:</strong> Prices increase during peak seasons and holidays</li>
                  <li><strong>Demand-Based:</strong> As availability decreases, prices may increase</li>
                  <li><strong>Early Bird Discounts:</strong> Book further in advance for better rates</li>
                  <li><strong>Flash Sales:</strong> Limited-time deals on selected routes</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <p className="text-xs text-blue-700">
                  💡 Tip: Prices are recalculated daily. Check back often for better deals!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
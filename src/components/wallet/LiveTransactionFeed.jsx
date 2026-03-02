import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

export default function LiveTransactionFeed({ transactions, isAdmin }) {
  const [liveTransactions, setLiveTransactions] = useState(transactions);

  useEffect(() => {
    setLiveTransactions(transactions);
  }, [transactions]);

  if (liveTransactions.length === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-center text-slate-500">No transactions yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {liveTransactions.map((txn) => {
          const isPending = txn.status === "pending";
          const isDeposit = txn.transaction_type === "deposit";
          
          return (
            <motion.div
              key={txn.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                isPending
                  ? "bg-amber-50 border-l-4 border-amber-400"
                  : isDeposit
                  ? "bg-green-50 hover:bg-green-100"
                  : "bg-red-50 hover:bg-red-100"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                    isDeposit ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {isDeposit ? (
                    <ArrowDownLeft className={`w-5 h-5 ${isDeposit ? "text-green-600" : "text-red-600"}`} />
                  ) : (
                    <ArrowUpRight className={`w-5 h-5 ${isDeposit ? "text-green-600" : "text-red-600"}`} />
                  )}
                  {isPending && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 capitalize">{txn.transaction_type}</p>
                    {isPending ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-200 rounded-full">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span className="text-xs font-medium text-amber-700">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-200 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-green-700" />
                        <span className="text-xs font-medium text-green-700">Completed</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(txn.created_date).toLocaleDateString()} {new Date(txn.created_date).toLocaleTimeString()}
                  </p>
                  {isAdmin && <p className="text-xs text-slate-600 mt-0.5">User: {txn.user_email}</p>}
                </div>
              </div>

              <p className={`font-bold text-lg whitespace-nowrap ml-4 ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                {isDeposit ? "+" : "-"}
                {txn.amount.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
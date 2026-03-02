import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function RealTimePaymentNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = base44.auth.me().catch(() => null);

    const unsubscribe = base44.entities.Payment.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        const payment = event.data;
        const notification = {
          id: payment.id,
          type: payment.status,
          amount: payment.amount,
          bookingType: payment.booking_type,
          timestamp: Date.now()
        };

        setNotifications(prev => [notification, ...prev].slice(0, 5));

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'completed':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2, color: 'text-green-600' };
      case 'pending':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, color: 'text-blue-600' };
      case 'failed':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, color: 'text-red-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock, color: 'text-slate-600' };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => {
          const style = getNotificationStyle(notif.type);
          const Icon = style.icon;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
              className={`${style.bg} border ${style.border} rounded-lg p-4 max-w-xs shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${style.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    Payment {notif.type === 'completed' ? 'Successful' : notif.type === 'pending' ? 'Processing' : 'Failed'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {notif.bookingType} • ${notif.amount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
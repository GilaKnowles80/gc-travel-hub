import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LivePaymentMonitor() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    // Fetch initial payments
    const fetchPayments = async () => {
      try {
        const data = await base44.entities.Payment.list('-created_date', 50);
        setPayments(data);
        updateStats(data);
      } catch (e) {
        console.error('Error fetching payments:', e);
      }
    };

    fetchPayments();

    // Subscribe to real-time payment updates
    const unsubscribe = base44.entities.Payment.subscribe((event) => {
      setPayments(prev => {
        let updated = [...prev];
        if (event.type === 'create') {
          updated = [event.data, ...updated].slice(0, 50);
        } else if (event.type === 'update') {
          updated = updated.map(p => p.id === event.id ? event.data : p);
        }
        updateStats(updated);
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  const updateStats = (data) => {
    const total = data.length;
    const pending = data.filter(p => p.status === 'pending').length;
    const completed = data.filter(p => p.status === 'completed').length;
    setStats({ total, pending, completed });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Transactions</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500 opacity-30" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-30" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500 opacity-30" />
          </div>
        </Card>
      </div>

      {/* Live Transaction Feed */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-red-500 rounded-full"
          />
          <h3 className="text-xl font-bold text-slate-900">Live Payment Feed</h3>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {payments.map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(payment.status)}
                      <p className="font-semibold text-slate-900">{payment.booking_type?.toUpperCase()}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {payment.user_email} • {payment.booking_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">
                      ${payment.amount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.created_date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {payments.length === 0 && (
            <p className="text-center text-slate-500 py-8">No transactions yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
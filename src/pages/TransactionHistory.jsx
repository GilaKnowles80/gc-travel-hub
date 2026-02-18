import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Download, CheckCircle, XCircle, Clock, RefreshCw, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileSelect } from '@/components/ui/mobile-select';
import PullToRefresh from '@/components/mobile/PullToRefresh';

export default function TransactionHistory() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', user?.email],
    queryFn: () => user ? base44.entities.Payment.filter({ user_email: user.email }, '-created_date') : [],
    enabled: !!user
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['payments', user?.email] });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.booking_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h1>
          <p className="text-slate-600">View all your payment transactions and receipts</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by transaction or booking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <MobileSelect value={statusFilter} onValueChange={setStatusFilter} placeholder="Filter by status">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </MobileSelect>
              <MobileSelect value={typeFilter} onValueChange={setTypeFilter} placeholder="Filter by type">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flight">Flights</SelectItem>
                  <SelectItem value="hotel">Hotels</SelectItem>
                  <SelectItem value="tour">Tours</SelectItem>
                  <SelectItem value="bulk">Bulk Bookings</SelectItem>
                </SelectContent>
              </MobileSelect>
            </div>
          </CardContent>
        </Card>

        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No transactions found</h3>
              <p className="text-slate-600">You don't have any payment transactions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 capitalize">
                            {payment.booking_type} Booking
                          </h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Transaction ID: <span className="font-mono">{payment.id}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Booking ID: <span className="font-mono">{payment.booking_id}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(payment.created_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: payment.currency 
                        }).format(payment.amount)}
                      </div>
                      <div className="text-sm text-slate-500 capitalize">
                        via {payment.payment_method}
                      </div>
                      {payment.receipt_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(payment.receipt_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}
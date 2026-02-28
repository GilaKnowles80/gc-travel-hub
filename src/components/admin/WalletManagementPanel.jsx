import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function WalletManagementPanel() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['allWallets'],
    queryFn: () => base44.asServiceRole.entities.Wallet.list('-created_date', 100)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['allWalletTransactions'],
    queryFn: () => base44.asServiceRole.entities.WalletTransaction.list('-created_date', 100)
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: ({ transactionId, userEmail, amount }) =>
      Promise.all([
        base44.asServiceRole.entities.WalletTransaction.update(transactionId, {
          status: 'completed'
        }),
        base44.functions.invoke('updateWalletBalance', {
          userEmail,
          amount: -amount,
          transactionType: 'withdrawal',
          description: 'Admin approved withdrawal',
          referenceId: transactionId
        })
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      queryClient.invalidateQueries({ queryKey: ['allWalletTransactions'] });
      setError(null);
    }
  });

  const adjustBalanceMutation = useMutation({
    mutationFn: ({ userEmail, amount }) =>
      base44.functions.invoke('updateWalletBalance', {
        userEmail,
        amount: parseFloat(amount),
        transactionType: 'adjustment',
        description: adjustReason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      setAdjustAmount('');
      setAdjustReason('');
      setError(null);
    }
  });

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalEarned = wallets.reduce((sum, w) => sum + (w.total_earned || 0), 0);

  const pendingWithdrawals = transactions.filter(t => t.status === 'pending' && t.transaction_type === 'withdrawal');

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading wallet data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500 mt-1">{wallets.length} users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Earned</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Withdrawals</CardTitle>
              <CreditCard className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingWithdrawals.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              ₱{pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Pending Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{withdrawal.user_email}</p>
                    <p className="text-sm text-slate-600">
                      ₱{withdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} via {withdrawal.withdrawal_method}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Requested: {new Date(withdrawal.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      approveWithdrawalMutation.mutate({
                        transactionId: withdrawal.id,
                        userEmail: withdrawal.user_email,
                        amount: withdrawal.amount
                      })
                    }
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet List */}
      <Card>
        <CardHeader>
          <CardTitle>User Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-right py-3 px-4">Balance</th>
                  <th className="text-right py-3 px-4">Earned</th>
                  <th className="text-right py-3 px-4">Withdrawn</th>
                  <th className="text-right py-3 px-4">Used</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{wallet.user_email}</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      ₱{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₱{wallet.total_earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₱{wallet.total_withdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      ₱{wallet.total_used.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className={wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {wallet.status}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(wallet)}
                          >
                            Adjust
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adjust Balance</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-slate-600">{wallet.user_email}</p>
                            {error && (
                              <Alert className="bg-red-50 border-red-200">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <AlertDescription className="text-red-800">{error}</AlertDescription>
                              </Alert>
                            )}
                            <div>
                              <label className="text-sm font-medium">Amount</label>
                              <Input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="Enter amount (positive or negative)"
                                disabled={processing}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Reason</label>
                              <Input
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="Reason for adjustment"
                                disabled={processing}
                              />
                            </div>
                            <Button
                              onClick={() =>
                                adjustBalanceMutation.mutate({
                                  userEmail: wallet.user_email,
                                  amount: adjustAmount
                                })
                              }
                              disabled={processing || !adjustAmount}
                              className="w-full"
                            >
                              Apply Adjustment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
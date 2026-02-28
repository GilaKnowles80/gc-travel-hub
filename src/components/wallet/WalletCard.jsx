import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function WalletCard({ userEmail }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', userEmail],
    queryFn: async () => {
      const wallets = await base44.entities.Wallet.filter({ user_email: userEmail });
      return wallets[0] || { balance: 0, total_earned: 0, total_withdrawn: 0 };
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['walletTransactions', userEmail],
    queryFn: () =>
      base44.entities.WalletTransaction.filter(
        { user_email: userEmail },
        '-created_date',
        10
      )
  });

  const withdrawMutation = useMutation({
    mutationFn: ({ amount, method }) =>
      base44.functions.invoke('requestWalletWithdrawal', {
        amount: parseFloat(amount),
        withdrawalMethod: method
      }),
    onSuccess: () => {
      setSuccess('Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      setWithdrawMethod('bank_transfer');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > wallet?.balance) {
      setError('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawMutation.mutateAsync({
        amount: withdrawAmount,
        method: withdrawMethod
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (walletLoading) {
    return <div className="text-center py-8 text-slate-500">Loading wallet...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <CardTitle>Wallet Balance</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
          <p className="text-slate-600 text-sm mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-blue-600">
            ₱{wallet?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Total Earned</p>
            <p className="font-semibold text-green-600">
              ₱{wallet?.total_earned?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Withdrawn</p>
            <p className="font-semibold text-orange-600">
              ₱{wallet?.total_withdrawn?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Used</p>
            <p className="font-semibold text-red-600">
              ₱{wallet?.total_used?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Withdraw Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Wallet Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-sm font-medium">Amount (₱)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={wallet?.balance}
                  disabled={withdrawing}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available: ₱{wallet?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Withdrawal Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  disabled={withdrawing}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {withdrawing ? 'Processing...' : 'Submit Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center text-sm p-2 rounded bg-slate-50">
                  <div>
                    <p className="font-medium capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : '-'}₱{Math.abs(tx.amount)}
                    </p>
                    <p className={`text-xs ${
                      tx.status === 'completed' ? 'text-green-600' :
                      tx.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
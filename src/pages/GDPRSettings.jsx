import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConsentPreferences from '@/components/gdpr/ConsentPreferences';

export default function GDPRSettings() {
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const exportData = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('exportUserData');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${user.email}.json`;
      a.click();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    if (confirmEmail !== user.email) {
      toast.error('Email does not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('deleteUserData', { confirmEmail });
      if (data.success) {
        toast.success('Account data deleted');
        setTimeout(() => base44.auth.logout(), 2000);
      }
    } catch (error) {
      toast.error('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Privacy & Data Settings</h1>
            <p className="text-slate-600">Manage your personal data and privacy preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <ConsentPreferences />

          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Download a copy of all your data including bookings, payments, reviews, and preferences.
              </p>
              <Button onClick={exportData} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export Data (JSON)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete your personal data. 
                  Bookings with active payments will be retained for legal record-keeping.
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Account Data Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-slate-600">
                Type your email to confirm deletion: <strong>{user.email}</strong>
              </p>
              <Input
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={deleteData}
                  disabled={loading || confirmEmail !== user.email}
                  className="flex-1"
                >
                  Delete Data
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PrivacySecurityTab({ user }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Download a copy of all your data including bookings, payments, reviews, and preferences in JSON format.
          </p>
          <Button onClick={exportData} disabled={loading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export Data'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Account Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-red-100/50 rounded-lg mb-4 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Warning:</strong> This action is permanent. Your personal data will be deleted. Bookings with active payments are retained for legal record-keeping.
            </div>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Confirm Account Data Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-600">
              To permanently delete your account data, type your email to confirm:
            </p>
            <code className="block bg-slate-100 p-3 rounded text-sm font-mono">
              {user.email}
            </code>
            <Input
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmEmail('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteData}
                disabled={loading || confirmEmail !== user.email}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Delete Data'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
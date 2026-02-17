import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TwoFactorAuth({ email, onVerified, open, onOpenChange }) {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendCode = async () => {
    setSending(true);
    try {
      const { data } = await base44.functions.invoke('send2FACode', { email });
      if (data.success) {
        toast.success('Verification code sent to your email');
      }
    } catch (error) {
      toast.error('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      const { data } = await base44.functions.invoke('verify2FACode', { email, code });
      if (data.valid) {
        toast.success('Verified successfully!');
        onVerified();
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  React.useEffect(() => {
    if (open && email) {
      sendCode();
    }
  }, [open, email]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600">
            A verification code has been sent to <strong>{email}</strong>
          </p>
          <div>
            <label className="text-sm font-medium mb-2 block">Enter 6-digit code</label>
            <Input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={sendCode}
              disabled={sending}
              className="flex-1"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Code'}
            </Button>
            <Button
              onClick={verifyCode}
              disabled={verifying || code.length !== 6}
              className="flex-1"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailVerificationDialog({ 
  open, 
  onOpenChange, 
  email, 
  onVerified,
  type = 'booking',
  bookingId 
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [serverCode, setServerCode] = useState('');

  useEffect(() => {
    if (open) {
      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      setServerCode(verificationCode);
      sendVerificationEmail(verificationCode);
      
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open]);

  const sendVerificationEmail = async (verificationCode) => {
    try {
      await base44.functions.invoke('sendVerificationEmail', {
        email,
        type,
        bookingId,
        verificationCode
      });
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error('Failed to send verification email');
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (code === serverCode) {
        toast.success('Email verified successfully!');
        onVerified();
        onOpenChange(false);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle>Verify Your Email</DialogTitle>
          </div>
          <DialogDescription>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl font-bold tracking-widest"
            />
          </div>

          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <AlertCircle className="w-4 h-4" />
              Code expires in {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Code expired. Please try again.
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6 || timeLeft === 0}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              const newCode = Math.floor(100000 + Math.random() * 900000).toString();
              setServerCode(newCode);
              sendVerificationEmail(newCode);
              setTimeLeft(900);
            }}
            className="w-full"
          >
            Resend Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
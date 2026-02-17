import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await base44.functions.invoke('checkSession');
        if (!data.valid) {
          setShowWarning(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    checkSession();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      base44.auth.logout();
    }
  }, [showWarning, countdown]);

  const extendSession = () => {
    setShowWarning(false);
    setCountdown(60);
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Session Timeout Warning
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-slate-600">
            Your session will expire in <strong>{countdown} seconds</strong> due to inactivity.
          </p>
          <div className="flex gap-2">
            <Button onClick={extendSession} className="flex-1">
              Continue Session
            </Button>
            <Button variant="outline" onClick={() => base44.auth.logout()} className="flex-1">
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, PhoneOff, Loader2, AlertCircle } from 'lucide-react';

export default function TwilioCallWidget({ ticketId, customerPhone: initialPhone }) {
  const [customerPhone, setCustomerPhone] = useState(initialPhone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callSid, setCallSid] = useState(null);
  const [error, setError] = useState(null);

  const handleMakeCall = async () => {
    if (!customerPhone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('twilioMakeCall', {
        customerPhone,
        ticketId,
      });

      if (response.data.success) {
        setCallActive(true);
        setCallSid(response.data.callSid);
      } else {
        setError(response.data.error || 'Failed to make call');
      }
    } catch (err) {
      setError(err.message || 'Error initiating call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!callSid) return;
    try {
      await base44.functions.invoke('twilioEndCall', { callSid });
      setCallActive(false);
      setCallSid(null);
    } catch (err) {
      setError('Failed to end call');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <Phone className="w-4 h-4" />
        Call Support
      </h3>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {!callActive ? (
        <div className="space-y-3">
          <Input
            type="tel"
            placeholder="+63 915 440 1150"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            disabled={isLoading}
            className="font-mono"
          />
          <Button
            onClick={handleMakeCall}
            disabled={isLoading || !customerPhone.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Make Call
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✓ Call in progress with {customerPhone}
          </div>
          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="w-full"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>
      )}
    </div>
  );
}
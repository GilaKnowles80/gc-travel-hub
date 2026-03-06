import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, PhoneOff, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerCallButton() {
  const [status, setStatus] = useState('idle'); // idle, loading, calling, active, ended, error
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const deviceRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (status !== 'active') setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatDuration = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const startCall = async () => {
    setStatus('loading');
    setError('');
    try {
      if (!window.Twilio) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://sdk.twilio.com/js/client/v1.14/twilio.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const identity = 'customer_' + Date.now();
      const response = await base44.functions.invoke('twilioAccessToken', { identity });
      
      if (!response.data.token) {
        setError('Call service unavailable. Please try again later.');
        setStatus('error');
        return;
      }

      const d = new window.Twilio.Device(response.data.token, { debug: false });
      
      await new Promise((resolve, reject) => {
        d.on('ready', resolve);
        d.on('error', reject);
        d.setup(response.data.token);
      });

      deviceRef.current = d;
      setDevice(d);

      // Place call to the admin (gc_admin identity)
      const outgoingCall = d.connect({ To: 'gc_admin' });
      
      outgoingCall.on('accept', () => setStatus('active'));
      outgoingCall.on('ringing', () => setStatus('calling'));
      outgoingCall.on('disconnect', () => {
        setStatus('ended');
        setCall(null);
        deviceRef.current?.destroy();
        deviceRef.current = null;
        setDevice(null);
        setIsMuted(false);
      });
      outgoingCall.on('error', (err) => {
        setError('Call failed. Please try again.');
        setStatus('error');
      });

      setCall(outgoingCall);
      setStatus('calling');
    } catch (err) {
      console.error('Customer call error:', err);
      setError('Call service is currently unavailable.');
      setStatus('error');
    }
  };

  const endCall = () => {
    if (call) call.disconnect();
    if (deviceRef.current) {
      deviceRef.current.destroy();
      deviceRef.current = null;
    }
    setDevice(null);
    setCall(null);
    setStatus('idle');
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (call) {
      call.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    return () => {
      if (deviceRef.current) deviceRef.current.destroy();
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}

      {(status === 'idle' || status === 'error' || status === 'ended') && (
        <Button
          onClick={startCall}
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 rounded-xl"
          size="lg"
        >
          <Phone className="w-5 h-5" />
          {status === 'ended' ? 'Call Again' : 'Call Support Now'}
        </Button>
      )}

      {status === 'loading' && (
        <Button disabled className="w-full gap-2 rounded-xl" size="lg">
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting...
        </Button>
      )}

      {status === 'calling' && (
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-sm text-amber-700">
            📞 Ringing... waiting for agent
          </div>
          <Button onClick={endCall} variant="destructive" className="w-full gap-2 rounded-xl">
            <PhoneOff className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center text-sm text-green-700">
            ✓ Connected — {formatDuration(callDuration)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={toggleMute} variant="outline" size="sm" className="gap-2">
              {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button onClick={endCall} variant="destructive" size="sm" className="gap-2">
              <PhoneOff className="w-4 h-4" />
              End Call
            </Button>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400 text-center">Powered by Twilio Voice</p>
    </div>
  );
}
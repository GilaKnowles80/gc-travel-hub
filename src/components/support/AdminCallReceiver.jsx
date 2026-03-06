import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, PhoneOff, PhoneIncoming, Loader2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminCallReceiver() {
  const [status, setStatus] = useState('idle'); // idle, loading, ready, incoming, active, error
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [callerInfo, setCallerInfo] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const deviceRef = useRef(null);

  const initDevice = async () => {
    setStatus('loading');
    setError('');
    try {
      // Dynamically load Twilio Voice SDK
      if (!window.Twilio) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://sdk.twilio.com/js/client/v1.14/twilio.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const response = await base44.functions.invoke('twilioAccessToken', { identity: 'gc_admin' });
      if (response.data.setup_required) {
        setError('Twilio browser calling requires additional setup. See instructions below.');
        setStatus('error');
        return;
      }
      if (!response.data.token) {
        setError(response.data.error || 'Failed to get access token');
        setStatus('error');
        return;
      }

      const d = new window.Twilio.Device(response.data.token, { debug: false });

      d.on('ready', () => setStatus('ready'));
      d.on('error', (err) => {
        setError(err.message);
        setStatus('error');
      });
      d.on('incoming', (incomingCall) => {
        setCall(incomingCall);
        setCallerInfo(incomingCall.parameters?.From || 'Unknown Caller');
        setStatus('incoming');
        
        incomingCall.on('disconnect', () => {
          setStatus('ready');
          setCall(null);
          setCallerInfo('');
          setIsMuted(false);
        });
        incomingCall.on('cancel', () => {
          setStatus('ready');
          setCall(null);
          setCallerInfo('');
        });
      });

      d.setup(response.data.token);
      deviceRef.current = d;
      setDevice(d);
    } catch (err) {
      console.error('Error initializing Twilio device:', err);
      setError(err.message || 'Failed to initialize call device');
      setStatus('error');
    }
  };

  const acceptCall = () => {
    if (call) {
      call.accept();
      setStatus('active');
    }
  };

  const rejectCall = () => {
    if (call) {
      call.reject();
      setStatus('ready');
      setCall(null);
      setCallerInfo('');
    }
  };

  const endCall = () => {
    if (call) {
      call.disconnect();
      setStatus('ready');
      setCall(null);
      setCallerInfo('');
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (call) {
      call.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const disconnect = () => {
    if (deviceRef.current) {
      deviceRef.current.destroy();
      deviceRef.current = null;
      setDevice(null);
    }
    setStatus('idle');
    setCall(null);
    setCallerInfo('');
    setError('');
  };

  useEffect(() => {
    return () => {
      if (deviceRef.current) deviceRef.current.destroy();
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${
          status === 'ready' ? 'bg-green-500 animate-pulse' :
          status === 'incoming' || status === 'active' ? 'bg-amber-500 animate-pulse' :
          status === 'loading' ? 'bg-blue-400 animate-pulse' :
          status === 'error' ? 'bg-red-500' : 'bg-slate-300'
        }`} />
        <h3 className="font-semibold text-slate-900">Browser Call Receiver</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
          {error.includes('setup') && (
            <div className="mt-2 space-y-1 text-red-600 font-medium">
              <p>Required Twilio setup:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Twilio Console → Voice → TwiML Apps → Create new app</li>
                <li>Set Voice Request URL to your <code className="bg-red-100 px-1 rounded">twilioIncomingCall</code> function URL</li>
                <li>Create an API Key in Twilio Console → Settings → API Keys</li>
                <li>Add secrets: TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_TWIML_APP_SID</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Activate to receive browser calls from customers.</p>
          <Button onClick={initDevice} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
            <Phone className="w-4 h-4" />
            Go Online & Receive Calls
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting...
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
            ✓ Online — waiting for calls
          </div>
          <Button onClick={disconnect} variant="outline" className="w-full gap-2 text-slate-600">
            <PhoneOff className="w-4 h-4" />
            Go Offline
          </Button>
        </div>
      )}

      {status === 'incoming' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <PhoneIncoming className="w-6 h-6 text-amber-600 mx-auto mb-1 animate-bounce" />
            <p className="text-sm font-semibold text-amber-800">Incoming Call</p>
            <p className="text-xs text-amber-600">{callerInfo}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={rejectCall} variant="destructive" className="gap-2">
              <PhoneOff className="w-4 h-4" />
              Decline
            </Button>
            <Button onClick={acceptCall} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Phone className="w-4 h-4" />
              Answer
            </Button>
          </div>
        </div>
      )}

      {status === 'active' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm font-semibold text-blue-800">Call Active</p>
            <p className="text-xs text-blue-600">{callerInfo}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={toggleMute} variant="outline" className="gap-2">
              {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button onClick={endCall} variant="destructive" className="gap-2">
              <PhoneOff className="w-4 h-4" />
              End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
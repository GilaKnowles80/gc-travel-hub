import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStoredConsent,
  recordConsent,
  openConsentBanner,
  onConsentBannerOpen,
  CONSENT_DESCRIPTIONS
} from '@/lib/consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  // Show the banner automatically only when no consent choice exists yet.
  useEffect(() => {
    if (!getStoredConsent()) {
      const t = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  // Allow other parts of the app (footer link, preferences center) to re-open the banner.
  useEffect(() => onConsentBannerOpen(() => setShow(true)), []);

  const saveConsent = async (mode) => {
    let prefs;
    if (mode === 'all') {
      prefs = { essential: true, analytics: true, marketing: true };
    } else if (mode === 'essential') {
      prefs = { essential: true, analytics: false, marketing: false };
    } else {
      prefs = preferences;
    }
    await recordConsent(prefs);
    setShow(false);
    setShowDetails(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
        >
          <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2">
            <div className="flex items-start gap-4">
              <Cookie className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">🍪 Cookie Consent</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content.
                  You can change these preferences at any time.
                  {!showDetails && (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Customize preferences
                    </button>
                  )}
                </p>

                {showDetails && (
                  <div className="space-y-3 mb-4 p-4 bg-slate-50 rounded-lg">
                    {['essential', 'analytics', 'marketing'].map((type) => (
                      <div key={type} className="flex items-start gap-2">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={type === 'essential' ? true : preferences[type]}
                            disabled={type === 'essential'}
                            onCheckedChange={(checked) =>
                              setPreferences((p) => ({ ...p, [type]: checked }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium capitalize">{type} Cookies</label>
                          <p className="text-xs text-slate-500">{CONSENT_DESCRIPTIONS[type]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => saveConsent('all')} className="bg-amber-600 hover:bg-amber-700">
                    Accept All
                  </Button>
                  {showDetails && (
                    <Button onClick={() => saveConsent('custom')} variant="outline">
                      Save Preferences
                    </Button>
                  )}
                  <Button onClick={() => saveConsent('essential')} variant="ghost">
                    Reject All
                  </Button>
                </div>
              </div>
              <button
                onClick={() => saveConsent('essential')}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Dismiss and reject non-essential cookies"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { openConsentBanner };
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('gdpr_consent');
    if (!consent) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const saveConsent = async (acceptAll = false) => {
    const finalPrefs = acceptAll ? { essential: true, analytics: true, marketing: true } : preferences;
    
    try {
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        for (const [type, granted] of Object.entries(finalPrefs)) {
          await base44.entities.GDPRConsent.create({
            user_email: user.email,
            consent_type: type,
            granted,
            consent_date: new Date().toISOString()
          }).catch(console.error);
        }
      }
    } catch (error) {
      console.error('GDPR consent error:', error);
    }

    localStorage.setItem('gdpr_consent', JSON.stringify(finalPrefs));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2">
            <div className="flex items-start gap-4">
              <Cookie className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">🍪 Cookie Consent</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
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
                    <div className="flex items-center gap-2">
                      <Checkbox checked={true} disabled />
                      <label className="text-sm font-medium">
                        Essential Cookies (Required)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                      />
                      <label className="text-sm">
                        Analytics Cookies - Help us improve our services
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                      />
                      <label className="text-sm">
                        Marketing Cookies - Personalized offers and ads
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => saveConsent(true)} className="bg-amber-600 hover:bg-amber-700">
                    Accept All
                  </Button>
                  {showDetails && (
                    <Button onClick={() => saveConsent(false)} variant="outline">
                      Save Preferences
                    </Button>
                  )}
                  <Button onClick={() => saveConsent(false)} variant="ghost">
                    Essential Only
                  </Button>
                </div>
              </div>
              <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
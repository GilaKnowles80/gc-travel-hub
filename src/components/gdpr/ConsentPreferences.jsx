import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Cookie, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredConsent,
  recordConsent,
  onConsentChanged,
  CONSENT_TYPES,
  CONSENT_LABELS,
  CONSENT_DESCRIPTIONS
} from '@/lib/consent';

export default function ConsentPreferences() {
  const [prefs, setPrefs] = useState({ essential: true, analytics: false, marketing: false });
  const [recordedAt, setRecordedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = () => {
    const stored = getStoredConsent();
    if (stored) {
      setPrefs({
        essential: true,
        analytics: stored.analytics,
        marketing: stored.marketing
      });
      setRecordedAt(stored.recorded_at);
      setDirty(false);
    }
  };

  useEffect(() => {
    load();
    return onConsentChanged(load);
  }, []);

  const toggle = (type, value) => {
    if (type === 'essential') return;
    setPrefs((p) => {
      const next = { ...p, [type]: value };
      const stored = getStoredConsent();
      setDirty(
        next.analytics !== (stored?.analytics ?? false) ||
        next.marketing !== (stored?.marketing ?? false)
      );
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await recordConsent(prefs);
      toast.success('Your consent preferences have been saved.');
      setDirty(false);
    } catch {
      toast.error('Failed to save consent preferences.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return iso;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="w-5 h-5 text-amber-600" />
          Cookie & Consent Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Control which non-essential cookies and tracking technologies we may use. You can withdraw
          your consent at any time — it will take effect immediately.
        </p>

        {recordedAt && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Last updated: {formatDate(recordedAt)}
          </div>
        )}

        <div className="space-y-3">
          {CONSENT_TYPES.map((type) => (
            <div
              key={type}
              className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-200"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{CONSENT_LABELS[type]} Cookies</p>
                <p className="text-xs text-slate-500 mt-0.5">{CONSENT_DESCRIPTIONS[type]}</p>
              </div>
              <Switch
                checked={prefs[type]}
                disabled={type === 'essential'}
                onCheckedChange={(v) => toggle(type, v)}
                aria-label={`Toggle ${type} cookies`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save Preferences'}
          </Button>
          {!dirty && (
            <span className="text-xs text-slate-400">No changes to save.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
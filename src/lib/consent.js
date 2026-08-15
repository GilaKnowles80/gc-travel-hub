// GDPR consent helpers — shared by the cookie banner and the preferences center.
// Consent is stored in localStorage for instant reads and mirrored to the
// GDPRConsent entity (per user) so there is an auditable consent record.

import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'gdpr_consent';
const POLICY_VERSION = '1.0';
const BANNER_EVENT = 'open-consent-banner';

export const CONSENT_TYPES = ['essential', 'analytics', 'marketing'];

export const CONSENT_LABELS = {
  essential: 'Essential',
  analytics: 'Analytics',
  marketing: 'Marketing'
};

export const CONSENT_DESCRIPTIONS = {
  essential: 'Required for the site to function (login, bookings, security). Cannot be disabled.',
  analytics: 'Help us understand how visitors use the site so we can improve it.',
  marketing: 'Personalized offers and advertising across our platform.'
};

// Cached best-effort public IP capture for audit records.
let cachedIp = null;
export async function getClientIp() {
  if (cachedIp !== null) return cachedIp;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    cachedIp = data.ip || null;
  } catch {
    cachedIp = null;
  }
  return cachedIp;
}

export function getStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      essential: parsed.essential ?? true,
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
      recorded_at: parsed.recorded_at || null,
      policy_version: parsed.policy_version || null
    };
  } catch {
    return null;
  }
}

export function hasConsent(type) {
  if (type === 'essential') return true;
  const stored = getStoredConsent();
  return Boolean(stored && stored[type]);
}

export function hasAnyConsent() {
  return getStoredConsent() !== null;
}

// Persist locally and mirror a consent record per type to GDPRConsent (if logged in).
// Revoking a type writes a new record with granted=false — the audit trail is append-only.
export async function recordConsent(prefs) {
  const finalPrefs = {
    essential: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing)
  };

  const payload = {
    ...finalPrefs,
    recorded_at: new Date().toISOString(),
    policy_version: POLICY_VERSION
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  try {
    const user = await base44.auth.me().catch(() => null);
    if (user) {
      const ip = await getClientIp();
      // Write one record per consent type so admins can audit each individually.
      await base44.entities.GDPRConsent.bulkCreate(
        CONSENT_TYPES.map((type) => ({
          user_email: user.email,
          consent_type: type,
          granted: finalPrefs[type],
          ip_address: ip,
          consent_date: payload.recorded_at
        }))
      ).catch(() => {});
    }
  } catch {
    // Local storage is the source of truth; entity write is best-effort.
  }

  window.dispatchEvent(new Event('consent-changed'));
  return payload;
}

export function openConsentBanner() {
  window.dispatchEvent(new Event(BANNER_EVENT));
}

export function onConsentBannerOpen(handler) {
  window.addEventListener(BANNER_EVENT, handler);
  return () => window.removeEventListener(BANNER_EVENT, handler);
}

export function onConsentChanged(handler) {
  window.addEventListener('consent-changed', handler);
  return () => window.removeEventListener('consent-changed', handler);
}
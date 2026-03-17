// Shared geo-detection utility — cached in sessionStorage to avoid repeated calls
// Uses ip-api.com (free, no key needed, 45 req/min)

const CACHE_KEY = 'gc_geo_data';

export async function detectGeo() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const res = await fetch('https://ip-api.com/json/?fields=status,countryCode,country,currency,languages,timezone');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'success') return null;

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

// Map country code -> primary language code
export const countryLanguageMap = {
  PH: 'en', US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', SG: 'en', IE: 'en',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  DE: 'de', AT: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  CN: 'zh', TW: 'zh', HK: 'zh',
  JP: 'ja',
  KR: 'ko',
  TH: 'th',
  SA: 'ar', AE: 'ar', EG: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', JO: 'ar', IQ: 'ar', YE: 'ar', OM: 'ar', MA: 'ar', DZ: 'ar',
  IT: 'it',
  PT: 'pt', BR: 'pt',
  RU: 'ru',
  ID: 'id',
  MY: 'ms',
  VN: 'vi',
  IN: 'hi',
  NL: 'nl',
  PL: 'pl',
  TR: 'tr',
};
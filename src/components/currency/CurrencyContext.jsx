import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { detectGeo } from '@/lib/geoDetect';

const CurrencyContext = createContext();

// Map country codes to currencies (comprehensive global coverage)
const countryCurrencyMap = {
  // Philippines
  'PH': 'PHP',
  // Europe (EUR)
  'BE': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR', 'IT': 'EUR',
  'NL': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'GR': 'EUR',
  'LU': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'EE': 'EUR', 'FI': 'EUR',
  'LV': 'EUR', 'LT': 'EUR', 'CY': 'EUR', 'MT': 'EUR', 'HR': 'EUR',
  'AD': 'EUR', 'MC': 'EUR', 'SM': 'EUR', 'VA': 'EUR', 'ME': 'EUR', 'XK': 'EUR',
  // UK & Crown Dependencies
  'GB': 'GBP', 'GG': 'GBP', 'JE': 'GBP', 'IM': 'GBP',
  // North America
  'US': 'USD', 'CA': 'CAD', 'MX': 'MXN',
  // Central America & Caribbean
  'GT': 'GTQ', 'BZ': 'BZD', 'HN': 'HNL', 'SV': 'USD', 'NI': 'NIO',
  'CR': 'CRC', 'PA': 'USD', 'CU': 'CUP', 'JM': 'JMD', 'HT': 'HTG',
  'DO': 'DOP', 'PR': 'USD', 'TT': 'TTD', 'BB': 'BBD', 'BS': 'BSD',
  // South America
  'CO': 'COP', 'VE': 'VES', 'GY': 'GYD', 'SR': 'SRD',
  'EC': 'USD', 'PE': 'PEN', 'BO': 'BOB', 'BR': 'BRL',
  'PY': 'PYG', 'UY': 'UYU', 'AR': 'ARS', 'CL': 'CLP',
  // Asia Pacific
  'JP': 'JPY', 'SG': 'SGD', 'AU': 'AUD', 'NZ': 'NZD',
  'CN': 'CNY', 'HK': 'HKD', 'TW': 'TWD',
  'KR': 'KRW', 'TH': 'THB', 'ID': 'IDR', 'MY': 'MYR',
  'VN': 'VND', 'MM': 'MMK', 'KH': 'KHR', 'LA': 'LAK',
  'IN': 'INR', 'PK': 'PKR', 'BD': 'BDT', 'LK': 'LKR', 'NP': 'NPR',
  'AF': 'AFN', 'MV': 'MVR', 'BT': 'BTN',
  'MN': 'MNT', 'KZ': 'KZT', 'UZ': 'UZS', 'TM': 'TMT', 'TJ': 'TJS', 'KG': 'KGS',
  // Middle East
  'AE': 'AED', 'BH': 'BHD', 'KW': 'KWD', 'IQ': 'IQD',
  'JO': 'JOD', 'SA': 'SAR', 'QA': 'QAR', 'OM': 'OMR', 'YE': 'YER',
  'IR': 'IRR', 'IL': 'ILS', 'LB': 'LBP', 'SY': 'SYP', 'TR': 'TRY',
  // Scandinavia
  'NO': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'IS': 'ISK',
  // Other Europe
  'CH': 'CHF', 'LI': 'CHF',
  'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN',
  'RS': 'RSD', 'BA': 'BAM', 'MK': 'MKD', 'AL': 'ALL',
  'RU': 'RUB', 'UA': 'UAH', 'BY': 'BYN', 'MD': 'MDL',
  'GE': 'GEL', 'AM': 'AMD', 'AZ': 'AZN',
  // Africa
  'NG': 'NGN', 'ZA': 'ZAR', 'KE': 'KES', 'GH': 'GHS',
  'EG': 'EGP', 'ET': 'ETB', 'TZ': 'TZS', 'UG': 'UGX',
  'MA': 'MAD', 'DZ': 'DZD', 'TN': 'TND', 'LY': 'LYD',
  'SD': 'SDG', 'AO': 'AOA', 'MZ': 'MZN', 'ZW': 'ZWL',
  'CM': 'XAF', 'SN': 'XOF', 'CI': 'XOF', 'MG': 'MGA',
  'ZM': 'ZMW', 'BW': 'BWP', 'NA': 'NAD', 'MU': 'MUR', 'RW': 'RWF',
  // Pacific Islands
  'FJ': 'FJD', 'PG': 'PGK', 'TO': 'TOP', 'WS': 'WST', 'VU': 'VUV',
};

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('PHP');
  const [countryCode, setCountryCode] = useState('PH');

  // On mount: fetch user preference AND geo-location together, then decide
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const userData = await base44.auth.me().catch(() => null);
      
      // Use geo-detection only if no user preference
      if (!userData?.preferred_currency) {
        const geo = await detectGeo();
        if (isMounted && geo?.countryCode) {
          setCountryCode(geo.countryCode);
          // ip-api returns currency directly, fallback to map
          const detected = geo.currency || countryCurrencyMap[geo.countryCode] || 'PHP';
          setSelectedCurrency(detected);
        }
      } else if (isMounted && userData.preferred_currency) {
        setSelectedCurrency(userData.preferred_currency);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Fetch all exchange rates
  const { data: rates = [] } = useQuery({
    queryKey: ['currencyRates'],
    queryFn: async () => {
      const allRates = await base44.entities.CurrencyRate.list();
      return allRates;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const symbols = {
    // Southeast Asia
    PHP: '₱', SGD: 'S$', IDR: 'Rp', MYR: 'RM', THB: '฿',
    VND: '₫', MMK: 'K', KHR: '៛',
    // Major
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    AUD: 'A$', CAD: 'C$', NZD: 'NZ$', HKD: 'HK$', TWD: 'NT$',
    KRW: '₩', INR: '₹', PKR: '₨', BDT: '৳',
    // Middle East
    AED: 'د.إ', BHD: 'BD', KWD: 'KD', IQD: 'IQD',
    JOD: 'JD', SAR: '﷼', QAR: 'QR', OMR: 'OMR', YER: '﷼',
    ILS: '₪', TRY: '₺', IRR: '﷼',
    // Europe
    NOK: 'kr', SEK: 'kr', DKK: 'kr', ISK: 'kr', CHF: 'Fr',
    PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв',
    RUB: '₽', UAH: '₴', RSD: 'din', HRK: 'kn',
    GEL: '₾', AMD: '֏', AZN: '₼',
    // Americas
    MXN: 'MX$', BRL: 'R$', ARS: '$', CLP: 'CL$', COP: 'CO$',
    PEN: 'S/', UYU: '$U', PYG: '₲',
    // Africa
    NGN: '₦', ZAR: 'R', KES: 'KSh', GHS: '₵',
    EGP: '£', ETB: 'Br', TZS: 'TSh', UGX: 'USh',
    MAD: 'MAD', DZD: 'DA', TND: 'DT', ZMW: 'ZK', BWP: 'P', MUR: '₨',
  };

  // Convert from PHP base to target currency
  const convertFromPHP = (priceInPHP, targetCurrency = selectedCurrency) => {
    if (targetCurrency === 'PHP') return priceInPHP;
    const rate = rates.find(r => r.base_currency === 'PHP' && r.target_currency === targetCurrency);
    if (rate) return priceInPHP * rate.rate;
    // Fallback: try to find rate via USD
    const phpToUsd = rates.find(r => r.base_currency === 'PHP' && r.target_currency === 'USD');
    if (!phpToUsd) return priceInPHP;
    const usdAmount = priceInPHP * phpToUsd.rate;
    if (targetCurrency === 'USD') return usdAmount;
    const usdToTarget = rates.find(r => r.base_currency === 'PHP' && r.target_currency === targetCurrency);
    return usdToTarget ? priceInPHP * usdToTarget.rate : priceInPHP;
  };

  // Convert from any currency to target currency (via PHP as bridge)
  const convertPrice = (amount, fromCurrency = 'PHP', targetCurrency = selectedCurrency) => {
    if (fromCurrency === targetCurrency) return amount;
    
    // Convert source to PHP first
    let amountInPHP = amount;
    if (fromCurrency !== 'PHP') {
      const rate = rates.find(r => r.base_currency === 'PHP' && r.target_currency === fromCurrency);
      if (rate && rate.rate > 0) {
        amountInPHP = amount / rate.rate;
      }
    }
    return convertFromPHP(amountInPHP, targetCurrency);
  };

  const formatPrice = (amount, fromCurrency = 'PHP', targetCurrency = selectedCurrency) => {
    const converted = convertPrice(amount, fromCurrency, targetCurrency);
    const decimals = targetCurrency === 'JPY' ? 0 : 2;
    const symbol = symbols[targetCurrency] || targetCurrency + ' ';
    return `${symbol}${converted.toFixed(decimals)}`;
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    convertPrice,
    convertFromPHP,
    formatPrice,
    rates,
    symbols,
    countryCode
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CurrencyContext = createContext();

// Map country codes to currencies
const countryCurrencyMap = {
  // Philippines
  'PH': 'PHP',
  // Europe (EUR)
  'BE': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR', 'IT': 'EUR',
  'NL': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'GR': 'EUR',
  'LU': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'EE': 'EUR',
  'LV': 'EUR', 'LT': 'EUR', 'CY': 'EUR', 'MT': 'EUR', 'HR': 'EUR',
  // UK
  'GB': 'GBP',
  // North, Central & South America
  'US': 'USD', 'CA': 'CAD', 'MX': 'USD',
  'GT': 'USD', 'BZ': 'USD', 'HN': 'USD', 'SV': 'USD', 'NI': 'USD',
  'CR': 'USD', 'PA': 'USD', 'CU': 'USD', 'JM': 'USD', 'HT': 'USD',
  'DO': 'USD', 'PR': 'USD', 'CO': 'USD', 'VE': 'USD', 'GY': 'USD',
  'SR': 'USD', 'EC': 'USD', 'PE': 'USD', 'BO': 'USD', 'BR': 'USD',
  'PY': 'USD', 'UY': 'USD', 'AR': 'USD', 'CL': 'USD',
  // Asia Pacific
  'JP': 'JPY', 'SG': 'SGD', 'AU': 'AUD',
  // China (Yuan/CNY)
  'CN': 'CNY',
  // South Korea
  'KR': 'KRW',
  // Thailand
  'TH': 'THB',
  // Middle East
  'AE': 'AED', // UAE Dirham
  'BH': 'BHD', // Bahraini Dinar
  'KW': 'KWD', // Kuwaiti Dinar
  'IQ': 'IQD', // Iraqi Dinar
  'JO': 'JOD', // Jordanian Dinar
  'SA': 'SAR', // Saudi Riyal
  'QA': 'QAR', // Qatari Riyal
  'OM': 'OMR', // Omani Riyal
  'YE': 'YER', // Yemeni Riyal
  // Scandinavia
  'NO': 'NOK', // Norwegian Krone
  'SE': 'SEK', // Swedish Krona
  'DK': 'DKK', // Danish Krone
  // Finland uses EUR
  'FI': 'EUR',
  // Switzerland
  'CH': 'CHF',
  // Africa
  'NG': 'NGN', // Nigerian Naira
  'ZA': 'ZAR', // South African Rand
  'KE': 'KES', // Kenyan Shilling
  'GH': 'GHS', // Ghanaian Cedi
  'EG': 'EGP', // Egyptian Pound
  'ET': 'ETB', // Ethiopian Birr
  'TZ': 'TZS', // Tanzanian Shilling
  'UG': 'UGX', // Ugandan Shilling
  'MA': 'MAD', // Moroccan Dirham
  'DZ': 'DZD', // Algerian Dinar
};

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('PHP');
  const [countryCode, setCountryCode] = useState('PH');

  // On mount: fetch user preference AND geo-location together, then decide
  useEffect(() => {
    const init = async () => {
      // Run both in parallel
      const [userResult, geoResult] = await Promise.allSettled([
        base44.auth.me().catch(() => null),
        fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => null),
      ]);

      const user = userResult.value;
      const geo = geoResult.value;

      if (geo?.country_code) setCountryCode(geo.country_code);

      // User saved preference takes priority
      if (user?.preferred_currency) {
        setSelectedCurrency(user.preferred_currency);
      } else if (geo?.country_code) {
        // Fall back to geo-detected currency
        const detected = countryCurrencyMap[geo.country_code] || 'PHP';
        setSelectedCurrency(detected);
      }
    };
    init();
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
    PHP: '₱', USD: '$', EUR: '€', GBP: '£',
    JPY: '¥', SGD: 'S$', AUD: 'A$', CAD: 'C$'
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
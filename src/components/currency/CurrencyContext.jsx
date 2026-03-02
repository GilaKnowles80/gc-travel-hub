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
  'FI': 'EUR', 'LU': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'EE': 'EUR',
  'LV': 'EUR', 'LT': 'EUR', 'CY': 'EUR', 'MT': 'EUR', 'HR': 'EUR',
  // UK
  'GB': 'GBP',
  // North, Central & South America (USD)
  'US': 'USD', 'CA': 'USD', 'MX': 'USD',
  'GT': 'USD', 'BZ': 'USD', 'HN': 'USD', 'SV': 'USD', 'NI': 'USD',
  'CR': 'USD', 'PA': 'USD', 'CU': 'USD', 'JM': 'USD', 'HT': 'USD',
  'DO': 'USD', 'PR': 'USD', 'CO': 'USD', 'VE': 'USD', 'GY': 'USD',
  'SR': 'USD', 'EC': 'USD', 'PE': 'USD', 'BO': 'USD', 'BR': 'USD',
  'PY': 'USD', 'UY': 'USD', 'AR': 'USD', 'CL': 'USD',
  // Asia Pacific
  'JP': 'JPY', 'SG': 'SGD', 'AU': 'AUD', 'CN': 'USD', 'KR': 'USD',
};

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('PHP');
  const [user, setUser] = useState(null);
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect currency from location
  useEffect(() => {
    const detectCurrencyFromLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        console.log('Detected location:', data);
        
        if (data.country_code && !autoDetected) {
          const detectedCurrency = countryCurrencyMap[data.country_code] || 'PHP';
          console.log('Auto-detected currency:', detectedCurrency, 'for country:', data.country_code);
          setSelectedCurrency(detectedCurrency);
          setAutoDetected(true);
        }
      } catch (error) {
        console.log('Auto currency detection failed, using default PHP', error);
        setSelectedCurrency('PHP');
        setAutoDetected(true);
      }
    };

    if (!autoDetected) {
      detectCurrencyFromLocation();
    }
  }, []);

  // Load user preference (overrides auto-detection)
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.preferred_currency) {
        setSelectedCurrency(u.preferred_currency);
      }
    }).catch(() => {});
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
    JPY: '¥', SGD: 'S$', AUD: 'A$'
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

  // Detect countryCode from ipapi (reuse the detection logic)
  const [countryCode, setCountryCode] = React.useState('PH');
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => { if (data.country_code) setCountryCode(data.country_code); })
      .catch(() => {});
  }, []);

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
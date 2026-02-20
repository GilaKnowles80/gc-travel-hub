import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CurrencyContext = createContext();

// Map country codes to currencies
const countryCurrencyMap = {
  'PH': 'PHP',
  'US': 'USD',
  'BE': 'EUR', // Belgium
  'FR': 'EUR',
  'DE': 'EUR',
  'ES': 'EUR',
  'IT': 'EUR',
  'NL': 'EUR',
  'AT': 'EUR',
  'PT': 'EUR',
  'IE': 'EUR',
  'GR': 'EUR',
  'FI': 'EUR',
  'JP': 'JPY',
  'SG': 'SGD',
  'AU': 'AUD',
  'GB': 'EUR', // Use EUR for UK as fallback
  'CA': 'USD', // Use USD for Canada
  'CN': 'USD', // Fallback to USD
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

  const convertPrice = (priceInPHP, targetCurrency = selectedCurrency) => {
    if (targetCurrency === 'PHP') return priceInPHP;
    
    const rate = rates.find(r => r.target_currency === targetCurrency);
    if (!rate) return priceInPHP;
    
    return priceInPHP * rate.rate;
  };

  const formatPrice = (priceInPHP, targetCurrency = selectedCurrency) => {
    const converted = convertPrice(priceInPHP, targetCurrency);
    const symbols = {
      PHP: '₱',
      USD: '$',
      EUR: '€',
      JPY: '¥',
      SGD: 'S$',
      AUD: 'A$'
    };
    
    const decimals = targetCurrency === 'JPY' ? 0 : 2;
    return `${symbols[targetCurrency]}${converted.toFixed(decimals)}`;
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    convertPrice,
    formatPrice,
    rates
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
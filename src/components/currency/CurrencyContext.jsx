import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('PHP');
  const [user, setUser] = useState(null);

  // Load user preference
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
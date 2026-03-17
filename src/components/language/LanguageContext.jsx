import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectGeo, countryLanguageMap } from '@/lib/geoDetect';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || null;
  });

  useEffect(() => {
    // If no stored preference, auto-detect from IP geo
    if (!language) {
      detectGeo().then(geo => {
        const detected = (geo?.countryCode && countryLanguageMap[geo.countryCode]) || 
                         navigator.language?.split('-')[0] || 'en';
        setLanguage(detected);
      });
    }
  }, []);

  useEffect(() => {
    if (language) {
      localStorage.setItem('app_language', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
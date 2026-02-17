import React, { createContext, useContext, useEffect, useState } from 'react';

const RecaptchaContext = createContext();

export const useRecaptcha = () => {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error('useRecaptcha must be used within RecaptchaProvider');
  }
  return context;
};

export const RecaptchaProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const siteKey = 'RECAPTCHA_SITE_KEY'; // Replace with actual site key from env

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const executeRecaptcha = async (action) => {
    if (!isReady || !window.grecaptcha) {
      console.warn('reCAPTCHA not ready');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      return null;
    }
  };

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha, isReady }}>
      {children}
    </RecaptchaContext.Provider>
  );
};
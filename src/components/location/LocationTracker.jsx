import { useEffect } from 'react';

export default function LocationTracker({ onLocationDetected }) {
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get country from IP using a free API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_name && onLocationDetected) {
          onLocationDetected({
            country: data.country_name,
            country_code: data.country_code,
            city: data.city,
            ip: data.ip
          });
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        // Fallback: try to detect from browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const countryCode = browserLang.split('-')[1];
        if (countryCode && onLocationDetected) {
          onLocationDetected({
            country: countryCode,
            country_code: countryCode,
            city: 'Unknown',
            ip: 'Unknown'
          });
        }
      }
    };

    detectLocation();
  }, [onLocationDetected]);

  return null; // This is a utility component with no UI
}
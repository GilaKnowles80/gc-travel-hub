import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Ads Conversion Tracking Component
export default function GoogleAdsTracking() {
  const location = useLocation();

  useEffect(() => {
    // Load Google Tag script
    if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17846501913';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-17846501913');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        send_to: 'AW-17846501913'
      });
    }
  }, [location]);

  return null;
}

/**
 * Track a conversion event in Google Ads
 */
export function trackConversion(conversionLabel, value = 0, currency = 'PHP') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': conversionLabel,
      'value': value,
      'currency': currency
    });
  }
}

/**
 * Track a booking/purchase conversion
 */
export function trackBooking(bookingType, value, currency = 'PHP') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      'send_to': 'AW-17846501913',
      'value': value,
      'currency': currency,
      'booking_type': bookingType
    });
  }
}

/**
 * Track when user initiates checkout
 */
export function trackBeginCheckout(value, currency = 'PHP') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      'send_to': 'AW-17846501913',
      'value': value,
      'currency': currency
    });
  }
}
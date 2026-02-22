import { useEffect } from 'react';

export default function GTMTracking() {
  useEffect(() => {
    // You can set GTM_CONTAINER_ID in your environment variables
    // Format: GTM-XXXXXX
    const gtmId = import.meta.env.VITE_GTM_CONTAINER_ID || 'GTM-XXXXXXX';
    
    if (gtmId === 'GTM-XXXXXXX') {
      console.warn('GTM: Container ID not configured. Set VITE_GTM_CONTAINER_ID in your environment.');
      return;
    }

    // Google Tag Manager script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    // GTM noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      // Cleanup on unmount
      script.remove();
      noscript.remove();
    };
  }, []);

  return null;
}

// GTM Event Tracking Utilities
export const gtmPush = (event) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event);
  }
};

// Track page views
export const trackPageView = (pageName) => {
  gtmPush({
    event: 'pageview',
    page: pageName,
    timestamp: new Date().toISOString()
  });
};

// Track custom events
export const trackEvent = (eventName, eventData = {}) => {
  gtmPush({
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString()
  });
};

// Track purchases
export const trackPurchase = (transactionId, value, currency = 'PHP', items = []) => {
  gtmPush({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    }
  });
};

// Track booking events
export const trackBooking = (bookingType, bookingId, value, currency = 'PHP') => {
  gtmPush({
    event: 'booking_completed',
    booking_type: bookingType,
    booking_id: bookingId,
    value: value,
    currency: currency
  });
};
// Google Ads Conversion Tracking Utility

export const trackConversion = (conversionLabel, value, transactionId, currency = 'PHP') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `AW-17846501913/${conversionLabel}`,
      'value': value,
      'currency': currency,
      'transaction_id': transactionId
    });
  }
};

// Conversion Labels - Add your conversion labels from Google Ads here
export const CONVERSION_LABELS = {
  PURCHASE: 'WfWjCKzfoPwBJmE8LiC', // Purchase conversion
  BOOKING: 'BOOKING_LABEL', // Replace with your booking conversion label
  LEAD: 'LEAD_LABEL', // Replace with your lead conversion label
};

// Track purchase conversion
export const trackPurchase = (amount, transactionId, currency = 'PHP') => {
  trackConversion(CONVERSION_LABELS.PURCHASE, amount, transactionId, currency);
};

// Track booking conversion
export const trackBooking = (amount, bookingId, currency = 'PHP') => {
  trackConversion(CONVERSION_LABELS.BOOKING, amount, bookingId, currency);
};

// Track lead conversion
export const trackLead = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `AW-17846501913/${CONVERSION_LABELS.LEAD}`
    });
  }
};
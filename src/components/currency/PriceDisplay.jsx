import React from 'react';
import { useCurrency } from './CurrencyContext';

export default function PriceDisplay({ amount, fromCurrency = 'PHP', showOriginal = false, tourDestination = '' }) {
  const { formatPrice, selectedCurrency } = useCurrency();

  if (!amount) return <span>--</span>;

  // For PHP destinations, show PHP symbol with original price
  if (fromCurrency === 'PHP' && tourDestination?.toLowerCase().includes('philippines')) {
    return <span className="font-semibold text-lg">₱{amount?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
  }

  const converted = formatPrice(amount, fromCurrency);

  if (showOriginal && selectedCurrency !== fromCurrency) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-lg">{converted}</span>
      </div>
    );
  }

  return <span className="font-semibold text-lg">{converted}</span>;
}
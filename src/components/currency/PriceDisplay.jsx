import React from 'react';
import { useCurrency } from './CurrencyContext';

export default function PriceDisplay({ amount, fromCurrency = 'PHP', showOriginal = false }) {
  const { formatPrice, selectedCurrency } = useCurrency();

  if (!amount) return <span>--</span>;

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
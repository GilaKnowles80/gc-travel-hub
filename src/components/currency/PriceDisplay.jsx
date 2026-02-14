import React from 'react';
import { useCurrency } from './CurrencyContext';

export default function PriceDisplay({ amount, showOriginal = false }) {
  const { formatPrice, selectedCurrency } = useCurrency();

  if (!amount) return <span>--</span>;

  const converted = formatPrice(amount);

  if (showOriginal && selectedCurrency !== 'PHP') {
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-lg">{converted}</span>
        <span className="text-sm text-slate-500">₱{amount.toFixed(2)}</span>
      </div>
    );
  }

  return <span className="font-semibold text-lg">{converted}</span>;
}
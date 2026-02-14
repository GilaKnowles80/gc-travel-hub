import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SUPPORTED_CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'SGD', 'AUD'];

export default function CurrencySelector({ onChange, defaultCurrency = 'PHP' }) {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    
    // Save to user profile
    if (user) {
      base44.auth.updateMe({ preferred_currency: currency }).catch(err => 
        console.error('Failed to save currency preference:', err)
      );
    }
    
    onChange?.(currency);
  };

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="w-4 h-4 text-slate-600" />
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-20 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map(currency => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
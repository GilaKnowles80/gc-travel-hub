import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscountCodeInput({ bookingType, amount, onDiscountApplied }) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const validateCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setValidating(true);
    try {
      const { data } = await base44.functions.invoke('validateDiscountCode', {
        code: code.toUpperCase(),
        bookingType,
        amount
      });

      if (data.valid) {
        setAppliedDiscount(data.discount);
        onDiscountApplied(data.discount);
        toast.success(`Discount applied! Save $${data.discount.discount_amount.toFixed(2)}`);
      } else {
        toast.error(data.error || 'Invalid discount code');
        setAppliedDiscount(null);
        onDiscountApplied(null);
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      toast.error('Failed to validate discount code');
    } finally {
      setValidating(false);
    }
  };

  const removeDiscount = () => {
    setCode('');
    setAppliedDiscount(null);
    onDiscountApplied(null);
    toast.info('Discount removed');
  };

  if (appliedDiscount) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">{appliedDiscount.title}</span>
            {appliedDiscount.is_flash_sale && (
              <Badge className="bg-red-100 text-red-700">
                <Zap className="w-3 h-3 mr-1" />
                Flash Sale
              </Badge>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={removeDiscount}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-700">Discount ({appliedDiscount.code}):</span>
          <span className="font-semibold text-green-900">-${appliedDiscount.discount_amount.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Have a discount code?
      </label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && validateCode()}
        />
        <Button 
          onClick={validateCode} 
          disabled={validating || !code.trim()}
          variant="outline"
        >
          {validating ? 'Validating...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
}
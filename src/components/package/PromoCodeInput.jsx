import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromoCodeInput({ packageValue, onCodeApplied }) {
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);

  const validateMutation = useMutation({
    mutationFn: async (promoCode) => {
      const codes = await base44.entities.PackagePromoCode.filter({ 
        code: promoCode.toUpperCase(), 
        is_active: true 
      });
      
      if (codes.length === 0) {
        throw new Error('Invalid promo code');
      }
      
      const promo = codes[0];
      const now = new Date();
      
      if (new Date(promo.valid_from) > now) {
        throw new Error('Promo code not yet valid');
      }
      
      if (new Date(promo.valid_until) < now) {
        throw new Error('Promo code expired');
      }
      
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        throw new Error('Promo code usage limit reached');
      }
      
      if (packageValue < promo.min_package_value) {
        throw new Error(`Minimum package value is $${promo.min_package_value}`);
      }
      
      return promo;
    },
    onSuccess: (promo) => {
      setAppliedCode(promo);
      const discount = promo.discount_type === 'percentage' 
        ? (packageValue * promo.discount_value / 100)
        : promo.discount_value;
      onCodeApplied(promo, discount);
      toast.success(`Promo code applied! $${discount.toFixed(2)} off`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleApply = () => {
    if (!code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    validateMutation.mutate(code);
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setCode('');
    onCodeApplied(null, 0);
    toast.success('Promo code removed');
  };

  return (
    <div className="space-y-2">
      {!appliedCode ? (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1"
          />
          <Button 
            onClick={handleApply} 
            disabled={validateMutation.isPending}
            variant="outline"
          >
            <Tag className="w-4 h-4 mr-1" />
            Apply
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-700">{appliedCode.code}</span>
            <Badge className="bg-green-100 text-green-700">
              {appliedCode.discount_type === 'percentage' 
                ? `${appliedCode.discount_value}% OFF` 
                : `$${appliedCode.discount_value} OFF`}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={handleRemove}>
            <X className="w-4 h-4 text-green-700" />
          </Button>
        </div>
      )}
    </div>
  );
}
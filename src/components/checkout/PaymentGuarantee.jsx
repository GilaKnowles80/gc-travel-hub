import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, RotateCcw } from 'lucide-react';

export default function PaymentGuarantee() {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Payment Protection Guarantee
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-green-900">Instant Confirmation</p>
              <p className="text-xs text-green-700 mt-1">Get your booking instantly after payment</p>
            </div>
          </div>
          <div className="flex gap-3">
            <RotateCcw className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-green-900">Easy Refunds</p>
              <p className="text-xs text-green-700 mt-1">Hassle-free refund within 48 hours</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-green-900">Secure Payment</p>
              <p className="text-xs text-green-700 mt-1">PCI-DSS Level 1 certified</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
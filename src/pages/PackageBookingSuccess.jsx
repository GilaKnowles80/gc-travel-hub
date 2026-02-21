import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import PackageBookingConfirmation from '@/components/package/PackageBookingConfirmation';
import { trackPurchase } from '@/components/analytics/GoogleAdsTracking';

export default function PackageBookingSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('package_id');
  const sessionId = urlParams.get('session_id');

  const { data: packageBooking, isLoading: loadingPackage } = useQuery({
    queryKey: ['package', packageId],
    queryFn: () => base44.entities.PackageBooking.get(packageId),
    enabled: !!packageId
  });

  const { data: payment, isLoading: loadingPayment } = useQuery({
    queryKey: ['payment', sessionId],
    queryFn: async () => {
      const payments = await base44.entities.Payment.list();
      return payments.find(p => p.stripe_session_id === sessionId);
    },
    enabled: !!sessionId
  });

  // Track conversion when payment data is loaded
  useEffect(() => {
    if (payment && packageBooking) {
      trackPurchase(
        payment.amount || packageBooking.final_price,
        payment.id,
        payment.currency || 'PHP'
      );
    }
  }, [payment, packageBooking]);

  if (loadingPackage || loadingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-slate-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!packageBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl font-semibold">Package not found</p>
        </div>
      </div>
    );
  }

  return <PackageBookingConfirmation packageBooking={packageBooking} payment={payment} />;
}
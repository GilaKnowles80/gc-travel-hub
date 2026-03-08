import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import { Loader2 } from 'lucide-react';
import SupplierOnboardingWizard from '@/components/supplier/SupplierOnboardingWizard';

export default function SupplierOnboarding() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['supplier', user?.email],
    queryFn: () => base44.entities.Supplier.filter({ email: user.email }),
    enabled: !!user
  });

  const supplier = suppliers?.[0];

  const handleComplete = () => {
    navigate(createPageUrl('SupplierDashboard'));
  };

  if (userLoading || suppliersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Supplier Not Found</h2>
          <p className="text-slate-600">Please contact support to set up your supplier account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <SupplierOnboardingWizard supplier={supplier} onComplete={handleComplete} />
    </div>
  );
}
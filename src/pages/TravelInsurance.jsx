import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import InsurancePurchaseDialog from '@/components/insurance/InsurancePurchaseDialog';

export default function TravelInsurance() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { data: providers = [] } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: () => base44.entities.InsuranceProvider.filter({ is_active: true })
  });

  const coverageColors = {
    basic: 'bg-blue-50 border-blue-200',
    standard: 'bg-green-50 border-green-200',
    premium: 'bg-purple-50 border-purple-200',
    comprehensive: 'bg-amber-50 border-amber-200'
  };

  const coverageBadges = {
    basic: 'bg-blue-100 text-blue-800',
    standard: 'bg-green-100 text-green-800',
    premium: 'bg-purple-100 text-purple-800',
    comprehensive: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Shield className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold">Travel Insurance</h1>
          </motion.div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Protect your trip with comprehensive travel insurance. Compare plans and get instant coverage.
          </p>
        </div>

        {/* Why Travel Insurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-900">Why You Need Travel Insurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Medical emergencies abroad</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Trip cancellation protection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Lost or delayed baggage</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>24/7 emergency assistance</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Insurance Providers */}
        {providers.map((provider, providerIdx) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + providerIdx * 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              {provider.logo_url && (
                <img src={provider.logo_url} alt={provider.provider_name} className="h-10 object-contain" />
              )}
              <h2 className="text-2xl font-bold">{provider.provider_name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {provider.coverage_types?.map((coverage, idx) => (
                <Card 
                  key={idx} 
                  className={`hover:shadow-xl transition-all cursor-pointer border-2 ${coverageColors[coverage.type]}`}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setSelectedCoverage(coverage);
                    setShowPurchaseDialog(true);
                  }}
                >
                  <CardHeader>
                    <Badge className={`${coverageBadges[coverage.type]} w-fit mb-2 capitalize`}>
                      {coverage.type}
                    </Badge>
                    <CardTitle className="text-xl">{coverage.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="text-center py-4 bg-white rounded-lg">
                      <div className="flex items-start justify-center gap-1">
                        <DollarSign className="w-5 h-5 text-slate-600 mt-1" />
                        <span className="text-3xl font-bold">{coverage.base_price}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">per trip</p>
                    </div>

                    {/* Coverage Amount */}
                    <div className="text-center py-2 bg-white rounded-lg">
                      <p className="text-sm text-slate-600">Coverage up to</p>
                      <p className="text-lg font-bold text-slate-900">
                        ${coverage.coverage_amount?.toLocaleString()}
                      </p>
                    </div>

                    {/* Benefits */}
                    {coverage.benefits && coverage.benefits.length > 0 && (
                      <div className="space-y-2">
                        {coverage.benefits.slice(0, 4).map((benefit, bidx) => (
                          <div key={bidx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{benefit}</span>
                          </div>
                        ))}
                        {coverage.benefits.length > 4 && (
                          <p className="text-xs text-slate-500 italic">+{coverage.benefits.length - 4} more benefits</p>
                        )}
                      </div>
                    )}

                    <Button className="w-full">Get Coverage</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}

        {providers.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No insurance providers available at the moment.</p>
            </div>
          </Card>
        )}

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-lg">Important Information</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Coverage Period:</strong> Insurance coverage begins on the policy start date and ends on the specified end date or upon completion of your trip, whichever comes first.
            </p>
            <p>
              <strong>Claims Process:</strong> To file a claim, contact your insurance provider's 24/7 hotline within 48 hours of the incident. Keep all receipts and documentation.
            </p>
            <p>
              <strong>Pre-existing Conditions:</strong> Most policies exclude pre-existing medical conditions unless specifically covered under a premium plan.
            </p>
            <p>
              <strong>Cancellation Policy:</strong> Travel insurance can be cancelled within 14 days of purchase for a full refund, provided travel has not yet commenced.
            </p>
            <p className="text-xs text-slate-500 italic">
              By purchasing travel insurance, you agree to the terms and conditions of the selected provider. 
              Full policy terms will be provided upon purchase.
            </p>
          </div>
        </motion.div>

        {selectedProvider && selectedCoverage && (
          <InsurancePurchaseDialog
            provider={selectedProvider}
            coverage={selectedCoverage}
            open={showPurchaseDialog}
            onOpenChange={(open) => {
              setShowPurchaseDialog(open);
              if (!open) {
                setSelectedProvider(null);
                setSelectedCoverage(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
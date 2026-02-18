import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lightbulb, Loader2, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupplierOnboardingWizard({ supplier, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [aiTips, setAiTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const queryClient = useQueryClient();

  const { data: onboarding } = useQuery({
    queryKey: ['supplier-onboarding', supplier.id],
    queryFn: async () => {
      const records = await base44.entities.SupplierOnboarding.filter({ supplier_id: supplier.id });
      if (records.length > 0) return records[0];
      return base44.entities.SupplierOnboarding.create({ supplier_id: supplier.id });
    }
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierOnboarding.update(onboarding.id, data),
    onSuccess: () => queryClient.invalidateQueries(['supplier-onboarding'])
  });

  const updateSupplierMutation = useMutation({
    mutationFn: (data) => base44.entities.Supplier.update(supplier.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier']);
      toast.success('Profile updated');
    }
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierInventory.create(data),
    onSuccess: () => toast.success('Inventory item added')
  });

  const createPricingRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.PricingRule.create(data),
    onSuccess: () => toast.success('Pricing configured')
  });

  useEffect(() => {
    if (onboarding) {
      setCurrentStep(onboarding.current_step);
    }
  }, [onboarding]);

  useEffect(() => {
    loadAITips();
  }, [currentStep, supplier.supplier_type]);

  const loadAITips = async () => {
    setLoadingTips(true);
    try {
      const { data } = await base44.functions.invoke('supplierOnboardingAssistant', {
        action: 'get_tips',
        supplier_type: supplier.supplier_type,
        step: currentStep
      });
      setAiTips(data.tips || []);
    } catch (error) {
      console.error('Failed to load tips:', error);
    }
    setLoadingTips(false);
  };

  const validateStepData = async () => {
    setValidating(true);
    try {
      const { data } = await base44.functions.invoke('supplierOnboardingAssistant', {
        action: 'validate_data',
        supplier_type: supplier.supplier_type,
        step: currentStep,
        data: formData
      });
      setValidation(data);
      return data.is_valid;
    } catch (error) {
      toast.error('Validation failed');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateStepData();
    if (!isValid && validation?.missing_fields?.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    await updateOnboardingMutation.mutateAsync({
      current_step: currentStep + 1,
      completed_steps: [...(onboarding.completed_steps || []), currentStep]
    });

    setCurrentStep(currentStep + 1);
    setValidation(null);
    setFormData({});
  };

  const handleSkip = async () => {
    await updateOnboardingMutation.mutateAsync({
      current_step: currentStep + 1,
      skipped_steps: [...(onboarding.skipped_steps || []), currentStep]
    });
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = async () => {
    await updateOnboardingMutation.mutateAsync({
      onboarding_completed: true
    });
    toast.success('Onboarding completed! Welcome to GC Travel & Tours');
    onComplete?.();
  };

  const steps = [
    { num: 1, title: 'Profile Setup', icon: '👤' },
    { num: 2, title: 'Initial Inventory', icon: '📦' },
    { num: 3, title: 'Pricing Config', icon: '💰' },
    { num: 4, title: 'Portal Features', icon: '🎯' },
    { num: 5, title: 'Final Review', icon: '✅' }
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  currentStep > step.num ? 'bg-green-100' : currentStep === step.num ? 'bg-blue-600 text-white' : 'bg-slate-200'
                }`}>
                  {currentStep > step.num ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : step.icon}
                </div>
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </div>
              {step.num < steps.length && <div className="w-12 h-px bg-slate-300 mx-2" />}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{steps[currentStep - 1]?.icon}</span>
                    {steps[currentStep - 1]?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentStep === 1 && <ProfileSetupStep supplier={supplier} formData={formData} setFormData={setFormData} updateSupplier={updateSupplierMutation} />}
                  {currentStep === 2 && <InventoryStep supplier={supplier} formData={formData} setFormData={setFormData} createInventory={createInventoryMutation} />}
                  {currentStep === 3 && <PricingStep supplier={supplier} formData={formData} setFormData={setFormData} createPricing={createPricingRuleMutation} />}
                  {currentStep === 4 && <FeaturesStep supplier={supplier} />}
                  {currentStep === 5 && <ReviewStep supplier={supplier} onboarding={onboarding} />}

                  {/* Validation Warnings */}
                  {validation && validation.warnings?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div className="text-sm space-y-1">
                          {validation.warnings.map((warning, i) => (
                            <p key={i} className="text-amber-700">{warning}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-2 pt-4">
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}
                    {currentStep < 5 && (
                      <>
                        <Button onClick={handleNext} disabled={validating} className="flex-1">
                          {validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="ghost" onClick={handleSkip}>Skip</Button>
                      </>
                    )}
                    {currentStep === 5 && (
                      <Button onClick={handleComplete} className="flex-1">
                        Complete Onboarding 🎉
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Tips Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTips ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {aiTips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupStep({ supplier, formData, setFormData, updateSupplier }) {
  const handleSave = () => {
    updateSupplier.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Let's complete your supplier profile to get started.</p>
      
      <div>
        <Label>Contact Person Name</Label>
        <Input
          value={formData.contact_name || supplier.contact_name || ''}
          onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
        />
      </div>

      <div>
        <Label>Phone Number</Label>
        <Input
          value={formData.phone || supplier.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div>
        <Label>Business Address</Label>
        <Textarea
          value={formData.address || supplier.address || ''}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label>Tax ID / Business Registration</Label>
        <Input
          value={formData.tax_id || supplier.tax_id || ''}
          onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
        />
      </div>

      <Button onClick={handleSave} disabled={updateSupplier.isPending}>
        {updateSupplier.isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}

function InventoryStep({ supplier, formData, setFormData, createInventory }) {
  const typeLabels = {
    hotel: 'Room Type',
    airline: 'Flight Route',
    tour_operator: 'Tour Package',
    ferry: 'Ferry Route',
    bus: 'Bus Route',
    car_rental: 'Vehicle Type'
  };

  const handleAdd = () => {
    createInventory.mutate({
      supplier_id: supplier.id,
      item_type: supplier.supplier_type === 'airline' ? 'flight' : 
                  supplier.supplier_type === 'tour_operator' ? 'tour' :
                  supplier.supplier_type === 'car_rental' ? 'car' : supplier.supplier_type,
      item_name: formData.item_name,
      availability: formData.availability || 10,
      total_capacity: formData.total_capacity || 10
    });
    setFormData({});
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Add your first inventory item to start receiving bookings.</p>
      
      <div>
        <Label>{typeLabels[supplier.supplier_type] || 'Item Name'}</Label>
        <Input
          value={formData.item_name || ''}
          onChange={(e) => setFormData({...formData, item_name: e.target.value})}
          placeholder="e.g., Deluxe Suite, Manila-Cebu Flight"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Available Quantity</Label>
          <Input
            type="number"
            value={formData.availability || ''}
            onChange={(e) => setFormData({...formData, availability: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <Label>Total Capacity</Label>
          <Input
            type="number"
            value={formData.total_capacity || ''}
            onChange={(e) => setFormData({...formData, total_capacity: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <Button onClick={handleAdd} disabled={createInventory.isPending || !formData.item_name}>
        Add to Inventory
      </Button>
    </div>
  );
}

function PricingStep({ supplier, formData, setFormData, createPricing }) {
  const handleCreate = () => {
    createPricing.mutate({
      supplier_id: supplier.id,
      rule_name: formData.rule_name || 'Base Pricing',
      rule_type: formData.rule_type || 'base',
      adjustment_type: 'percentage',
      adjustment_value: formData.adjustment_value || 0,
      is_active: true
    });
    setFormData({});
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Configure your pricing strategy and seasonal adjustments.</p>
      
      <div>
        <Label>Pricing Rule Name</Label>
        <Input
          value={formData.rule_name || ''}
          onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
          placeholder="e.g., Summer Peak Season"
        />
      </div>

      <div>
        <Label>Rule Type</Label>
        <Select value={formData.rule_type || 'base'} onValueChange={(v) => setFormData({...formData, rule_type: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">Base Pricing</SelectItem>
            <SelectItem value="seasonal">Seasonal</SelectItem>
            <SelectItem value="demand">Demand-Based</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Price Adjustment (%)</Label>
        <Input
          type="number"
          value={formData.adjustment_value || ''}
          onChange={(e) => setFormData({...formData, adjustment_value: parseFloat(e.target.value)})}
          placeholder="0 for base, +10 for 10% increase"
        />
      </div>

      <Button onClick={handleCreate} disabled={createPricing.isPending}>
        Create Pricing Rule
      </Button>
    </div>
  );
}

function FeaturesStep({ supplier }) {
  const features = [
    { icon: '📊', title: 'Real-time Analytics', desc: 'Track bookings and revenue in real-time' },
    { icon: '💬', title: 'Communications Hub', desc: 'Message with admins and get support' },
    { icon: '🤖', title: 'AI Pricing', desc: 'Let AI optimize your prices automatically' },
    { icon: '💰', title: 'Automated Payments', desc: 'Receive payouts on schedule' },
    { icon: '🎯', title: 'Promotions', desc: 'Create discount codes and special offers' },
    { icon: '📈', title: 'Reports', desc: 'Detailed revenue and performance reports' }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">Here's what you can do with your supplier portal:</p>
      
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h4 className="font-medium mb-1">{feature.title}</h4>
            <p className="text-sm text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ supplier, onboarding }) {
  const completedCount = onboarding?.completed_steps?.length || 0;
  const skippedCount = onboarding?.skipped_steps?.length || 0;

  return (
    <div className="space-y-6">
      <p className="text-slate-600">You're all set! Here's what you've completed:</p>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <p className="text-sm text-slate-600">Steps Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-slate-600">{skippedCount}</div>
            <p className="text-sm text-slate-600">Steps Skipped</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🎉 Welcome to GC Travel & Tours!</h4>
        <p className="text-sm text-blue-700">
          You can always access inventory management, pricing tools, and analytics from your dashboard.
          Our team is here to help if you need assistance.
        </p>
      </div>

      {skippedCount > 0 && (
        <p className="text-sm text-slate-600">
          You can complete skipped steps anytime from your dashboard settings.
        </p>
      )}
    </div>
  );
}
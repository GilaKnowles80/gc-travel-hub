import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag, TrendingUp, Zap, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('discount-codes');
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [editingRule, setEditingRule] = useState(null);

  // Discount Code State
  const [discountForm, setDiscountForm] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_discount: 0,
    min_purchase: 0,
    applicable_to: ['all'],
    valid_from: '',
    valid_until: '',
    usage_limit: 0,
    per_user_limit: 1,
    is_flash_sale: false,
    status: 'active'
  });

  // Pricing Rule State
  const [ruleForm, setRuleForm] = useState({
    rule_name: '',
    rule_type: 'seasonal',
    item_type: 'flight',
    adjustment_type: 'percentage',
    adjustment_value: 0,
    is_increase: false,
    season_months: [],
    min_days_advance: 0,
    max_days_before: 0,
    demand_level: 'normal',
    status: 'active'
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: () => base44.entities.DiscountCode.list('-created_date')
  });

  const { data: pricingRules = [] } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: () => base44.entities.PricingRule.list('-created_date')
  });

  const { data: discountUsage = [] } = useQuery({
    queryKey: ['discount-usage'],
    queryFn: () => base44.entities.DiscountUsage.list('-created_date', 100)
  });

  const createDiscountMutation = useMutation({
    mutationFn: (data) => {
      if (editingDiscount) {
        return base44.entities.DiscountCode.update(editingDiscount.id, data);
      }
      return base44.entities.DiscountCode.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discount-codes']);
      setShowDiscountDialog(false);
      resetDiscountForm();
      toast.success(editingDiscount ? 'Discount updated!' : 'Discount code created!');
    }
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => {
      if (editingRule) {
        return base44.entities.PricingRule.update(editingRule.id, data);
      }
      return base44.entities.PricingRule.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules']);
      setShowRuleDialog(false);
      resetRuleForm();
      toast.success(editingRule ? 'Rule updated!' : 'Pricing rule created!');
    }
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscountCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['discount-codes']);
      toast.success('Discount deleted');
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.PricingRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules']);
      toast.success('Rule deleted');
    }
  });

  const resetDiscountForm = () => {
    setDiscountForm({
      code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      max_discount: 0,
      min_purchase: 0,
      applicable_to: ['all'],
      valid_from: '',
      valid_until: '',
      usage_limit: 0,
      per_user_limit: 1,
      is_flash_sale: false,
      status: 'active'
    });
    setEditingDiscount(null);
  };

  const resetRuleForm = () => {
    setRuleForm({
      rule_name: '',
      rule_type: 'seasonal',
      item_type: 'flight',
      adjustment_type: 'percentage',
      adjustment_value: 0,
      is_increase: false,
      season_months: [],
      min_days_advance: 0,
      max_days_before: 0,
      demand_level: 'normal',
      status: 'active'
    });
    setEditingRule(null);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm(discount);
    setShowDiscountDialog(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm(rule);
    setShowRuleDialog(true);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dynamic Pricing & Promotions</h1>
            <p className="text-slate-600">Manage discount codes, flash sales, and dynamic pricing rules</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-6">
            <TabsTrigger value="discount-codes">
              <Tag className="w-4 h-4 mr-2" />
              Discount Codes
            </TabsTrigger>
            <TabsTrigger value="pricing-rules">
              <TrendingUp className="w-4 h-4 mr-2" />
              Pricing Rules
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Zap className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discount-codes">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { resetDiscountForm(); setShowDiscountDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Discount Code
              </Button>
            </div>

            <div className="grid gap-4">
              {discountCodes.map((discount) => (
                <Card key={discount.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="px-3 py-1 bg-slate-900 text-white rounded-lg font-mono font-bold">
                            {discount.code}
                          </code>
                          <Button size="sm" variant="ghost" onClick={() => copyCode(discount.code)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className={discount.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                            {discount.status}
                          </Badge>
                          {discount.is_flash_sale && (
                            <Badge className="bg-red-100 text-red-700">
                              <Zap className="w-3 h-3 mr-1" />
                              Flash Sale
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{discount.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{discount.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-700">
                            <strong>Discount:</strong> {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `$${discount.discount_value}`}
                          </span>
                          <span className="text-slate-700">
                            <strong>Used:</strong> {discount.usage_count || 0} / {discount.usage_limit || '∞'}
                          </span>
                          {discount.valid_until && (
                            <span className="text-slate-700">
                              <strong>Expires:</strong> {new Date(discount.valid_until).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditDiscount(discount)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteDiscountMutation.mutate(discount.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing-rules">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { resetRuleForm(); setShowRuleDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pricing Rule
              </Button>
            </div>

            <div className="grid gap-4">
              {pricingRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{rule.rule_name}</h3>
                          <Badge>{rule.rule_type}</Badge>
                          <Badge className={rule.is_increase ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                            {rule.is_increase ? '↑' : '↓'} {rule.adjustment_type === 'percentage' ? `${rule.adjustment_value}%` : `$${rule.adjustment_value}`}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">Applies to: <strong>{rule.item_type}</strong></p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Total Codes</div>
                  <div className="text-3xl font-bold">{discountCodes.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Total Usage</div>
                  <div className="text-3xl font-bold">{discountUsage.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-1">Total Savings</div>
                  <div className="text-3xl font-bold">
                    ${discountUsage.reduce((sum, u) => sum + (u.discount_amount || 0), 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Discount Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discountUsage.slice(0, 10).map((usage) => (
                    <div key={usage.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{usage.user_email}</p>
                        <p className="text-sm text-slate-600">{usage.booking_type} booking</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">-${usage.discount_amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{new Date(usage.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Discount Code Dialog */}
        <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit' : 'Create'} Discount Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Code *</Label>
                  <Input
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                    placeholder="SUMMER2026"
                  />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={discountForm.title}
                    onChange={(e) => setDiscountForm({...discountForm, title: e.target.value})}
                    placeholder="Summer Sale"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                  placeholder="Get discount on all bookings"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Discount Type *</Label>
                  <Select value={discountForm.discount_type} onValueChange={(v) => setDiscountForm({...discountForm, discount_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    value={discountForm.discount_value}
                    onChange={(e) => setDiscountForm({...discountForm, discount_value: parseFloat(e.target.value)})}
                  />
                </div>
                {discountForm.discount_type === 'percentage' && (
                  <div>
                    <Label>Max Discount Cap</Label>
                    <Input
                      type="number"
                      value={discountForm.max_discount}
                      onChange={(e) => setDiscountForm({...discountForm, max_discount: parseFloat(e.target.value)})}
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Min Purchase</Label>
                  <Input
                    type="number"
                    value={discountForm.min_purchase}
                    onChange={(e) => setDiscountForm({...discountForm, min_purchase: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Usage Limit (0 = unlimited)</Label>
                  <Input
                    type="number"
                    value={discountForm.usage_limit}
                    onChange={(e) => setDiscountForm({...discountForm, usage_limit: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Valid From</Label>
                  <Input
                    type="datetime-local"
                    value={discountForm.valid_from}
                    onChange={(e) => setDiscountForm({...discountForm, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="datetime-local"
                    value={discountForm.valid_until}
                    onChange={(e) => setDiscountForm({...discountForm, valid_until: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={discountForm.is_flash_sale}
                  onCheckedChange={(checked) => setDiscountForm({...discountForm, is_flash_sale: checked})}
                />
                <Label>Mark as Flash Sale</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>Cancel</Button>
                <Button onClick={() => createDiscountMutation.mutate(discountForm)}>
                  {editingDiscount ? 'Update' : 'Create'} Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pricing Rule Dialog */}
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit' : 'Create'} Pricing Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name *</Label>
                  <Input
                    value={ruleForm.rule_name}
                    onChange={(e) => setRuleForm({...ruleForm, rule_name: e.target.value})}
                    placeholder="Peak Season Surcharge"
                  />
                </div>
                <div>
                  <Label>Rule Type *</Label>
                  <Select value={ruleForm.rule_type} onValueChange={(v) => setRuleForm({...ruleForm, rule_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="advance_booking">Advance Booking</SelectItem>
                      <SelectItem value="demand">Demand-Based</SelectItem>
                      <SelectItem value="last_minute">Last Minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Item Type *</Label>
                  <Select value={ruleForm.item_type} onValueChange={(v) => setRuleForm({...ruleForm, item_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adjustment Type *</Label>
                  <Select value={ruleForm.adjustment_type} onValueChange={(v) => setRuleForm({...ruleForm, adjustment_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adjustment Value *</Label>
                  <Input
                    type="number"
                    value={ruleForm.adjustment_value}
                    onChange={(e) => setRuleForm({...ruleForm, adjustment_value: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={ruleForm.is_increase}
                  onCheckedChange={(checked) => setRuleForm({...ruleForm, is_increase: checked})}
                />
                <Label>Increase Price (uncheck for discount)</Label>
              </div>

              {ruleForm.rule_type === 'advance_booking' && (
                <div>
                  <Label>Minimum Days in Advance</Label>
                  <Input
                    type="number"
                    value={ruleForm.min_days_advance}
                    onChange={(e) => setRuleForm({...ruleForm, min_days_advance: parseInt(e.target.value)})}
                  />
                </div>
              )}

              {ruleForm.rule_type === 'last_minute' && (
                <div>
                  <Label>Max Days Before Departure</Label>
                  <Input
                    type="number"
                    value={ruleForm.max_days_before}
                    onChange={(e) => setRuleForm({...ruleForm, max_days_before: parseInt(e.target.value)})}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
                <Button onClick={() => createRuleMutation.mutate(ruleForm)}>
                  {editingRule ? 'Update' : 'Create'} Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPricingSettings({ supplierId }) {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['ai-pricing-settings', supplierId],
    queryFn: async () => {
      const result = await base44.entities.AIPricingSettings.filter({ supplier_id: supplierId });
      return result[0] || null;
    }
  });

  const [formData, setFormData] = useState({
    ai_enabled: settings?.ai_enabled || false,
    auto_apply: settings?.auto_apply || false,
    max_increase_percentage: settings?.max_increase_percentage || 20,
    max_decrease_percentage: settings?.max_decrease_percentage || 30,
    min_confidence_score: settings?.min_confidence_score || 70,
    update_frequency: settings?.update_frequency || 'weekly',
    priority_metric: settings?.priority_metric || 'balanced'
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        ai_enabled: settings.ai_enabled,
        auto_apply: settings.auto_apply,
        max_increase_percentage: settings.max_increase_percentage,
        max_decrease_percentage: settings.max_decrease_percentage,
        min_confidence_score: settings.min_confidence_score,
        update_frequency: settings.update_frequency,
        priority_metric: settings.priority_metric
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return base44.entities.AIPricingSettings.update(settings.id, data);
      } else {
        return base44.entities.AIPricingSettings.create({ ...data, supplier_id: supplierId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-pricing-settings']);
      toast.success('AI settings saved');
    }
  });

  const runAnalysisMutation = useMutation({
    mutationFn: () => base44.functions.invoke('aiDynamicPricing', { supplier_id: supplierId }),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['ai-pricing-suggestions']);
      toast.success(result.data.message || 'Analysis complete');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Dynamic Pricing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="font-medium">Enable AI Pricing</p>
              <p className="text-sm text-slate-600">Let AI analyze and suggest optimal prices</p>
            </div>
            <Switch
              checked={formData.ai_enabled}
              onCheckedChange={(checked) => setFormData({...formData, ai_enabled: checked})}
            />
          </div>

          {formData.ai_enabled && (
            <>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Auto-Apply Suggestions</p>
                  <p className="text-sm text-slate-600">Automatically apply high-confidence suggestions</p>
                </div>
                <Switch
                  checked={formData.auto_apply}
                  onCheckedChange={(checked) => setFormData({...formData, auto_apply: checked})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Price Increase (%)</Label>
                  <Input
                    type="number"
                    value={formData.max_increase_percentage}
                    onChange={(e) => setFormData({...formData, max_increase_percentage: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Max Price Decrease (%)</Label>
                  <Input
                    type="number"
                    value={formData.max_decrease_percentage}
                    onChange={(e) => setFormData({...formData, max_decrease_percentage: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label>Minimum AI Confidence Score</Label>
                <Input
                  type="number"
                  value={formData.min_confidence_score}
                  onChange={(e) => setFormData({...formData, min_confidence_score: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-slate-500 mt-1">Only show suggestions with confidence above this threshold</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Update Frequency</Label>
                  <Select 
                    value={formData.update_frequency} 
                    onValueChange={(v) => setFormData({...formData, update_frequency: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Optimization Priority</Label>
                  <Select 
                    value={formData.priority_metric} 
                    onValueChange={(v) => setFormData({...formData, priority_metric: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Maximize Revenue</SelectItem>
                      <SelectItem value="bookings">Maximize Bookings</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate(formData)} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            {formData.ai_enabled && (
              <Button 
                onClick={() => runAnalysisMutation.mutate()}
                disabled={runAnalysisMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                <Zap className="w-4 h-4 mr-2" />
                Run AI Analysis Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
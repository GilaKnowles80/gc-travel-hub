import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Power } from "lucide-react";

export default function AdminPricing() {
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    item_type: "flight",
    rule_type: "seasonality",
    multiplier: 1,
    start_date: "",
    end_date: "",
    is_active: true,
    badge_text: "",
    badge_color: "blue",
  });

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["admin-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => base44.asServiceRole.entities.PricingRule.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.PricingRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.PricingRule.update(selectedRule.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      setSelectedRule(null);
      resetForm();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (rule) => base44.asServiceRole.entities.PricingRule.update(rule.id, { is_active: !rule.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricing-rules"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.PricingRule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricing-rules"] }),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      item_type: "flight",
      rule_type: "seasonality",
      multiplier: 1,
      start_date: "",
      end_date: "",
      is_active: true,
      badge_text: "",
      badge_color: "blue",
    });
    setSelectedRule(null);
  };

  const handleSubmit = () => {
    if (selectedRule) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (userLoading) return <div className="p-8">Loading...</div>;
  if (user?.role !== "admin") return <div className="p-8 text-red-600">Admin access required</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Dynamic Pricing Rules</h1>
          <p className="mt-3 text-slate-400">Manage pricing strategies for flights and hotels</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Create/Edit Dialog */}
        <Dialog open={!!selectedRule} onOpenChange={(open) => !open && resetForm()}>
          <DialogTrigger asChild>
            <Button className="mb-6 bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" />
              Add Pricing Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedRule ? "Edit Rule" : "Create Pricing Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., High Season"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Item Type</label>
                  <select
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Rule Type</label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="seasonality">Seasonality</option>
                    <option value="demand">Demand</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Price Multiplier</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3"
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                  placeholder="1.0 = no change, 1.5 = 50% increase, 0.8 = 20% discount"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.multiplier > 1
                    ? `+${Math.round((formData.multiplier - 1) * 100)}% increase`
                    : formData.multiplier < 1
                    ? `${Math.round((1 - formData.multiplier) * 100)}% discount`
                    : "No change"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Badge Text</label>
                  <Input
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    placeholder="e.g., High Season"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Badge Color</label>
                  <select
                    value={formData.badge_color}
                    onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full bg-amber-500 hover:bg-amber-600">
                {selectedRule ? "Update" : "Create"} Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rules List */}
        {rulesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="border-0 shadow-sm rounded-2xl">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{rule.name}</h3>
                        <Badge className={`capitalize text-xs border ${
                          rule.item_type === "flight" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-purple-100 text-purple-800 border-purple-200"
                        }`}>
                          {rule.item_type}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 border capitalize text-xs">
                          {rule.rule_type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600 mt-3">
                        <div>
                          <p className="text-xs text-slate-500">Multiplier</p>
                          <p className="font-semibold">
                            {rule.multiplier > 1 ? `+${Math.round((rule.multiplier - 1) * 100)}%` : `${Math.round((1 - rule.multiplier) * 100)}%`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Start</p>
                          <p className="font-semibold">{new Date(rule.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">End</p>
                          <p className="font-semibold">{new Date(rule.end_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Status</p>
                          <Badge className={rule.is_active ? "bg-green-100 text-green-800 border-green-200 border" : "bg-slate-100 text-slate-800 border-slate-200 border"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMutation.mutate(rule)}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRule(rule);
                          setFormData(rule);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => deleteMutation.mutate(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
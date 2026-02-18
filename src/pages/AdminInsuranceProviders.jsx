import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

const defaultCoverageTypes = [
    {
        type: "basic",
        name: "Basic Protection",
        base_price: 25,
        coverage_amount: 50000,
        benefits: [
            "Trip cancellation up to $50,000",
            "Medical emergency coverage",
            "Lost baggage up to $1,000",
            "24/7 travel assistance"
        ]
    },
    {
        type: "standard",
        name: "Standard Coverage",
        base_price: 50,
        coverage_amount: 100000,
        benefits: [
            "Trip cancellation up to $100,000",
            "Medical emergency & evacuation",
            "Lost baggage up to $2,500",
            "Travel delay compensation",
            "24/7 travel assistance",
            "COVID-19 coverage"
        ]
    },
    {
        type: "premium",
        name: "Premium Protection",
        base_price: 100,
        coverage_amount: 250000,
        benefits: [
            "Trip cancellation up to $250,000",
            "Comprehensive medical coverage",
            "Lost baggage up to $5,000",
            "Travel delay & missed connections",
            "Cancel for any reason (75% refund)",
            "Adventure sports coverage",
            "24/7 concierge service",
            "COVID-19 coverage"
        ]
    },
    {
        type: "comprehensive",
        name: "Comprehensive Elite",
        base_price: 200,
        coverage_amount: 500000,
        benefits: [
            "Trip cancellation up to $500,000",
            "Premium medical & emergency evacuation",
            "Lost baggage up to $10,000",
            "All travel delays & interruptions",
            "Cancel for any reason (100% refund)",
            "Extreme adventure sports coverage",
            "Rental car protection",
            "Identity theft protection",
            "VIP concierge service",
            "COVID-19 & pandemic coverage"
        ]
    }
];

export default function AdminInsuranceProviders() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newProvider, setNewProvider] = useState({
        provider_name: "",
        provider_code: "",
        logo_url: "",
        commission_rate: 15,
        coverage_types: defaultCoverageTypes,
        is_active: true
    });

    const queryClient = useQueryClient();

    const { data: providers = [], isLoading } = useQuery({
        queryKey: ['insuranceProviders'],
        queryFn: () => base44.entities.InsuranceProvider.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.InsuranceProvider.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['insuranceProviders']);
            setIsAddDialogOpen(false);
            setNewProvider({
                provider_name: "",
                provider_code: "",
                logo_url: "",
                commission_rate: 15,
                coverage_types: defaultCoverageTypes,
                is_active: true
            });
            toast.success('Provider added successfully');
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, is_active }) => 
            base44.entities.InsuranceProvider.update(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries(['insuranceProviders']);
            toast.success('Provider status updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.InsuranceProvider.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['insuranceProviders']);
            toast.success('Provider deleted');
        }
    });

    const handleCreate = () => {
        if (!newProvider.provider_name || !newProvider.provider_code) {
            toast.error('Please fill in required fields');
            return;
        }
        createMutation.mutate(newProvider);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Insurance Providers</h1>
                        </div>
                        <p className="text-slate-600">Manage travel insurance providers and coverage plans</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Provider
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Insurance Provider</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Provider Name *</Label>
                                    <Input
                                        value={newProvider.provider_name}
                                        onChange={(e) => setNewProvider({...newProvider, provider_name: e.target.value})}
                                        placeholder="e.g., SafeTrip Insurance"
                                    />
                                </div>
                                <div>
                                    <Label>Provider Code *</Label>
                                    <Input
                                        value={newProvider.provider_code}
                                        onChange={(e) => setNewProvider({...newProvider, provider_code: e.target.value})}
                                        placeholder="e.g., SAFE"
                                    />
                                </div>
                                <div>
                                    <Label>Logo URL</Label>
                                    <Input
                                        value={newProvider.logo_url}
                                        onChange={(e) => setNewProvider({...newProvider, logo_url: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <Label>Commission Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={newProvider.commission_rate}
                                        onChange={(e) => setNewProvider({...newProvider, commission_rate: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-900 font-semibold mb-2">Coverage Plans Included:</p>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        {defaultCoverageTypes.map((ct) => (
                                            <li key={ct.type}>• {ct.name} - ${ct.base_price} base</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button onClick={handleCreate} className="w-full">
                                    Create Provider
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    {providers.map((provider) => (
                        <Card key={provider.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {provider.logo_url && (
                                            <img 
                                                src={provider.logo_url} 
                                                alt={provider.provider_name}
                                                className="w-16 h-16 object-contain"
                                            />
                                        )}
                                        <div>
                                            <CardTitle>{provider.provider_name}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{provider.provider_code}</Badge>
                                                <Badge className={provider.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}>
                                                    {provider.is_active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                                    {provider.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleActiveMutation.mutate({ 
                                                id: provider.id, 
                                                is_active: !provider.is_active 
                                            })}
                                        >
                                            {provider.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(provider.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {provider.coverage_types?.map((coverage) => (
                                        <div key={coverage.type} className="border rounded-lg p-3">
                                            <h4 className="font-semibold text-sm mb-1">{coverage.name}</h4>
                                            <p className="text-xs text-slate-600 mb-2">
                                                ${coverage.coverage_amount.toLocaleString()} coverage
                                            </p>
                                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                Base: ${coverage.base_price}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {providers.length === 0 && !isLoading && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">No insurance providers configured</p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                                Add Your First Provider
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
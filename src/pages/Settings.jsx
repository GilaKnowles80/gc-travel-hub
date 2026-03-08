import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Percent, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
    const queryClient = useQueryClient();
    const [markup, setMarkup] = useState("");

    const { data: user, isLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    useEffect(() => {
        if (user?.markup_percentage !== undefined) {
            setMarkup(user.markup_percentage.toString());
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            await base44.auth.updateMe(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
            toast.success('Settings saved successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save settings');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const markupValue = parseFloat(markup);
        
        if (isNaN(markupValue) || markupValue < 0) {
            toast.error('Please enter a valid markup percentage');
            return;
        }

        updateMutation.mutate({ markup_percentage: markupValue });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="py-12 text-center">
                        <p className="text-lg text-slate-600">Admin access required</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="w-5 h-5" />
                            Pricing Configuration
                        </CardTitle>
                        <CardDescription>
                            Set your markup percentage for flights and hotels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="markup">Markup Percentage</Label>
                                <div className="relative">
                                    <Input
                                        id="markup"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={markup}
                                        onChange={(e) => setMarkup(e.target.value)}
                                        placeholder="e.g., 10"
                                        className="pr-12"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        %
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    This percentage will be added to the base price of flights and hotels
                                </p>
                            </div>

                            {markup && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 font-medium mb-2">Example:</p>
                                    <div className="space-y-1 text-sm text-blue-800">
                                        <div className="flex justify-between">
                                            <span>Base Price:</span>
                                            <span>$1,000.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Your Markup ({markup}%):</span>
                                            <span>${(1000 * parseFloat(markup || 0) / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t border-blue-300 pt-1 mt-1">
                                            <span>Customer Pays:</span>
                                            <span>${(1000 * (1 + parseFloat(markup || 0) / 100)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full bg-amber-500 hover:bg-amber-600"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
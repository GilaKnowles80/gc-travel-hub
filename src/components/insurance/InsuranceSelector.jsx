import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Check, Loader2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";

export default function InsuranceSelector({ 
    destination, 
    startDate, 
    endDate, 
    tripCost, 
    travelers = 1,
    onSelect,
    selectedInsurance 
}) {
    const [expandedQuote, setExpandedQuote] = useState(null);
    const [wantInsurance, setWantInsurance] = useState(false);

    const { data: quotesData, isLoading } = useQuery({
        queryKey: ['insuranceQuotes', destination, startDate, endDate, tripCost, travelers],
        queryFn: async () => {
            const response = await base44.functions.invoke('getInsuranceQuotes', {
                destination,
                startDate,
                endDate,
                tripCost,
                travelers
            });
            return response.data;
        },
        enabled: wantInsurance
    });

    const quotes = quotesData?.quotes || [];

    const handleSelectInsurance = (quote) => {
        onSelect(quote);
        toast.success('Insurance plan selected');
    };

    const handleSkipInsurance = () => {
        onSelect(null);
        setWantInsurance(false);
    };

    return (
        <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <div>
                            <CardTitle className="text-xl">Protect Your Trip</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                                Travel with peace of mind. Get coverage for cancellations, medical emergencies, and more
                            </p>
                        </div>
                    </div>
                    <Checkbox
                        checked={wantInsurance}
                        onCheckedChange={setWantInsurance}
                    />
                </div>
            </CardHeader>

            {wantInsurance && (
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-slate-600">Loading insurance quotes...</span>
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="text-center py-8">
                            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No insurance plans available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {quotes.map((quote, idx) => (
                                <div
                                    key={idx}
                                    className={`border-2 rounded-lg transition-all ${
                                        selectedInsurance?.coverage_type === quote.coverage_type &&
                                        selectedInsurance?.provider_id === quote.provider_id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300'
                                    } ${quote.recommended ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-900">
                                                        {quote.coverage_name}
                                                    </h4>
                                                    {quote.recommended && (
                                                        <Badge className="bg-amber-500 text-white">
                                                            Recommended
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    by {quote.provider_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    ${quote.premium}
                                                </div>
                                                <p className="text-xs text-slate-500">per person</p>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <Badge variant="outline" className="text-xs">
                                                Coverage up to ${quote.coverage_amount.toLocaleString()}
                                            </Badge>
                                        </div>

                                        <Button
                                            variant={expandedQuote === idx ? 'ghost' : 'outline'}
                                            size="sm"
                                            onClick={() => setExpandedQuote(expandedQuote === idx ? null : idx)}
                                            className="w-full mb-3"
                                        >
                                            {expandedQuote === idx ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-1" />
                                                    Hide Details
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                    View Benefits
                                                </>
                                            )}
                                        </Button>

                                        {expandedQuote === idx && (
                                            <div className="bg-white rounded-lg p-3 mb-3 border">
                                                <p className="text-sm font-semibold text-slate-700 mb-2">
                                                    What's Covered:
                                                </p>
                                                <ul className="space-y-1.5">
                                                    {quote.benefits.map((benefit, bIdx) => (
                                                        <li key={bIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                            <span>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <Button
                                            onClick={() => handleSelectInsurance(quote)}
                                            className={`w-full ${
                                                selectedInsurance?.coverage_type === quote.coverage_type &&
                                                selectedInsurance?.provider_id === quote.provider_id
                                                    ? 'bg-blue-600'
                                                    : 'bg-slate-900'
                                            }`}
                                        >
                                            {selectedInsurance?.coverage_type === quote.coverage_type &&
                                            selectedInsurance?.provider_id === quote.provider_id ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Selected
                                                </>
                                            ) : (
                                                'Select Plan'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="ghost"
                                onClick={handleSkipInsurance}
                                className="w-full"
                            >
                                Continue without insurance
                            </Button>

                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                    Travel insurance is optional but highly recommended. Coverage includes trip
                                    cancellation, medical emergencies, lost baggage, and more.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
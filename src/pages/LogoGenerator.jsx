import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, Loader2 } from "lucide-react";

export default function LogoGenerator() {
    const [loading, setLoading] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState(null);
    const [error, setError] = useState(null);

    const generateLogo = async () => {
        setLoading(true);
        setError(null);
        setGeneratedUrl(null);

        try {
            const result = await base44.integrations.Core.GenerateImage({
                prompt: "Professional app icon logo for 'GC Travel and Tours'. Modern minimalist design featuring a stylized blue globe/earth icon at the top with white continents, bold 'GC' letters in gradient blue below the globe, and elegant text 'TRAVEL AND TOURS' underneath. Clean solid vibrant orange/yellow (#FF5722) background. Rounded square app icon format. High quality, sharp, vector-style, professional travel agency branding, suitable for mobile app store. No texture, no background patterns, flat design, centered composition, 1024x1024 pixels."
            });

            setGeneratedUrl(result.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = () => {
        if (generatedUrl) {
            const link = document.createElement('a');
            link.href = generatedUrl;
            link.download = 'gc-travel-logo-polished.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                            Polish Your Logo with AI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Current Logo:</h3>
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/91408dd49_20260219_085253.jpg"
                                alt="Current Logo"
                                className="w-48 h-48 rounded-lg border-2 border-slate-200"
                            />
                        </div>

                        <Button
                            onClick={generateLogo}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Polished Logo...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Polished Logo
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <p className="font-semibold">Error:</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {generatedUrl && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">✨ Your Polished Logo:</h3>
                                    <img 
                                        src={generatedUrl}
                                        alt="Polished Logo"
                                        className="w-full max-w-md rounded-lg border-2 border-amber-200 shadow-lg"
                                    />
                                </div>
                                
                                <Button
                                    onClick={downloadImage}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Polished Logo
                                </Button>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800">
                                        <strong>Next Steps:</strong> Download this logo and use it for your Google Play Store submission!
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
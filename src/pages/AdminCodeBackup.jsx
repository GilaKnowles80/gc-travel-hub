import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Shield, Database, Code, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCodeBackup() {
    const [includeData, setIncludeData] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);

    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            const response = await base44.functions.invoke('exportCodeBackup', {
                includeData,
                format
            });

            if (format === 'json') {
                // Download as JSON file
                const blob = new Blob([JSON.stringify(response.data.backup, null, 2)], { 
                    type: 'application/json' 
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gc-travel-backup-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                toast.success('Backup downloaded successfully');
            } else {
                setLastBackup(response.data.backup);
                toast.success('Backup generated successfully');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export backup: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const copyToClipboard = () => {
        if (lastBackup) {
            navigator.clipboard.writeText(JSON.stringify(lastBackup, null, 2));
            toast.success('Backup copied to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Code Backup & Export</h1>
                    </div>
                    <p className="text-slate-600">
                        Secure backup and export of your entire GC Travel and Tours codebase
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">Option 1</h3>
                                    <p className="text-sm text-blue-700">Manual Backup</p>
                                </div>
                            </div>
                            <p className="text-sm text-blue-800 mb-3">
                                Access files directly from Base44 dashboard code editor
                            </p>
                            <Badge className="bg-blue-600 text-white">Available</Badge>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-900">Option 2</h3>
                                    <p className="text-sm text-purple-700">Automated Export</p>
                                </div>
                            </div>
                            <p className="text-sm text-purple-800 mb-3">
                                Download complete backup as JSON file
                            </p>
                            <Badge className="bg-purple-600 text-white">Active</Badge>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                                    <Database className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">Option 3</h3>
                                    <p className="text-sm text-green-700">Database Backup</p>
                                </div>
                            </div>
                            <p className="text-sm text-green-800 mb-3">
                                Backup all database records and data
                            </p>
                            <Badge className="bg-green-600 text-white">Available</Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-2 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Export Configuration
                        </CardTitle>
                        <CardDescription>
                            Configure what to include in your backup export
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="includeData"
                                checked={includeData}
                                onCheckedChange={setIncludeData}
                            />
                            <Label htmlFor="includeData" className="cursor-pointer">
                                Include entity data (up to 100 records per entity)
                            </Label>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="font-semibold text-slate-900 mb-2">Backup Includes:</h4>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    44 Entity schemas (Flight, Hotel, Booking, etc.)
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    50+ Backend functions
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    50+ Pages structure
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    80+ Components list
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Configuration & integrations info
                                </li>
                                {includeData && (
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        Sample data from all entities
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={() => handleExport('json')}
                                disabled={isExporting}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download JSON
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={() => handleExport('view')}
                                disabled={isExporting}
                                variant="outline"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        View in Browser
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {lastBackup && (
                    <Card className="border-2 border-green-200 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Backup Generated</span>
                                <Button onClick={copyToClipboard} variant="outline" size="sm">
                                    Copy to Clipboard
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs">
                                <pre>{JSON.stringify(lastBackup, null, 2)}</pre>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                                <div>
                                    <span className="font-semibold">Entities:</span> {Object.keys(lastBackup.entities || {}).length}
                                </div>
                                <div>
                                    <span className="font-semibold">Exported:</span> {lastBackup.metadata?.exportDate}
                                </div>
                                <div>
                                    <span className="font-semibold">By:</span> {lastBackup.metadata?.exportedBy}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
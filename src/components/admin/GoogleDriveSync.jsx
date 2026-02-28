import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GoogleDriveSync() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('syncItinerariesToDrive');
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to sync itineraries');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle>Google Drive Sync</CardTitle>
            <CardDescription>Sync travel itineraries to Google Drive</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Automatically backup all travel itineraries to your Google Drive account as markdown files.
        </p>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full"
        >
          {syncing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Synced {result.synced} of {result.total} itineraries</strong>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2 text-xs">
                  {result.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Sheet, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const BOOKING_TYPES = [
  { id: 'flight', label: 'Flights' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'tour', label: 'Tours' },
  { id: 'ferry', label: 'Ferries' },
  { id: 'bus', label: 'Buses' }
];

export default function GoogleSheetsSync() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sheetId, setSheetId] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['flight', 'hotel', 'tour', 'ferry', 'bus']);

  const handleSync = async () => {
    if (!sheetId.trim()) {
      setError('Please enter a Google Sheet ID');
      return;
    }

    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('syncBookingsToSheets', {
        sheetId: sheetId.trim(),
        bookingTypes: selectedTypes
      });
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to sync bookings');
    } finally {
      setSyncing(false);
    }
  };

  const toggleType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sheet className="w-5 h-5 text-green-600" />
          <div>
            <CardTitle>Google Sheets Sync</CardTitle>
            <CardDescription>Export booking data to a Google Sheet</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-id">Google Sheet ID</Label>
          <Input
            id="sheet-id"
            placeholder="Paste the Sheet ID (from URL: /spreadsheets/d/{SHEET_ID}/edit)"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            disabled={syncing}
          />
          <p className="text-xs text-slate-500">
            Find the Sheet ID in the URL: sheets.google.com/d/<strong>SHEET_ID</strong>/edit
          </p>
        </div>

        <div className="space-y-3">
          <Label>Booking Types to Sync</Label>
          <div className="grid grid-cols-2 gap-3">
            {BOOKING_TYPES.map(type => (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => toggleType(type.id)}
                  disabled={syncing}
                />
                <label htmlFor={type.id} className="text-sm cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing || !sheetId.trim()}
          className="w-full"
        >
          {syncing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Synced {result.rowsSync} bookings</strong> to Google Sheets
              <div className="mt-2 text-xs">
                Updated {result.updatedRows} rows and {result.updatedCells} cells
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${result.sheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-green-700 hover:underline"
              >
                Open in Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>How to get your Sheet ID:</strong>
          <ol className="list-decimal list-inside mt-2 text-xs space-y-1">
            <li>Open your Google Sheet</li>
            <li>Copy the ID from the URL between "/d/" and "/edit"</li>
            <li>Paste it above and click Sync</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
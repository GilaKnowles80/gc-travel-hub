import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';

export default function TravelItineraryDocBuilder() {
  const [creating, setCreating] = useState(false);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('5');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    if (!duration || parseInt(duration) < 1 || parseInt(duration) > 30) {
      setError('Duration must be between 1 and 30 days');
      return;
    }

    setCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('createTravelItineraryDoc', {
        destination: destination.trim(),
        duration: parseInt(duration),
        title: `${destination.trim()} - ${duration} Day Itinerary`
      });
      setResult(response.data);
      setDestination('');
      setDuration('5');
    } catch (err) {
      setError(err.message || 'Failed to create itinerary');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle>Travel Itinerary Generator</CardTitle>
            <CardDescription>Create detailed itinerary outlines in Google Docs</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="e.g., Tokyo, Japan"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={creating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Trip Duration (days)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={creating}
          />
        </div>

        <Button
          onClick={handleCreate}
          disabled={creating || !destination.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {creating ? 'Creating...' : 'Create Itinerary'}
        </Button>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Itinerary created for {result.destination}!</strong>
              <div className="mt-3 flex gap-2">
                <a
                  href={result.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Open in Google Docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
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

        <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg space-y-2">
          <p className="font-semibold">Itinerary includes:</p>
          <ul className="space-y-1">
            <li>✓ Day-by-day breakdown with activities</li>
            <li>✓ Meal planning sections</li>
            <li>✓ Accommodation details</li>
            <li>✓ Travel information (visa, currency, etc.)</li>
            <li>✓ Emergency contacts</li>
            <li>✓ Transportation notes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
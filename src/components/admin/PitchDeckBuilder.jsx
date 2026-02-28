import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Presentation, ExternalLink } from 'lucide-react';

export default function PitchDeckBuilder() {
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('createGCTravelPitchDeck');
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to create pitch deck');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-purple-600" />
          <div>
            <CardTitle>Pitch Deck Builder</CardTitle>
            <CardDescription>Generate a professional client pitch deck for GC Travel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
          <p className="font-semibold mb-2">Includes:</p>
          <ul className="space-y-1 text-xs">
            <li>✓ Title & branding slide</li>
            <li>✓ About GC Travel</li>
            <li>✓ Services overview</li>
            <li>✓ Competitive advantages</li>
            <li>✓ Global reach & destinations</li>
            <li>✓ Customer testimonials</li>
            <li>✓ Pricing & packages</li>
            <li>✓ Call-to-action slide</li>
          </ul>
        </div>

        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {creating ? 'Creating Deck...' : 'Create Pitch Deck'}
        </Button>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Pitch deck created successfully!</strong>
              <div className="mt-3 flex gap-2">
                <a
                  href={result.presentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Open in Google Slides <ExternalLink className="w-3 h-3" />
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

        <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
          The deck opens in edit mode. Customize it with your company colors, logos, and specific content to match your presentation needs.
        </div>
      </CardContent>
    </Card>
  );
}
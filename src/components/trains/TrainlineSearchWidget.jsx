import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Train, ArrowRight, ExternalLink, Loader } from 'lucide-react';
import StationSelector from './StationSelector';

export default function TrainlineSearchWidget() {
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  const handleSearch = async () => {
    if (!filters.origin || !filters.destination || !filters.date) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('searchTrainline', {
        origin: filters.origin,
        destination: filters.destination,
        departure_date: filters.date
      });

      if (response.data?.redirect_url) {
        // Open Trainline in new tab
        window.open(response.data.redirect_url, '_blank');
        setRedirectUrl(response.data.redirect_url);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching Trainline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 mb-8">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Train className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-blue-900">Search via Trainline</h3>
            <Badge className="bg-blue-600 text-white">Official Partner</Badge>
          </div>
          <p className="text-sm text-slate-600">Access Trainline's network of 270+ European carriers and coaches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <StationSelector 
            value={filters.origin} 
            onChange={(v) => setFilters({...filters, origin: v})} 
            placeholder="From station..." 
          />
          <StationSelector 
            value={filters.destination} 
            onChange={(v) => setFilters({...filters, destination: v})} 
            placeholder="To station..." 
          />
          <Input 
            type="date" 
            value={filters.date} 
            onChange={(e) => setFilters({...filters, date: e.target.value})} 
            className="md:col-span-1"
          />
          <Button 
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Search on Trainline
              </>
            )}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
          <span className="inline-block">📍</span> 45+ countries | 270+ carriers | Real-time availability
        </div>
      </CardContent>
    </Card>
  );
}
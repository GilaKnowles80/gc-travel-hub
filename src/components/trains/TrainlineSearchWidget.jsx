import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Train, ExternalLink } from 'lucide-react';
import StationSelector from './StationSelector';

export default function TrainlineSearchWidget() {
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: ''
  });

  const handleSearch = () => {
    if (!filters.origin || !filters.destination) {
      alert('Please fill in origin and destination');
      return;
    }
    const datePart = filters.date ? `/${filters.date}` : '';
    const url = `https://www.thetrainline.com/trains/${encodeURIComponent(filters.origin)}/${encodeURIComponent(filters.destination)}${datePart}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Search on Trainline
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
          <span className="inline-block">📍</span> 45+ countries | 270+ carriers | Real-time availability
        </div>
      </CardContent>
    </Card>
  );
}
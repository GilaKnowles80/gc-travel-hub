import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink } from 'lucide-react';

const AFFILIATE_ID = '15166459';

export default function TwelveGoFormWidget() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    if (!from || !to) {
      alert('Please fill in origin and destination');
      return;
    }
    const datePart = date ? `/${date}` : '';
    const url = `https://12go.asia/en/search/${encodeURIComponent(from)}/${encodeURIComponent(to)}${datePart}?z=${AFFILIATE_ID}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-50">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-lg text-emerald-900">Search via 12Go Asia</h3>
            <Badge className="bg-emerald-600 text-white">Official Partner</Badge>
          </div>
          <p className="text-sm text-slate-600">Trains, buses, ferries & transfers across Asia and beyond</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From (e.g. Manila)"
          />
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To (e.g. Cebu)"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="md:col-span-1"
          />
          <Button
            className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSearch}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Search on 12Go
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          <span className="inline-block">🚌</span> Trains | Buses | Ferries | Transfers | 20,000+ routes across Asia
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ship, Clock, MapPin, Search, Zap } from 'lucide-react';
import FerryBookingDialog from '@/components/ferries/FerryBookingDialog';
import PriceDisplay from '@/components/currency/PriceDisplay';
import { useMarkup } from '@/components/markup/useMarkup';

export default function FerrySearch() {
  const [filters, setFilters] = useState({ operator: 'all', origin: '', destination: '', date: '' });
  const { applyMarkup, markupPct } = useMarkup();
  const [selectedFerry, setSelectedFerry] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { data: dbFerries = [] } = useQuery({
    queryKey: ['ferries', filters.operator],
    queryFn: async () => {
      let query = {};
      if (filters.operator !== 'all') query.operator = filters.operator;
      return base44.entities.Ferry.filter(query);
    }
  });

  const handleSearch = async () => {
    setSearched(true);
    if (!filters.origin && !filters.destination) return;
    setAiLoading(true);
    setAiResults([]);
    const { data } = await base44.functions.invoke('getAISchedules', {
      service_type: 'ferry',
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date
    });
    const mapped = (data?.results || []).map((r, i) => ({
      id: `ai-${i}`,
      operator: r.operator || r.operator_name || 'Unknown',
      vessel_name: r.vessel_name || r.vessel || `Ferry ${i + 1}`,
      origin_port: r.origin_port || r.origin || filters.origin,
      destination_port: r.destination_port || r.destination || filters.destination,
      departure_time: r.departure_time || new Date().toISOString(),
      arrival_time: r.arrival_time,
      duration_hours: r.duration_hours || r.duration,
      cabin_types: r.cabin_types || [{ type: 'economy', price: parseFloat(r.price) || 0 }],
      _ai: true
    }));
    setAiResults(mapped);
    setAiLoading(false);
  };

  const filteredFerries = (searched && (filters.origin || filters.destination))
    ? aiResults
    : dbFerries.filter(ferry => {
        const originMatch = !filters.origin || ferry.origin_port?.toLowerCase().includes(filters.origin.toLowerCase());
        const destMatch = !filters.destination || ferry.destination_port?.toLowerCase().includes(filters.destination.toLowerCase());
        return originMatch && destMatch;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Ferry Tickets</h1>
          <p className="text-slate-600">Philippine Inter-Island Travel</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input placeholder="From port (e.g. Batangas, Piraeus)" value={filters.origin} onChange={(e) => setFilters({...filters, origin: e.target.value})} />
              <Input placeholder="To port (e.g. Coron, Santorini)" value={filters.destination} onChange={(e) => setFilters({...filters, destination: e.target.value})} />
              <Input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
              <Select value={filters.operator} onValueChange={(v) => setFilters({...filters, operator: v})}>
                <SelectTrigger><SelectValue placeholder="All Operators" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="2Go">2Go Travel</SelectItem>
                  <SelectItem value="Starlite Ferries">Starlite Ferries</SelectItem>
                  <SelectItem value="Cokaliong">Cokaliong Shipping</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleSearch} disabled={aiLoading}>
                {aiLoading ? <span className="animate-spin mr-2">⏳</span> : <Search className="w-4 h-4 mr-2" />}
                {aiLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searched && aiResults.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                <Zap className="w-3 h-3" /> Live results powered by AI — schedules and prices are real-time estimates.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ferry Results */}
        <div className="grid grid-cols-1 gap-4">
          {filteredFerries.map(ferry => (
            <Card key={ferry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Ship className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg">{ferry.vessel_name}</h3>
                        <Badge className="mt-1">{ferry.operator}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{ferry.origin_port} → {ferry.destination_port}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{ferry.duration_hours}h journey</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Departure: </span>
                        <span className="font-medium">{new Date(ferry.departure_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">From</p>
                    <div className="text-2xl font-bold text-blue-600"><PriceDisplay amount={ferry.cabin_types?.[0]?.price} fromCurrency="PHP" /></div>
                    <Button 
                      className="mt-2"
                      onClick={() => {
                        setSelectedFerry(ferry);
                        setShowBookingDialog(true);
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFerries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Ship className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No ferries found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {selectedFerry && (
          <FerryBookingDialog
            ferry={selectedFerry}
            open={showBookingDialog}
            onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setSelectedFerry(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
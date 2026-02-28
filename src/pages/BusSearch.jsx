import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, MapPin, Search, Zap } from 'lucide-react';
import BusBookingDialog from '@/components/buses/BusBookingDialog';
import PriceDisplay from '@/components/currency/PriceDisplay';
import { useMarkup } from '@/components/markup/useMarkup';

export default function BusSearch() {
  const [filters, setFilters] = useState({
    operator: 'all',
    origin: '',
    destination: '',
    date: ''
  });
  const { applyMarkup, markupPct } = useMarkup();
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { data: dbBuses = [] } = useQuery({
    queryKey: ['buses', filters.operator],
    queryFn: async () => {
      let query = { status: 'active' };
      if (filters.operator !== 'all') query.operator = filters.operator;
      return base44.entities.Bus.filter(query);
    }
  });

  const handleSearch = async () => {
    setSearched(true);
    if (!filters.origin && !filters.destination) return;
    setAiLoading(true);
    setAiResults([]);
    const { data } = await base44.functions.invoke('getAISchedules', {
      service_type: 'bus',
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date
    });
    const mapped = (data?.results || []).map((r, i) => ({
      id: `ai-${i}`,
      operator: r.operator || r.operator_name || 'Unknown',
      bus_type: r.bus_type || 'standard',
      origin_terminal: r.origin || r.origin_terminal || filters.origin,
      destination_terminal: r.destination || r.destination_terminal || filters.destination,
      departure_time: r.departure_time || new Date().toISOString(),
      arrival_time: r.arrival_time,
      duration_hours: r.duration_hours || r.duration,
      price: parseFloat(r.price) || 0,
      seats_available: r.seats_available || r.available_seats || 20,
      amenities: r.amenities || [],
      status: 'active',
      _ai: true
    }));
    setAiResults(mapped);
    setAiLoading(false);
  };

  const filteredBuses = (searched && (filters.origin || filters.destination))
    ? aiResults
    : dbBuses.filter(bus => {
        const originMatch = !filters.origin || bus.origin_terminal?.toLowerCase().includes(filters.origin.toLowerCase());
        const destMatch = !filters.destination || bus.destination_terminal?.toLowerCase().includes(filters.destination.toLowerCase());
        return originMatch && destMatch;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Bus Tickets</h1>
          <p className="text-slate-600">Affordable Inter-City Travel</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="From (e.g. Manila, New York)"
                value={filters.origin}
                onChange={(e) => setFilters({...filters, origin: e.target.value})}
              />
              <Input
                placeholder="To (e.g. Baguio, Boston)"
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
              />
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
              <Select value={filters.operator} onValueChange={(v) => setFilters({...filters, operator: v})}>
                <SelectTrigger><SelectValue placeholder="All Operators" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="Victory Liner">Victory Liner</SelectItem>
                  <SelectItem value="Genesis">Genesis</SelectItem>
                  <SelectItem value="Five Star">Five Star</SelectItem>
                  <SelectItem value="FlixBus">FlixBus</SelectItem>
                  <SelectItem value="Greyhound">Greyhound</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleSearch} disabled={aiLoading}>
                {aiLoading ? <span className="animate-spin mr-2">⏳</span> : <Search className="w-4 h-4 mr-2" />}
                {aiLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searched && aiResults.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                <Zap className="w-3 h-3" /> Live results powered by AI — schedules and prices are real-time estimates. Booking is confirmed with the operator.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bus Results */}
        <div className="grid grid-cols-1 gap-4">
          {filteredBuses.map(bus => (
            <Card key={bus.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Bus className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-bold text-lg">{bus.operator}</h3>
                        <Badge className="mt-1 capitalize">{bus.bus_type}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{bus.origin_terminal} → {bus.destination_terminal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{bus.duration_hours}h journey</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Departure: </span>
                        <span className="font-medium">{new Date(bus.departure_time).toLocaleString()}</span>
                      </div>
                    </div>
                    {bus.amenities && bus.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bus.amenities.slice(0, 4).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">From</p>
                    <div className="text-2xl font-bold text-green-600"><PriceDisplay amount={bus.price} fromCurrency="PHP" /></div>
                    <p className="text-xs text-slate-500 mb-2">{bus.seats_available} seats left</p>
                    <Button
                      onClick={() => {
                        setSelectedBus(bus);
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

        {filteredBuses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No buses found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {selectedBus && (
          <BusBookingDialog
            bus={selectedBus}
            open={showBookingDialog}
            onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setSelectedBus(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
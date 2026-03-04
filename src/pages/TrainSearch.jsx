import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Train as TrainIcon, Clock, MapPin, Search } from 'lucide-react';
import TrainBookingDialog from '@/components/trains/TrainBookingDialog';
import StationSelector from '@/components/trains/StationSelector';
import PriceDisplay from '@/components/currency/PriceDisplay';
import { useMarkup } from '@/components/markup/useMarkup';
import TwelveGoCountryWidget from '@/components/twelvego/TwelveGoCountryWidget';
import TwelveGoFormWidget from '@/components/twelvego/TwelveGoFormWidget';
import TwelveGoTimetable from '@/components/twelvego/TwelveGoTimetable';

export default function TrainSearch() {
  const [filters, setFilters] = useState({
    operator: 'all',
    country: 'all',
    origin: '',
    destination: '',
    date: ''
  });
  const { applyMarkup, markupPct } = useMarkup();
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { data: dbTrains = [] } = useQuery({
    queryKey: ['trains', filters.operator, filters.country],
    queryFn: async () => {
      let query = {};
      if (filters.operator !== 'all') query.operator = filters.operator;
      if (filters.country !== 'all') query.country = filters.country;
      return base44.entities.Train.filter(query);
    }
  });

  const handleSearch = async () => {
    setSearched(true);
    if (!filters.origin && !filters.destination) return;
    setAiLoading(true);
    setAiResults([]);
    const { data } = await base44.functions.invoke('getAISchedules', {
      service_type: 'train',
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date
    });
    const mapped = (data?.results || []).map((r, i) => ({
      id: `ai-${i}`,
      operator: r.operator || 'Unknown',
      train_number: r.train_number || `TRN-${i + 1}`,
      train_type: r.train_type || 'intercity',
      origin_station: r.origin_station || r.origin || filters.origin,
      destination_station: r.destination_station || r.destination || filters.destination,
      departure_time: r.departure_time || new Date().toISOString(),
      arrival_time: r.arrival_time,
      duration_hours: r.duration_hours || r.duration,
      class_types: r.class_types || [{ class: 'economy', price: parseFloat(r.price) || 0, seats_available: 50 }],
      amenities: r.amenities || [],
      _ai: true
    }));
    setAiResults(mapped);
    setAiLoading(false);
  };

  const filteredTrains = (searched && (filters.origin || filters.destination))
    ? aiResults
    : dbTrains.filter(train => {
        const originMatch = !filters.origin || train.origin_station?.toLowerCase().includes(filters.origin.toLowerCase());
        const destMatch = !filters.destination || train.destination_station?.toLowerCase().includes(filters.destination.toLowerCase());
        return originMatch && destMatch;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Train Tickets</h1>
          <p className="text-slate-600">Europe, USA & Global Rail Travel</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <StationSelector value={filters.origin} onChange={(v) => setFilters({...filters, origin: v})} placeholder="From station..." />
              <StationSelector value={filters.destination} onChange={(v) => setFilters({...filters, destination: v})} placeholder="To station..." />
              <Input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
              <Select value={filters.operator} onValueChange={(v) => setFilters({...filters, operator: v})}>
                <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="Eurail">Eurail</SelectItem>
                  <SelectItem value="Amtrak">Amtrak (USA)</SelectItem>
                  <SelectItem value="JR Pass">JR Pass (Japan)</SelectItem>
                  <SelectItem value="DB (Deutsche Bahn)">DB (Germany)</SelectItem>
                  <SelectItem value="SNCF">SNCF (France)</SelectItem>
                  <SelectItem value="Renfe">Renfe (Spain)</SelectItem>
                  <SelectItem value="Trenitalia">Trenitalia (Italy)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
                <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleSearch} disabled={aiLoading}>
                {aiLoading ? <span className="animate-spin mr-2">⏳</span> : <Search className="w-4 h-4 mr-2" />}
                {aiLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searched && aiResults.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <Search className="w-3 h-3" /> Live results powered by AI — real schedules for your route.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 12Go Asia Country Widget */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-slate-600">Also search via</span>
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">12Go Asia</span>
          </div>
          <TwelveGoFormWidget />
          <TwelveGoTimetable
            country="PH"
            from={filters.origin || "Manila"}
            to={filters.destination || ""}
            transportClass="train"
            lang="en"
            curr="PHP"
          />
          <TwelveGoCountryWidget country="PH" lang="en" fxcode="USD" />
        </div>

        {/* Train Results */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTrains.map(train => (
            <Card key={train.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <TrainIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-bold text-lg">{train.train_number}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge>{train.operator}</Badge>
                          <Badge variant="outline" className="capitalize">{train.train_type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{train.origin_station} → {train.destination_station}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{train.duration_hours}h journey</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Departure: </span>
                        <span className="font-medium">{new Date(train.departure_time).toLocaleString()}</span>
                      </div>
                    </div>
                    {train.amenities && train.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {train.amenities.slice(0, 4).map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">From</p>
                    <div className="text-2xl font-bold text-green-600"><PriceDisplay amount={applyMarkup(train.class_types?.[0]?.price, 'train')} fromCurrency="USD" /></div>
                    {markupPct > 0 && <p className="text-xs text-slate-400 line-through"><PriceDisplay amount={train.class_types?.[0]?.price} fromCurrency="USD" /></p>}
                    <Button 
                      className="mt-2"
                      onClick={() => {
                        setSelectedTrain(train);
                        setShowBooking(true);
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

        {filteredTrains.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <TrainIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No trains found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        <TrainBookingDialog 
          train={selectedTrain}
          open={showBooking}
          onClose={() => {
            setShowBooking(false);
            setSelectedTrain(null);
          }}
        />
      </div>
    </div>
  );
}
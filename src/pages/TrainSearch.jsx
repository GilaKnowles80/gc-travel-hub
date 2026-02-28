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

export default function TrainSearch() {
  const [filters, setFilters] = useState({
    operator: 'all',
    country: 'all',
    origin: '',
    destination: ''
  });
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const { data: trains = [] } = useQuery({
    queryKey: ['trains', filters],
    queryFn: async () => {
      let query = {};
      if (filters.operator !== 'all') query.operator = filters.operator;
      if (filters.country !== 'all') query.country = filters.country;
      return base44.entities.Train.filter(query);
    }
  });

  const filteredTrains = trains.filter(train => {
    const originMatch = !filters.origin || train.origin_station.toLowerCase().includes(filters.origin.toLowerCase());
    const destMatch = !filters.destination || train.destination_station.toLowerCase().includes(filters.destination.toLowerCase());
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={filters.operator} onValueChange={(v) => setFilters({...filters, operator: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="Eurail">Eurail (Europe)</SelectItem>
                  <SelectItem value="Amtrak">Amtrak (USA)</SelectItem>
                  <SelectItem value="JR Pass">JR Pass (Japan)</SelectItem>
                  <SelectItem value="DB (Deutsche Bahn)">DB (Germany)</SelectItem>
                  <SelectItem value="SNCF">SNCF (France)</SelectItem>
                  <SelectItem value="Renfe">Renfe (Spain)</SelectItem>
                  <SelectItem value="Trenitalia">Trenitalia (Italy)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Origin station..."
                value={filters.origin}
                onChange={(e) => setFilters({...filters, origin: e.target.value})}
              />
              <Input
                placeholder="Destination..."
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
              />
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

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
                    <p className="text-2xl font-bold text-green-600">${train.class_types?.[0]?.price || 'N/A'}</p>
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
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, MapPin, Search } from 'lucide-react';
import BusBookingDialog from '@/components/buses/BusBookingDialog';

export default function BusSearch() {
  const [filters, setFilters] = useState({
    operator: 'all',
    origin: '',
    destination: ''
  });
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { data: buses = [] } = useQuery({
    queryKey: ['buses', filters],
    queryFn: async () => {
      let query = { status: 'active' };
      if (filters.operator !== 'all') query.operator = filters.operator;
      return base44.entities.Bus.filter(query);
    }
  });

  const filteredBuses = buses.filter(bus => {
    const originMatch = !filters.origin || bus.origin_terminal.toLowerCase().includes(filters.origin.toLowerCase());
    const destMatch = !filters.destination || bus.destination_terminal.toLowerCase().includes(filters.destination.toLowerCase());
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.operator} onValueChange={(v) => setFilters({...filters, operator: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="Victory Liner">Victory Liner</SelectItem>
                  <SelectItem value="Genesis">Genesis</SelectItem>
                  <SelectItem value="Five Star">Five Star</SelectItem>
                  <SelectItem value="FlixBus">FlixBus</SelectItem>
                  <SelectItem value="Greyhound">Greyhound</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Origin..."
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
                    <p className="text-2xl font-bold text-green-600">₱{bus.price}</p>
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
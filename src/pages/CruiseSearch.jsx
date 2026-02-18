import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ship, Calendar, MapPin, Search } from 'lucide-react';
import CruiseBookingDialog from '@/components/cruises/CruiseBookingDialog';

export default function CruiseSearch() {
  const [filters, setFilters] = useState({
    cruise_line: 'all',
    departure_port: ''
  });
  const [selectedCruise, setSelectedCruise] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { data: cruises = [] } = useQuery({
    queryKey: ['cruises', filters],
    queryFn: async () => {
      let query = {};
      if (filters.cruise_line !== 'all') query.cruise_line = filters.cruise_line;
      return base44.entities.Cruise.filter(query);
    }
  });

  const filteredCruises = cruises.filter(cruise => {
    const portMatch = !filters.departure_port || cruise.departure_port.toLowerCase().includes(filters.departure_port.toLowerCase());
    return portMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">International Cruises</h1>
          <p className="text-slate-600">Luxury Cruise Vacations Worldwide</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.cruise_line} onValueChange={(v) => setFilters({...filters, cruise_line: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cruise Lines</SelectItem>
                  <SelectItem value="Royal Caribbean">Royal Caribbean</SelectItem>
                  <SelectItem value="Carnival">Carnival</SelectItem>
                  <SelectItem value="Norwegian">Norwegian</SelectItem>
                  <SelectItem value="Princess Cruises">Princess Cruises</SelectItem>
                  <SelectItem value="MSC Cruises">MSC Cruises</SelectItem>
                  <SelectItem value="Disney Cruise">Disney Cruise</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Departure port..."
                value={filters.departure_port}
                onChange={(e) => setFilters({...filters, departure_port: e.target.value})}
              />
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cruise Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCruises.map(cruise => (
            <Card key={cruise.id} className="hover:shadow-xl transition-shadow overflow-hidden">
              {cruise.image_url && (
                <img src={cruise.image_url} alt={cruise.ship_name} className="w-full h-48 object-cover" />
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{cruise.itinerary_name}</h3>
                    <p className="text-sm text-slate-600">{cruise.ship_name}</p>
                    <Badge className="mt-2">{cruise.cruise_line}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Departs from {cruise.departure_port}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{cruise.duration_nights} nights</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Ports: </span>
                    {cruise.ports_of_call?.slice(0, 3).join(', ')}
                    {cruise.ports_of_call?.length > 3 && '...'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-slate-600">From</p>
                    <p className="text-2xl font-bold text-cyan-600">${cruise.cabin_categories?.[0]?.price_per_person || 'N/A'}</p>
                    <p className="text-xs text-slate-500">per person</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedCruise(cruise);
                      setShowBookingDialog(true);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCruises.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Ship className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No cruises found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {selectedCruise && (
          <CruiseBookingDialog
            cruise={selectedCruise}
            open={showBookingDialog}
            onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setSelectedCruise(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileSelect } from '@/components/ui/mobile-select';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, Plus, Trash2 } from 'lucide-react';
import moment from 'moment';

export default function FlightSelector({ selectedFlights, onAdd, onRemove }) {
  const [passengers, setPassengers] = useState(1);
  const [selectedCabin, setSelectedCabin] = useState('economy');

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['flights-for-package'],
    queryFn: () => base44.entities.Flight.filter({ status: 'active' }, '-departure_time', 50)
  });

  const handleAddFlight = (flight, cabinClass) => {
    const price = cabinClass.price;
    onAdd({
      flight_id: flight.id,
      flight_number: flight.flight_number,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time,
      airline: flight.airline_name,
      cabin_class: cabinClass.class,
      price: price,
      passengers: passengers
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Flights */}
      {selectedFlights.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 mb-4">Selected Flights ({selectedFlights.length})</h3>
            <div className="space-y-3">
              {selectedFlights.map((flight, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{flight.airline}</Badge>
                      <Badge>{flight.cabin_class}</Badge>
                    </div>
                    <p className="font-semibold">{flight.origin} → {flight.destination}</p>
                    <p className="text-sm text-slate-600">
                      {moment(flight.departure_time).format('MMM DD, HH:mm')} • {flight.passengers} passenger(s)
                    </p>
                    <p className="text-sm font-bold text-amber-600">
                      ${(flight.price * flight.passengers).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passengers Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Passengers</label>
              <MobileSelect value={passengers.toString()} onValueChange={(v) => setPassengers(parseInt(v))} placeholder="Passengers">
                <Select value={passengers.toString()} onValueChange={(v) => setPassengers(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Passenger{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileSelect>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Cabin Class</label>
              <MobileSelect value={selectedCabin} onValueChange={setSelectedCabin} placeholder="Cabin Class">
                <Select value={selectedCabin} onValueChange={setSelectedCabin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first_class">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </MobileSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Flights */}
      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center">Loading flights...</CardContent></Card>
        ) : flights.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-600">No flights available</CardContent></Card>
        ) : (
          flights.map(flight => {
            const cabinClass = flight.cabin_classes?.find(c => c.class === selectedCabin);
            if (!cabinClass) return null;

            return (
              <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{flight.airline_name}</Badge>
                        <Badge className="text-xs">{flight.flight_number}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xl font-bold">{moment(flight.departure_time).format('HH:mm')}</p>
                          <p className="text-sm text-slate-600">{flight.origin}</p>
                        </div>
                        <div className="flex flex-col items-center px-4">
                          <Clock className="w-4 h-4 text-slate-400 mb-1" />
                          <p className="text-xs text-slate-500">{flight.duration_hours}h</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{moment(flight.arrival_time).format('HH:mm')}</p>
                          <p className="text-sm text-slate-600">{flight.destination}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {moment(flight.departure_time).format('MMM DD, YYYY')}
                      </p>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-slate-900">${cabinClass.price}</p>
                      <p className="text-xs text-slate-500 mb-3">per person</p>
                      <Button
                        size="sm"
                        onClick={() => handleAddFlight(flight, cabinClass)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
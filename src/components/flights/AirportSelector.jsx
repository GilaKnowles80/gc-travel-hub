import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { MapPin, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AirportSelector({ value, onChange, placeholder, userLocation }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: airports = [] } = useQuery({
    queryKey: ['airports', userLocation?.country_code],
    queryFn: async () => {
      const allAirports = await base44.entities.Airport.filter({ is_active: true });
      
      if (!userLocation?.country_code) return allAirports;

      // Prioritize airports in user's country
      const userCountryAirports = allAirports.filter(
        a => a.country_code === userLocation.country_code
      );
      const otherAirports = allAirports.filter(
        a => a.country_code !== userLocation.country_code
      );

      return [...userCountryAirports, ...otherAirports];
    }
  });

  const filteredAirports = airports.filter(airport => {
    const searchLower = search.toLowerCase();
    return (
      airport.iata_code?.toLowerCase().includes(searchLower) ||
      airport.airport_name?.toLowerCase().includes(searchLower) ||
      airport.city?.toLowerCase().includes(searchLower) ||
      airport.country?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 20);

  const selectedAirport = airports.find(a => a.iata_code === value);

  return (
    <div className="relative">
      <Input
        value={search || (selectedAirport ? `${selectedAirport.iata_code} - ${selectedAirport.airport_name}` : '')}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Plane className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

      {isOpen && search && filteredAirports.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {filteredAirports.map(airport => (
            <button
              key={airport.id}
              onClick={() => {
                onChange(airport.iata_code);
                setSearch('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-amber-600">{airport.iata_code}</span>
                    {airport.country_code === userLocation?.country_code && (
                      <Badge variant="outline" className="text-xs">Your Country</Badge>
                    )}
                    <Badge 
                      variant={airport.type === 'international' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {airport.type}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{airport.airport_name}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{airport.city}, {airport.country}</span>
                  </div>
                  {airport.terminals && airport.terminals.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      Terminals: {airport.terminals.map(t => t.terminal_name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && search && filteredAirports.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-sm text-slate-600">
          No airports found
        </div>
      )}
    </div>
  );
}
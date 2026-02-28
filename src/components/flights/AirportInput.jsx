import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const POPULAR_AIRPORTS = [
  // Philippines
  { code: 'MNL', city: 'Manila', country: 'Philippines' },
  { code: 'CEB', city: 'Cebu', country: 'Philippines' },
  { code: 'DVO', city: 'Davao', country: 'Philippines' },
  // Southeast Asia
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam' },
  { code: 'SGN', city: 'Ho Chi Minh', country: 'Vietnam' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia' },
  // East Asia
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'NRT', city: 'Tokyo (Narita)', country: 'Japan' },
  { code: 'HND', city: 'Tokyo (Haneda)', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea' },
  // Middle East
  { code: 'DXB', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'DOH', city: 'Doha', country: 'Qatar' },
  // Europe
  { code: 'LHR', city: 'London', country: 'UK' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
  // USA
  { code: 'LAX', city: 'Los Angeles', country: 'USA' },
  { code: 'SFO', city: 'San Francisco', country: 'USA' },
  { code: 'JFK', city: 'New York', country: 'USA' },
  // Australia
  { code: 'SYD', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia' },
];

export default function AirportInput({ value, onChange, placeholder = "e.g. MNL, SIN" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");

  const filtered = POPULAR_AIRPORTS.filter(airport =>
    airport.code.toLowerCase().includes(search.toLowerCase()) ||
    airport.city.toLowerCase().includes(search.toLowerCase()) ||
    airport.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code) => {
    onChange(code);
    setSearch(code);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value.toUpperCase());
          onChange(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        maxLength={3}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto border border-slate-200">
          <div className="space-y-1 p-2">
            {filtered.map(airport => (
              <button
                key={airport.code}
                onClick={() => handleSelect(airport.code)}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 transition-colors text-sm"
              >
                <span className="font-semibold text-slate-900">{airport.code}</span>
                <span className="text-slate-500 ml-2">{airport.city}, {airport.country}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      {open && filtered.length === 0 && search && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-3 text-center text-sm text-slate-500 border border-slate-200">
          No airports found
        </Card>
      )}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
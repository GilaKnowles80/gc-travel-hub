import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const POPULAR_AIRPORTS = [
  // Philippines — All Local Airports (with geo coordinates)
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino Intl', country: 'Philippines', lat: 14.5086, lng: 121.0197 },
  { code: 'CEB', city: 'Cebu', name: 'Mactan-Cebu Intl', country: 'Philippines', lat: 10.3075, lng: 123.9795 },
  { code: 'DVO', city: 'Davao', name: 'Francisco Bangoy Intl', country: 'Philippines', lat: 7.1255, lng: 125.6458 },
  { code: 'BXU', city: 'Butuan', name: 'Bancasi Airport', country: 'Philippines', lat: 8.9515, lng: 125.4788 },
  { code: 'CGY', city: 'Cagayan de Oro', name: 'Laguindingan Airport', country: 'Philippines', lat: 8.6122, lng: 124.4561 },
  { code: 'ILO', city: 'Iloilo', name: 'Iloilo Intl Airport', country: 'Philippines', lat: 10.8330, lng: 122.4936 },
  { code: 'BCD', city: 'Bacolod', name: 'Bacolod-Silay Airport', country: 'Philippines', lat: 10.7765, lng: 123.0149 },
  { code: 'DGT', city: 'Dumaguete', name: 'Sibulan Airport', country: 'Philippines', lat: 9.3337, lng: 123.3004 },
  { code: 'TAG', city: 'Tagbilaran / Bohol', name: 'Tagbilaran Airport', country: 'Philippines', lat: 9.6644, lng: 123.8528 },
  { code: 'PPS', city: 'Puerto Princesa / Palawan', name: 'Puerto Princesa Intl', country: 'Philippines', lat: 9.7421, lng: 118.7592 },
  { code: 'USU', city: 'Busuanga / Coron', name: 'Busuanga Airport', country: 'Philippines', lat: 12.1215, lng: 120.0996 },
  { code: 'ENI', city: 'El Nido', name: 'El Nido Airport', country: 'Philippines', lat: 11.2019, lng: 119.4163 },
  { code: 'KLO', city: 'Kalibo', name: 'Kalibo Intl Airport', country: 'Philippines', lat: 11.6795, lng: 122.3760 },
  { code: 'MPH', city: 'Caticlan / Boracay', name: 'Godofredo P. Ramos Airport', country: 'Philippines', lat: 11.9215, lng: 121.9540 },
  { code: 'ZAM', city: 'Zamboanga', name: 'Zamboanga Intl Airport', country: 'Philippines', lat: 6.9224, lng: 122.0598 },
  { code: 'GEN', city: 'General Santos', name: 'General Santos Intl', country: 'Philippines', lat: 6.1060, lng: 125.0953 },
  { code: 'CBO', city: 'Cotabato', name: 'Cotabato Airport', country: 'Philippines', lat: 7.1652, lng: 124.2096 },
  { code: 'PAG', city: 'Pagadian', name: 'Pagadian Airport', country: 'Philippines', lat: 7.8307, lng: 123.4607 },
  { code: 'DPL', city: 'Dipolog', name: 'Dipolog Airport', country: 'Philippines', lat: 8.6019, lng: 123.3419 },
  { code: 'OZC', city: 'Ozamiz', name: 'Labo Airport', country: 'Philippines', lat: 8.1785, lng: 123.8417 },
  { code: 'IAO', city: 'Siargao', name: 'Sayak Airport', country: 'Philippines', lat: 9.8591, lng: 126.0138 },
  { code: 'SUG', city: 'Surigao', name: 'Surigao Airport', country: 'Philippines', lat: 9.7558, lng: 125.4808 },
  { code: 'TAC', city: 'Tacloban', name: 'Daniel Z. Romualdez Airport', country: 'Philippines', lat: 11.2277, lng: 125.0278 },
  { code: 'LGP', city: 'Legazpi', name: 'Legazpi Airport', country: 'Philippines', lat: 13.1571, lng: 123.7347 },
  { code: 'WNP', city: 'Naga', name: 'Naga Airport', country: 'Philippines', lat: 13.5849, lng: 123.2700 },
  { code: 'VRC', city: 'Virac / Catanduanes', name: 'Virac Airport', country: 'Philippines', lat: 13.5764, lng: 124.2062 },
  { code: 'CRK', city: 'Clark / Angeles', name: 'Clark Intl Airport', country: 'Philippines', lat: 15.1860, lng: 120.5596 },
  { code: 'LAO', city: 'Laoag', name: 'Laoag Intl Airport', country: 'Philippines', lat: 18.1781, lng: 120.5317 },
  { code: 'RXS', city: 'Roxas', name: 'Roxas Airport', country: 'Philippines', lat: 11.5977, lng: 122.7516 },
  { code: 'SJI', city: 'San Jose / Mindoro', name: 'San Jose Airport', country: 'Philippines', lat: 12.3614, lng: 121.0468 },
  { code: 'TWT', city: 'Tawi-Tawi', name: 'Sanga-Sanga Airport', country: 'Philippines', lat: 5.0469, lng: 119.7426 },
  { code: 'JOL', city: 'Jolo / Sulu', name: 'Jolo Airport', country: 'Philippines', lat: 6.0537, lng: 121.0107 },
  { code: 'TBH', city: 'Tablas / Romblon', name: 'Tugdan Airport', country: 'Philippines', lat: 12.3120, lng: 122.0850 },
  { code: 'MXI', city: 'Mati / Davao Oriental', name: 'Francisco Dagohoy Airport', country: 'Philippines', lat: 6.9495, lng: 126.2733 },
  { code: 'CDY', city: 'Camiguin', name: 'Camiguin Airport', country: 'Philippines', lat: 9.2535, lng: 124.7071 },
  { code: 'CYP', city: 'Calbayog', name: 'Calbayog Airport', country: 'Philippines', lat: 12.0727, lng: 124.5446 },
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
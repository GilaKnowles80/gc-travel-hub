import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Local fallback list (Philippines + major hubs) — instant, no network
const LOCAL_FALLBACK = [
  { iata: 'MNL', icao: 'RPLL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', country_code: 'PH', lat: 14.5086, lng: 121.0197, type: 'international' },
  { iata: 'CEB', icao: 'RPVM', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines', country_code: 'PH', lat: 10.3075, lng: 123.9795, type: 'international' },
  { iata: 'DVO', icao: 'RPMD', name: 'Francisco Bangoy International Airport', city: 'Davao', country: 'Philippines', country_code: 'PH', lat: 7.1255, lng: 125.6458, type: 'international' },
  { iata: 'BXU', icao: 'RPME', name: 'Bancasi Airport', city: 'Butuan', country: 'Philippines', country_code: 'PH', lat: 8.9515, lng: 125.4788, type: 'domestic' },
  { iata: 'CGY', icao: 'RPMY', name: 'Laguindingan Airport', city: 'Cagayan de Oro', country: 'Philippines', country_code: 'PH', lat: 8.6122, lng: 124.4561, type: 'international' },
  { iata: 'ILO', icao: 'RPVI', name: 'Iloilo International Airport', city: 'Iloilo', country: 'Philippines', country_code: 'PH', lat: 10.833, lng: 122.4936, type: 'international' },
  { iata: 'BCD', icao: 'RPVB', name: 'Bacolod-Silay Airport', city: 'Bacolod', country: 'Philippines', country_code: 'PH', lat: 10.7765, lng: 123.0149, type: 'international' },
  { iata: 'TAG', icao: 'RPBT', name: 'Tagbilaran Airport (Bohol)', city: 'Tagbilaran', country: 'Philippines', country_code: 'PH', lat: 9.6644, lng: 123.8528, type: 'domestic' },
  { iata: 'IAO', icao: 'RPNS', name: 'Sayak Airport (Siargao)', city: 'Siargao', country: 'Philippines', country_code: 'PH', lat: 9.8591, lng: 126.0138, type: 'domestic' },
  { iata: 'TAC', icao: 'RPVA', name: 'Daniel Z. Romualdez Airport', city: 'Tacloban', country: 'Philippines', country_code: 'PH', lat: 11.2277, lng: 125.0278, type: 'domestic' },
  { iata: 'KLO', icao: 'RPVK', name: 'Kalibo International Airport', city: 'Kalibo / Boracay', country: 'Philippines', country_code: 'PH', lat: 11.6795, lng: 122.376, type: 'international' },
  { iata: 'MPH', icao: 'RPVE', name: 'Godofredo P. Ramos Airport (Caticlan)', city: 'Caticlan / Boracay', country: 'Philippines', country_code: 'PH', lat: 11.9215, lng: 121.954, type: 'domestic' },
  { iata: 'PPS', icao: 'RPVP', name: 'Puerto Princesa International Airport', city: 'Puerto Princesa', country: 'Philippines', country_code: 'PH', lat: 9.7421, lng: 118.7592, type: 'international' },
  { iata: 'ZAM', icao: 'RPMZ', name: 'Zamboanga International Airport', city: 'Zamboanga', country: 'Philippines', country_code: 'PH', lat: 6.9224, lng: 122.0598, type: 'international' },
  { iata: 'GEN', icao: 'RPMG', name: 'General Santos International Airport', city: 'General Santos', country: 'Philippines', country_code: 'PH', lat: 6.106, lng: 125.0953, type: 'international' },
  { iata: 'CRK', icao: 'RPLC', name: 'Clark International Airport', city: 'Clark / Angeles', country: 'Philippines', country_code: 'PH', lat: 15.186, lng: 120.5596, type: 'international' },
  { iata: 'SUG', icao: 'RPMS', name: 'Surigao Airport', city: 'Surigao', country: 'Philippines', country_code: 'PH', lat: 9.7558, lng: 125.4808, type: 'domestic' },
  { iata: 'DGT', icao: 'RPVD', name: 'Sibulan Airport (Dumaguete)', city: 'Dumaguete', country: 'Philippines', country_code: 'PH', lat: 9.3337, lng: 123.3004, type: 'domestic' },
  { iata: 'LGP', icao: 'RPLP', name: 'Legazpi Airport', city: 'Legazpi', country: 'Philippines', country_code: 'PH', lat: 13.1571, lng: 123.7347, type: 'domestic' },
  { iata: 'LAO', icao: 'RPLI', name: 'Laoag International Airport', city: 'Laoag', country: 'Philippines', country_code: 'PH', lat: 18.1781, lng: 120.5317, type: 'international' },
  { iata: 'USU', icao: 'RPVV', name: 'Busuanga Airport (Coron)', city: 'Busuanga', country: 'Philippines', country_code: 'PH', lat: 12.1215, lng: 120.0996, type: 'domestic' },
  // International hubs
  { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.3644, lng: 103.9915, type: 'international' },
  { iata: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', country_code: 'TH', lat: 13.6811, lng: 100.7471, type: 'international' },
  { iata: 'KUL', icao: 'WMKK', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', country_code: 'MY', lat: 2.7456, lng: 101.7099, type: 'international' },
  { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', country_code: 'HK', lat: 22.308, lng: 113.9185, type: 'international' },
  { iata: 'NRT', icao: 'RJAA', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.772, lng: 140.3929, type: 'international' },
  { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', country_code: 'JP', lat: 35.5494, lng: 139.7798, type: 'international' },
  { iata: 'ICN', icao: 'RKSI', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', country_code: 'KR', lat: 37.4602, lng: 126.4407, type: 'international' },
  { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', country_code: 'AE', lat: 25.2528, lng: 55.3644, type: 'international' },
  { iata: 'DOH', icao: 'OTBD', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', country_code: 'QA', lat: 25.2611, lng: 51.6138, type: 'international' },
  { iata: 'AUH', icao: 'OMAA', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', country_code: 'AE', lat: 24.433, lng: 54.6511, type: 'international' },
  { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', country_code: 'GB', lat: 51.4775, lng: -0.4614, type: 'international' },
  { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', country_code: 'FR', lat: 49.0097, lng: 2.5479, type: 'international' },
  { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', country_code: 'DE', lat: 50.0379, lng: 8.5622, type: 'international' },
  { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', country_code: 'NL', lat: 52.3086, lng: 4.7639, type: 'international' },
  { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', country_code: 'US', lat: 33.9425, lng: -118.408, type: 'international' },
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', country_code: 'US', lat: 40.6413, lng: -73.7781, type: 'international' },
  { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', country_code: 'US', lat: 37.6213, lng: -122.379, type: 'international' },
  { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', country_code: 'AU', lat: -33.9399, lng: 151.1753, type: 'international' },
  { iata: 'CGK', icao: 'WIII', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', country_code: 'ID', lat: -6.1256, lng: 106.6559, type: 'international' },
  { iata: 'DPS', icao: 'WADD', name: 'Ngurah Rai International Airport (Bali)', city: 'Bali', country: 'Indonesia', country_code: 'ID', lat: -8.7481, lng: 115.167, type: 'international' },
  { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', country_code: 'IN', lat: 28.5665, lng: 77.1031, type: 'international' },
  { iata: 'BOM', icao: 'VABB', name: 'Mumbai International Airport', city: 'Mumbai', country: 'India', country_code: 'IN', lat: 19.0896, lng: 72.8656, type: 'international' },
  { iata: 'RUH', icao: 'OERK', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', country_code: 'SA', lat: 24.9576, lng: 46.6988, type: 'international' },
  { iata: 'KWI', icao: 'OKBK', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', country_code: 'KW', lat: 29.2267, lng: 47.9689, type: 'international' },
  { iata: 'YVR', icao: 'CYVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', country_code: 'CA', lat: 49.1967, lng: -123.1815, type: 'international' },
  { iata: 'NBO', icao: 'HKJK', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', country_code: 'KE', lat: -1.3192, lng: 36.9275, type: 'international' },
];

const TYPE_COLORS = {
  international: 'bg-blue-100 text-blue-700',
  domestic: 'bg-green-100 text-green-700',
  both: 'bg-purple-100 text-purple-700',
};

export default function AirportInput({ value, onChange, placeholder = "Search airport, city or code..." }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Selected airport label
  const selectedLabel = (() => {
    if (!value) return '';
    const found = LOCAL_FALLBACK.find(a => a.iata === value);
    return found ? `${found.iata} – ${found.city}` : value;
  })();

  const doSearch = async (q) => {
    if (!q || q.length < 1) {
      // Show popular PH airports when empty
      setResults(LOCAL_FALLBACK.filter(a => a.country_code === 'PH').slice(0, 12));
      return;
    }

    // Instant local filter
    const local = LOCAL_FALLBACK.filter(a =>
      a.iata.toLowerCase().includes(q.toLowerCase()) ||
      a.icao.toLowerCase().includes(q.toLowerCase()) ||
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.city.toLowerCase().includes(q.toLowerCase()) ||
      a.country.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 15);
    setResults(local);

    // Backend global search (debounced)
    if (q.length >= 2) {
      setLoading(true);
      try {
        const res = await base44.functions.invoke('globalAirportSearch', { query: q, limit: 20 });
        const backendResults = res.data?.airports || [];
        // Merge: local first, then backend extras
        const localIatas = new Set(local.map(a => a.iata));
        const extras = backendResults.filter(a => !localIatas.has(a.iata)).map(a => ({
          iata: a.iata, icao: a.icao, name: a.name, city: a.city,
          country: a.country, country_code: a.country_code,
          lat: a.lat, lng: a.lng, type: a.type
        }));
        setResults([...local, ...extras].slice(0, 20));
      } catch {
        // Keep local results on error
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInput = (e) => {
    const q = e.target.value;
    setSearch(q);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 200);
  };

  const handleFocus = () => {
    setOpen(true);
    if (!search) doSearch('');
  };

  const handleSelect = (airport) => {
    onChange(airport.iata);
    setSearch('');
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayValue = open ? search : (value ? selectedLabel : search);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={displayValue}
          onChange={handleInput}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-9 pr-3"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-[100] max-h-72 overflow-y-auto shadow-xl border border-slate-200 rounded-xl">
          {!search && (
            <div className="px-3 py-1.5 text-xs text-slate-400 font-medium border-b bg-slate-50">
              🇵🇭 Popular Philippine Airports
            </div>
          )}
          <div className="divide-y divide-slate-50">
            {results.map((airport) => (
              <button
                key={airport.iata}
                onMouseDown={() => handleSelect(airport)}
                className="w-full text-left px-3 py-2.5 hover:bg-amber-50 transition-colors flex items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amber-700 text-sm">{airport.iata}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{airport.icao}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[airport.type] || 'bg-slate-100 text-slate-600'}`}>
                      {airport.type}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-800 truncate mt-0.5">{airport.name}</p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{airport.city}, {airport.country}</span>
                    {airport.lat && (
                      <span className="text-slate-300 ml-1">
                        ({airport.lat.toFixed(2)}°, {airport.lng.toFixed(2)}°)
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {loading && (
            <div className="px-3 py-2 text-xs text-slate-400 text-center border-t">
              Searching global database...
            </div>
          )}
        </Card>
      )}

      {open && results.length === 0 && search.length > 0 && !loading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-[100] p-4 text-center text-sm text-slate-500 shadow-xl border border-slate-200 rounded-xl">
          No airports found for "{search}"
        </Card>
      )}
    </div>
  );
}
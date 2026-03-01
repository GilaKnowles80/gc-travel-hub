import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import moment from "moment";
import AirportInput from "@/components/flights/AirportInput";
import { Input } from "@/components/ui/input";

const TIER_STYLES = {
  cheap: {
    badge: 'bg-green-100 text-green-700 border-green-300',
    row: 'border-l-4 border-l-green-400',
    price: 'text-green-700 font-bold',
    label: '🟢 Cheapest',
  },
  regular: {
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    row: 'border-l-4 border-l-blue-400',
    price: 'text-blue-700 font-semibold',
    label: '🔵 Regular',
  },
  expensive: {
    badge: 'bg-red-100 text-red-700 border-red-300',
    row: 'border-l-4 border-l-red-400',
    price: 'text-red-600 font-bold',
    label: '🔴 Highest',
  },
};

export default function FlightScheduleBoard({ defaultOrigin = 'MNL', defaultDest = 'SIN' }) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDest);
  const [date, setDate] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
  const [search, setSearch] = useState({ origin: defaultOrigin, destination: defaultDest, date: moment().add(1, 'day').format('YYYY-MM-DD') });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['flight-schedules', search],
    queryFn: async () => {
      const res = await base44.functions.invoke('flightSchedules', search);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!(search.origin && search.destination),
  });

  const schedules = data?.schedules || [];

  const handleSearch = () => {
    setSearch({ origin, destination, date });
  };

  const formatDuration = (mins) => {
    if (!mins) return '--';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-lg">Real-Time Flight Schedule Board</CardTitle>
            <p className="text-slate-300 text-xs">Live fares via Duffel API · 300+ airlines</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-300 mb-1 block">From</label>
            <AirportInput value={origin} onChange={setOrigin} placeholder="Origin airport..." />
          </div>
          <div>
            <label className="text-xs text-slate-300 mb-1 block">To</label>
            <AirportInput value={destination} onChange={setDestination} placeholder="Destination..." />
          </div>
          <div>
            <label className="text-xs text-slate-300 mb-1 block">Date</label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={moment().format('YYYY-MM-DD')}
              className="bg-white"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Search Schedules
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Price Tier Legend */}
        <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 border-b text-xs text-slate-600">
          <span className="font-semibold">Fare Legend:</span>
          {Object.entries(TIER_STYLES).map(([k, s]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${s.badge}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-slate-500">Fetching live schedules...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">{error.message || 'Failed to load schedules'}</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-3">Retry</Button>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No flights found for this route and date.</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 text-xs text-slate-500 border-b">
              {schedules.length} flights found · {search.origin} <ArrowRight className="inline w-3 h-3" /> {search.destination} · {moment(search.date).format('DD MMM YYYY')}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-500 uppercase px-4 py-2 border-b bg-slate-50">
              <div className="col-span-2">Airline / Flight</div>
              <div>Departure</div>
              <div>Arrival</div>
              <div>Duration</div>
              <div>Stops</div>
              <div className="text-right">Price</div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {schedules.map((s, i) => {
                const tier = s.price_tier || 'regular';
                const style = TIER_STYLES[tier] || TIER_STYLES.regular;
                return (
                  <div key={i} className={`grid grid-cols-7 items-center px-4 py-3 hover:bg-slate-50 transition-colors ${style.row}`}>
                    <div className="col-span-2">
                      <p className="font-semibold text-sm text-slate-800">{s.airline}</p>
                      <p className="text-xs text-slate-500 font-mono">{s.flight_number || '—'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{moment(s.departure_at).format('HH:mm')}</p>
                      <p className="text-xs text-slate-500">{s.origin}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{moment(s.arrival_at).format('HH:mm')}</p>
                      <p className="text-xs text-slate-500">{s.destination}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3 h-3" />
                        {formatDuration(s.duration_minutes)}
                      </div>
                    </div>
                    <div>
                      <Badge className={s.is_direct ? 'bg-emerald-100 text-emerald-700 text-[10px]' : 'bg-orange-100 text-orange-700 text-[10px]'}>
                        {s.is_direct ? 'Direct' : `${s.stops} stop${s.stops > 1 ? 's' : ''}`}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${style.price}`}>${s.price?.toFixed(0)}</p>
                      <Badge className={`text-[9px] mt-0.5 px-1.5 ${style.badge}`}>{style.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
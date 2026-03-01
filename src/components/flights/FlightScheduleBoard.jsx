import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, RefreshCw, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import moment from "moment";

const TIER_STYLES = {
  cheap: {
    badge: 'bg-green-100 text-green-700 border border-green-300',
    row: 'border-l-4 border-l-green-400 hover:bg-green-50',
    price: 'text-green-700 font-bold',
    label: 'Cheapest',
    dot: 'bg-green-500',
  },
  regular: {
    badge: 'bg-blue-100 text-blue-700 border border-blue-300',
    row: 'border-l-4 border-l-blue-400 hover:bg-blue-50',
    price: 'text-blue-700 font-semibold',
    label: 'Regular',
    dot: 'bg-blue-500',
  },
  expensive: {
    badge: 'bg-red-100 text-red-700 border border-red-300',
    row: 'border-l-4 border-l-red-400 hover:bg-red-50',
    price: 'text-red-600 font-bold',
    label: 'Highest',
    dot: 'bg-red-500',
  },
};

const SOURCE_LABELS = {
  duffel: { label: 'Duffel', color: 'bg-purple-100 text-purple-700' },
  amadeus: { label: 'Amadeus', color: 'bg-blue-100 text-blue-700' },
  biyaheko: { label: 'Biyaheko', color: 'bg-amber-100 text-amber-700' },
  tripzynx: { label: 'Tripzynx', color: 'bg-teal-100 text-teal-700' },
  wanderlinx: { label: 'Wanderlinx', color: 'bg-green-100 text-green-700' },
};

export default function FlightScheduleBoard({ defaultOrigin = 'MNL', defaultDest = 'SIN', onSelectFlight }) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDest);
  const [date, setDate] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
  const [search, setSearch] = useState({ origin: defaultOrigin, destination: defaultDest, date: moment().add(1, 'day').format('YYYY-MM-DD') });
  const [dismissed, setDismissed] = useState(false);

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

  const handleSearch = () => setSearch({ origin, destination, date });

  const formatDuration = (mins) => {
    if (!mins) return '--';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-none">Real-Time Flight Schedule Board</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Live fares · Duffel API, Amadeus, Biyaheko, Tripzynx, Wanderlinx
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              title="Refresh schedules"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">From</label>
            <div className="relative">
              <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white text-sm text-slate-800 border-0 focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="e.g. MNL"
                value={origin}
                onChange={e => setOrigin(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">To</label>
            <div className="relative">
              <Plane className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90" />
              <input
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white text-sm text-slate-800 border-0 focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="e.g. BXU"
                value={destination}
                onChange={e => setDestination(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-white text-sm text-slate-800 border-0 focus:ring-2 focus:ring-amber-400 outline-none"
              value={date}
              min={moment().format('YYYY-MM-DD')}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md"
            >
              Search Schedules
            </Button>
          </div>
        </div>
      </div>

      {/* Fare Legend */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 bg-slate-50 border-b text-xs">
        <span className="font-semibold text-slate-600">Fare Legend:</span>
        {Object.entries(TIER_STYLES).map(([k, s]) => (
          <span key={k} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.badge}`}>
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-slate-400 flex items-center gap-1 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Duffel
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block ml-1" /> Amadeus
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1" /> Biyaheko
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block ml-1" /> Tripzynx
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block ml-1" /> Wanderlinx
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-14 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-slate-500 text-sm">Fetching live schedules from all suppliers...</span>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 text-sm">{error.message || 'Failed to load schedules'}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-3">Retry</Button>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Plane className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No flights found for this route and date.</p>
          <p className="text-xs mt-1 text-slate-300">Try different dates or routes.</p>
        </div>
      ) : (
        <>
          <div className="px-5 py-2 text-xs text-slate-500 border-b bg-white flex items-center gap-1">
            <span className="font-semibold text-slate-700">{schedules.length}</span> flights found ·
            <span className="font-mono font-semibold text-slate-700">{search.origin}</span>
            <ArrowRight className="w-3 h-3 inline" />
            <span className="font-mono font-semibold text-slate-700">{search.destination}</span> ·
            {moment(search.date).format('DD MMM YYYY')}
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-8 text-[11px] font-semibold text-slate-400 uppercase px-5 py-2 border-b bg-slate-50 tracking-wide">
            <div className="col-span-2">Airline / Flight</div>
            <div>Departure</div>
            <div>Arrival</div>
            <div>Duration</div>
            <div>Stops</div>
            <div>Source</div>
            <div className="text-right">Price</div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {schedules.map((s, i) => {
              const tier = s.price_tier || 'regular';
              const style = TIER_STYLES[tier] || TIER_STYLES.regular;
              const src = SOURCE_LABELS[s.source] || { label: s.source || 'Live', color: 'bg-slate-100 text-slate-600' };
              return (
                <div
                  key={i}
                  onClick={() => onSelectFlight && onSelectFlight(s)}
                  className={`grid grid-cols-8 items-center px-5 py-3 transition-colors cursor-pointer ${style.row}`}
                >
                  <div className="col-span-2">
                    <p className="font-semibold text-sm text-slate-800">{s.airline}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.flight_number || '—'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{moment(s.departure_at).format('HH:mm')}</p>
                    <p className="text-xs text-slate-400">{s.origin}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{moment(s.arrival_at).format('HH:mm')}</p>
                    <p className="text-xs text-slate-400">{s.destination}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    {formatDuration(s.duration_minutes)}
                  </div>
                  <div>
                    <Badge className={s.is_direct ? 'bg-emerald-100 text-emerald-700 text-[10px]' : 'bg-orange-100 text-orange-700 text-[10px]'}>
                      {s.is_direct ? 'Direct' : `${s.stops || 1} stop${s.stops > 1 ? 's' : ''}`}
                    </Badge>
                  </div>
                  <div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${style.price}`}>${s.price?.toFixed(0)}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${style.badge}`}>{style.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
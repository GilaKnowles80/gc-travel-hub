import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Plane, Clock } from 'lucide-react';

export default function FlightPathTimeline({ flightNumber, departureAirport, departureDate }) {
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('getFlightTrackingHistory', {
          flightNumber,
          departureAirport,
          departureDate
        });
        setFlightData(response.data.flight);
        setError(null);
      } catch (err) {
        console.error('Flight history error:', err);
        setError('Unable to fetch flight history');
      } finally {
        setLoading(false);
      }
    };

    if (flightNumber || departureDate) {
      fetchHistory();
    }
  }, [flightNumber, departureAirport, departureDate]);

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-700 font-medium">Loading flight history...</span>
        </div>
      </Card>
    );
  }

  if (error || !flightData) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3 text-amber-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error || 'No flight history available'}</span>
        </div>
      </Card>
    );
  }

  const firstPos = flightData.path[0];
  const lastPos = flightData.path[flightData.path.length - 1];
  const maxAltitude = Math.max(...flightData.path.map(p => p.altitude));

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Flight Path History</h3>
            <p className="text-xs text-slate-500">{flightData.totalPositions} position updates • {Math.round(flightData.duration)} minutes</p>
          </div>
          <Badge className="bg-green-100 text-green-800">{flightData.status.toUpperCase()}</Badge>
        </div>

        {/* Flight Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-500 mb-1">Departure</p>
            <p className="font-bold text-slate-900">{flightData.departure.airport}</p>
            <p className="text-xs text-slate-600">{new Date(flightData.departure.scheduled).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Arrival</p>
            <p className="font-bold text-slate-900">{flightData.arrival.airport}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Max Altitude</p>
            <p className="font-bold text-slate-900">{Math.round(maxAltitude).toLocaleString()} ft</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Aircraft</p>
            <p className="font-bold text-slate-900">{flightData.aircraft.registration}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {flightData.path.map((position, idx) => {
            const isGround = position.isGround;
            const phase = 
              idx === 0 ? 'Pushback' :
              idx < 5 ? 'Takeoff' :
              idx === flightData.path.length - 1 ? 'Landed' :
              !isGround ? 'Cruise' : 'Approach';

            const phaseColor = {
              'Pushback': 'bg-gray-100 text-gray-700',
              'Takeoff': 'bg-yellow-100 text-yellow-700',
              'Cruise': 'bg-blue-100 text-blue-700',
              'Approach': 'bg-orange-100 text-orange-700',
              'Landed': 'bg-green-100 text-green-700'
            }[phase] || '';

            return (
              <div
                key={idx}
                className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${isGround ? 'bg-slate-400' : 'bg-blue-500'}`} />
                  {idx < flightData.path.length - 1 && <div className="w-0.5 h-8 bg-slate-300" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={phaseColor} variant="outline">{phase}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(position.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {expandedIndex === idx && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500">Position:</span>
                        <p className="font-mono text-slate-700">{position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Altitude:</span>
                        <p className="font-bold text-slate-700">{Math.round(position.altitude).toLocaleString()} ft</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Speed:</span>
                        <p className="font-bold text-slate-700">{Math.round(position.speed)} km/h</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Direction:</span>
                        <p className="font-bold text-slate-700">{Math.round(position.direction)}°</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          From {new Date(firstPos.timestamp).toLocaleString()} to {new Date(lastPos.timestamp).toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
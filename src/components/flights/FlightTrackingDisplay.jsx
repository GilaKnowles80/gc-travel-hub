import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Gauge, Thermometer, Clock, AlertCircle } from 'lucide-react';

export default function FlightTrackingDisplay({ flightNumber, airline }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('trackFlightLive', {
          flightNumber,
          airline
        });
        setTracking(response.data.tracking);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Flight tracking error:', err);
        setError('Unable to fetch live flight tracking');
      } finally {
        setLoading(false);
      }
    };

    if (flightNumber) {
      fetchTracking();
      // Refresh every 30 seconds
      const interval = setInterval(fetchTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [flightNumber, airline]);

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-blue-700 font-medium">Loading live tracking...</span>
        </div>
      </Card>
    );
  }

  if (error || !tracking) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3 text-amber-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error || 'Flight tracking unavailable'}</span>
        </div>
      </Card>
    );
  }

  const statusColors = {
    'en-route': 'bg-blue-100 text-blue-800',
    'scheduled': 'bg-green-100 text-green-800',
    'landed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'delayed': 'bg-orange-100 text-orange-800'
  };

  const statusColor = statusColors[tracking.status] || 'bg-slate-100 text-slate-800';

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{tracking.flight.number}</p>
              <p className="text-xs text-slate-500">{tracking.aircraft.registration}</p>
            </div>
          </div>
          <Badge className={statusColor}>{tracking.status.toUpperCase()}</Badge>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-center flex-1">
            <p className="font-bold text-slate-900">{tracking.departure.airport}</p>
            <p className="text-xs text-slate-500">Departure</p>
          </div>
          <div className="flex-1 flex justify-center px-4">
            <Plane className="w-4 h-4 text-blue-500 rotate-90" />
          </div>
          <div className="text-center flex-1">
            <p className="font-bold text-slate-900">{tracking.arrival.airport}</p>
            <p className="text-xs text-slate-500">Arrival</p>
          </div>
        </div>

        <hr className="border-blue-200" />

        {/* Live Location Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Altitude */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Altitude</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {tracking.location.altitude ? `${Math.round(tracking.location.altitude).toLocaleString()} ft` : 'N/A'}
            </p>
          </div>

          {/* Speed */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Speed</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {tracking.speed.horizontal ? `${Math.round(tracking.speed.horizontal)} km/h` : 'N/A'}
            </p>
          </div>

          {/* Direction */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Direction</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {tracking.location.direction ? `${Math.round(tracking.location.direction)}°` : 'N/A'}
            </p>
          </div>

          {/* Position */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Position</span>
            </div>
            <p className="text-xs font-mono text-slate-700">
              {tracking.location.latitude?.toFixed(3)}, {tracking.location.longitude?.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdate && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-blue-200">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <span className="text-blue-600 font-medium">Live ●</span>
          </div>
        )}
      </div>
    </Card>
  );
}
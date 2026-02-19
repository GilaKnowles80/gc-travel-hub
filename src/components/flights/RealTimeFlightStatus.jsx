import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, MapPin, AlertCircle, CheckCircle, Radio, TrendingUp, Calendar } from 'lucide-react';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeFlightStatus({ flight, booking }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flightStatus, setFlightStatus] = useState('scheduled');
  const [liveUpdates, setLiveUpdates] = useState([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate flight status changes based on time
  useEffect(() => {
    const departureTime = new Date(flight.departure_time);
    const arrivalTime = new Date(flight.arrival_time);
    const now = new Date();

    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
    const hoursUntilArrival = (arrivalTime - now) / (1000 * 60 * 60);

    if (now >= arrivalTime) {
      setFlightStatus('arrived');
    } else if (now >= departureTime) {
      setFlightStatus('in-flight');
    } else if (hoursUntilDeparture <= 2) {
      setFlightStatus('boarding');
    } else if (hoursUntilDeparture <= 4) {
      setFlightStatus('check-in-open');
    } else {
      setFlightStatus('scheduled');
    }

    // Simulate live updates
    if (hoursUntilDeparture <= 4 && hoursUntilDeparture > 2) {
      setLiveUpdates([
        { time: moment().subtract(15, 'minutes'), message: 'Check-in counters now open' }
      ]);
    } else if (hoursUntilDeparture <= 2 && hoursUntilDeparture > 0) {
      setLiveUpdates([
        { time: moment().subtract(5, 'minutes'), message: 'Boarding will begin shortly' },
        { time: moment().subtract(15, 'minutes'), message: 'Gate information updated' }
      ]);
    } else if (now >= departureTime && now < arrivalTime) {
      setLiveUpdates([
        { time: moment().subtract(10, 'minutes'), message: 'Flight departed on time' },
        { time: moment().subtract(30, 'minutes'), message: 'Boarding completed' }
      ]);
    }
  }, [flight, currentTime]);

  const getStatusConfig = () => {
    switch (flightStatus) {
      case 'scheduled':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Calendar,
          label: 'Scheduled',
          description: 'Flight is on schedule'
        };
      case 'check-in-open':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          label: 'Check-in Open',
          description: 'Check-in counters are now open'
        };
      case 'boarding':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: AlertCircle,
          label: 'Boarding',
          description: 'Boarding in progress - please proceed to gate'
        };
      case 'in-flight':
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: Plane,
          label: 'In Flight',
          description: 'Flight is currently airborne'
        };
      case 'arrived':
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: CheckCircle,
          label: 'Arrived',
          description: 'Flight has arrived at destination'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Calendar,
          label: 'Scheduled',
          description: 'Flight is on schedule'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const departureTime = new Date(flight.departure_time);
  const arrivalTime = new Date(flight.arrival_time);
  const timeUntilDeparture = departureTime - currentTime;
  const timeUntilArrival = arrivalTime - currentTime;

  const formatCountdown = (ms) => {
    if (ms < 0) return 'Departed';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const calculateProgress = () => {
    const totalDuration = arrivalTime - departureTime;
    const elapsed = currentTime - departureTime;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const progress = flightStatus === 'in-flight' ? calculateProgress() : 0;

  return (
    <div className="space-y-4">
      {/* Live Status Header */}
      <Card className="overflow-hidden shadow-lg border-2">
        <div className={`${statusConfig.color} border-b-2 p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{statusConfig.label}</h3>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                </div>
                <p className="text-sm opacity-90">{statusConfig.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Flight Route */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              <div className="text-center flex-1">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p className="text-xs text-slate-500">DEPARTURE</p>
                <p className="text-2xl font-bold text-slate-900">{flight.origin}</p>
                <p className="text-sm text-slate-600">{moment(flight.departure_time).format('HH:mm')}</p>
              </div>

              <div className="flex-1 px-4">
                <div className="relative">
                  <div className="h-1 bg-slate-200 rounded-full">
                    {flightStatus === 'in-flight' && (
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="absolute -top-5 -right-6"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Plane className="w-8 h-8 text-blue-600 rotate-90" />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-xs text-slate-500">
                      {flight.duration} flight
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center flex-1">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p className="text-xs text-slate-500">ARRIVAL</p>
                <p className="text-2xl font-bold text-slate-900">{flight.destination}</p>
                <p className="text-sm text-slate-600">{moment(flight.arrival_time).format('HH:mm')}</p>
              </div>
            </div>
          </div>

          {/* Countdown Timers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-blue-900">Until Departure</p>
              </div>
              <p className="text-2xl font-bold text-blue-900 font-mono">
                {formatCountdown(timeUntilDeparture)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-medium text-purple-900">Until Arrival</p>
              </div>
              <p className="text-2xl font-bold text-purple-900 font-mono">
                {timeUntilArrival > 0 ? formatCountdown(timeUntilArrival) : 'Arrived'}
              </p>
            </div>
          </div>

          {/* Flight Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Flight Number</p>
              <p className="font-bold text-slate-900">{flight.flight_number}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Airline</p>
              <p className="font-bold text-slate-900">{flight.airline_name}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Gate</p>
              <p className="font-bold text-slate-900">
                {flightStatus === 'boarding' || flightStatus === 'check-in-open' ? 'A12' : 'TBA'}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Terminal</p>
              <p className="font-bold text-slate-900">T3</p>
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-amber-700 mb-1">Booking Reference</p>
                <p className="font-bold text-amber-900">{booking.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-700 mb-1">Cabin Class</p>
                <p className="font-bold text-amber-900 capitalize">{booking.cabin_class.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Updates Feed */}
      {liveUpdates.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <AnimatePresence>
                {liveUpdates.map((update, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{update.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {update.time.format('HH:mm')} • {update.time.fromNow()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Reminders based on status */}
      {flightStatus === 'check-in-open' && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-900 mb-1">Check-in Now Open!</p>
                <p className="text-sm text-green-700">
                  Please proceed to check-in counters with your valid ID and booking reference.
                  Check-in closes 45 minutes before departure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {flightStatus === 'boarding' && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">⚠️ Boarding Now!</p>
                <p className="text-sm text-amber-800">
                  Please proceed to Gate A12 immediately. Have your boarding pass and ID ready.
                  Boarding closes 15 minutes before departure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
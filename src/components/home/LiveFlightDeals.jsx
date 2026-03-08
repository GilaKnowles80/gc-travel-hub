import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, Zap, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/components/utils';
import moment from 'moment';
import PriceDisplay from '@/components/currency/PriceDisplay';
import { useCurrency } from '@/components/currency/CurrencyContext';
import { useMarkup } from '@/components/markup/useMarkup';

export default function LiveFlightDeals() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({});
  const { countryCode } = useCurrency();
  const { applyMarkup, markupPct } = useMarkup();

  // Map country codes to origin cities
  const originsByCountry = {
    'BE': 'BRU', 'NL': 'AMS', 'IT': 'FCO', 'SG': 'SIN', 'CN': 'PEK',
    'US': 'JFK', 'GB': 'LHR', 'FR': 'CDG', 'DE': 'FRA', 'ES': 'MAD',
    'AU': 'SYD', 'JP': 'NRT', 'KR': 'ICN', 'PH': 'MNL'
  };
  
  const userOrigin = originsByCountry[countryCode] || 'MNL';

  const { data: flights = [] } = useQuery({
    queryKey: ['featured-flights', userOrigin],
    queryFn: () => base44.entities.Flight.filter({ 
      status: 'active',
      origin: userOrigin 
    }, '-created_date', 6),
    refetchInterval: 60000
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const featuredDeals = flights.slice(0, 3).map((flight, idx) => {
    const cabinClass = flight.cabin_classes?.[0];
    const basePrice = cabinClass?.price || 0;
    const price = applyMarkup(basePrice, 'flight');
    return {
      ...flight,
      price: price,
      discount: [25, 30, 20][idx],
      originalPrice: price * (1 + [0.25, 0.30, 0.20][idx]),
      dealType: ['Flash Sale', 'Limited Offer', 'Hot Deal'][idx],
      available_seats: cabinClass?.seats_available || 0
    };
  });

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-8 h-8 text-amber-400 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Today's Flash Deals
            </h2>
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6">
            Limited time offers - Book now before they're gone!
          </p>

          {/* Countdown Timer */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
            <Clock className="w-6 h-6 text-amber-400" />
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">
                  {String(timeLeft.hours || 0).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400">Hours</div>
              </div>
              <span className="text-2xl text-white">:</span>
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">
                  {String(timeLeft.minutes || 0).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400">Minutes</div>
              </div>
              <span className="text-2xl text-white">:</span>
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">
                  {String(timeLeft.seconds || 0).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDeals.map((deal, idx) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <Card className="overflow-hidden bg-white border-0 hover:shadow-2xl transition-all duration-300 group">
                {/* Deal Badge */}
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white text-amber-700 font-bold">
                      {deal.dealType}
                    </Badge>
                    <div className="flex items-center gap-1 text-white">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-lg font-bold">{deal.discount}% OFF</span>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{deal.origin}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {moment(deal.departure_time).format('HH:mm')}
                      </div>
                    </div>
                    
                    <div className="flex-1 px-4">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <div className="h-px flex-1 bg-slate-200" />
                        <Plane className="w-5 h-5 rotate-90" />
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="text-center text-xs text-slate-500 mt-1">
                        {deal.duration}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{deal.destination}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {moment(deal.arrival_time).format('HH:mm')}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500">
                      {deal.airline_name} • {deal.flight_number}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {moment(deal.departure_time).format('MMM DD, YYYY')}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-xs text-slate-500 line-through">
                        <PriceDisplay amount={deal.originalPrice} />
                      </div>
                      <div className="text-3xl font-bold text-amber-600">
                        <PriceDisplay amount={deal.price} />
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Save <PriceDisplay amount={deal.originalPrice - deal.price} />
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {deal.available_seats} seats left
                      </Badge>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(createPageUrl('Flights'))}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Grab This Deal
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate(createPageUrl('Flights'))}
            className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-bold transition-colors inline-flex items-center gap-2"
          >
            View All Flight Deals
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
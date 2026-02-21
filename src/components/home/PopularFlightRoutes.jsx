import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Plane, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/pages/utils';
import PriceDisplay from '@/components/currency/PriceDisplay';
import { useCurrency } from '@/components/currency/CurrencyContext';

export default function PopularFlightRoutes() {
  const navigate = useNavigate();
  const { countryCode } = useCurrency();

  // Map countries to their origins and popular destinations
  const routesByCountry = {
    'BE': [
      { route: "Brussels → Manila", from: "BRU", to: "MNL", price: 45000, tag: "Most Popular" },
      { route: "Brussels → New York", from: "BRU", to: "JFK", price: 35000, tag: "Best Value" },
      { route: "Brussels → Singapore", from: "BRU", to: "SIN", price: 48000, tag: "Hot Deal" },
      { route: "Brussels → Tokyo", from: "BRU", to: "NRT", price: 52000, tag: "Top Rated" },
      { route: "Brussels → Dubai", from: "BRU", to: "DXB", price: 28000, tag: "Quick Connect" },
      { route: "Brussels → London", from: "BRU", to: "LHR", price: 8000, tag: "City Break" }
    ],
    'NL': [
      { route: "Amsterdam → Manila", from: "AMS", to: "MNL", price: 46000, tag: "Most Popular" },
      { route: "Amsterdam → Los Angeles", from: "AMS", to: "LAX", price: 54000, tag: "Best Value" },
      { route: "Amsterdam → Singapore", from: "AMS", to: "SIN", price: 47000, tag: "Hot Deal" },
      { route: "Amsterdam → Tokyo", from: "AMS", to: "NRT", price: 51000, tag: "Top Rated" },
      { route: "Amsterdam → Dubai", from: "AMS", to: "DXB", price: 29000, tag: "Quick Connect" },
      { route: "Amsterdam → Barcelona", from: "AMS", to: "BCN", price: 12000, tag: "City Break" }
    ],
    'IT': [
      { route: "Rome → Manila", from: "FCO", to: "MNL", price: 44000, tag: "Most Popular" },
      { route: "Rome → New York", from: "FCO", to: "JFK", price: 50000, tag: "Best Value" },
      { route: "Rome → Tokyo", from: "FCO", to: "NRT", price: 49000, tag: "Hot Deal" },
      { route: "Rome → Dubai", from: "FCO", to: "DXB", price: 27000, tag: "Top Rated" },
      { route: "Rome → Paris", from: "FCO", to: "CDG", price: 9000, tag: "Quick Connect" },
      { route: "Rome → London", from: "FCO", to: "LHR", price: 11000, tag: "City Break" }
    ],
    'SG': [
      { route: "Singapore → Manila", from: "SIN", to: "MNL", price: 8500, tag: "Most Popular" },
      { route: "Singapore → Bali", from: "SIN", to: "DPS", price: 12000, tag: "Beach Paradise" },
      { route: "Singapore → Tokyo", from: "SIN", to: "NRT", price: 25000, tag: "Best Value" },
      { route: "Singapore → Bangkok", from: "SIN", to: "BKK", price: 6500, tag: "Hot Deal" },
      { route: "Singapore → Sydney", from: "SIN", to: "SYD", price: 28000, tag: "Top Rated" },
      { route: "Singapore → Hong Kong", from: "SIN", to: "HKG", price: 15000, tag: "Quick Connect" }
    ],
    'CN': [
      { route: "Beijing → Manila", from: "PEK", to: "MNL", price: 18000, tag: "Most Popular" },
      { route: "Beijing → Singapore", from: "PEK", to: "SIN", price: 22000, tag: "Best Value" },
      { route: "Beijing → Tokyo", from: "PEK", to: "NRT", price: 15000, tag: "Hot Deal" },
      { route: "Beijing → Bangkok", from: "PEK", to: "BKK", price: 19000, tag: "Top Rated" },
      { route: "Beijing → Seoul", from: "PEK", to: "ICN", price: 12000, tag: "Quick Connect" },
      { route: "Beijing → Hong Kong", from: "PEK", to: "HKG", price: 9000, tag: "City Break" }
    ],
    'US': [
      { route: "New York → Manila", from: "JFK", to: "MNL", price: 65000, tag: "Most Popular" },
      { route: "New York → Paris", from: "JFK", to: "CDG", price: 45000, tag: "Best Value" },
      { route: "New York → Tokyo", from: "JFK", to: "NRT", price: 55000, tag: "Hot Deal" },
      { route: "New York → London", from: "JFK", to: "LHR", price: 42000, tag: "Top Rated" },
      { route: "New York → Dubai", from: "JFK", to: "DXB", price: 58000, tag: "Quick Connect" },
      { route: "New York → Los Angeles", from: "JFK", to: "LAX", price: 25000, tag: "City Break" }
    ],
    'PH': [
      { route: "Manila → Cebu", from: "MNL", to: "CEB", price: 2499, tag: "Most Popular" },
      { route: "Manila → Davao", from: "MNL", to: "DVO", price: 3299, tag: "Best Value" },
      { route: "Cebu → Manila", from: "CEB", to: "MNL", price: 2599, tag: "Hot Deal" },
      { route: "Manila → Boracay", from: "MNL", to: "MPH", price: 3999, tag: "Beach Paradise" },
      { route: "Manila → Palawan", from: "MNL", to: "PPS", price: 4299, tag: "Top Rated" },
      { route: "Cebu → Davao", from: "CEB", to: "DVO", price: 2899, tag: "Quick Connect" }
    ]
  };

  const popularRoutes = routesByCountry[countryCode] || routesByCountry['PH'];
  
  const routesWithImages = popularRoutes.map(route => ({
    ...route,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop"
  }));

  const handleRouteClick = (route) => {
    navigate(createPageUrl('Flights'));
  };

  return (
    <div className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Popular Flight Routes
            </h2>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Book the most traveled routes from your location at unbeatable prices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routesWithImages.map((route, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                onClick={() => handleRouteClick(route)}
                className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 group border-0"
              >
                <div className="relative h-48">
                  <img
                    src={route.image}
                    alt={route.route}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute top-4 right-4">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {route.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white mb-2">
                      <span className="text-2xl font-bold">{route.from}</span>
                      <Plane className="w-5 h-5 rotate-90" />
                      <span className="text-2xl font-bold">{route.to}</span>
                    </div>
                    <p className="text-white/90 text-sm font-medium">{route.route}</p>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Starting from</p>
                      <p className="text-2xl font-bold text-amber-600"><PriceDisplay amount={route.price} /></p>
                    </div>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 group-hover:gap-3">
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate(createPageUrl('Flights'))}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
          >
            View All Flight Routes
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
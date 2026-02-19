import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Plane, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/pages/utils';

const popularRoutes = [
  {
    route: "Manila → Cebu",
    from: "MNL",
    to: "CEB",
    price: "₱2,499",
    image: "https://images.unsplash.com/photo-1583470790878-4c88c92a6f18?w=800&auto=format&fit=crop",
    tag: "Most Popular"
  },
  {
    route: "Manila → Davao",
    from: "MNL",
    to: "DVO",
    price: "₱3,299",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
    tag: "Best Value"
  },
  {
    route: "Cebu → Manila",
    from: "CEB",
    to: "MNL",
    price: "₱2,599",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop",
    tag: "Hot Deal"
  },
  {
    route: "Manila → Boracay",
    from: "MNL",
    to: "MPH",
    price: "₱3,999",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
    tag: "Beach Paradise"
  },
  {
    route: "Manila → Palawan",
    from: "MNL",
    to: "PPS",
    price: "₱4,299",
    image: "https://images.unsplash.com/photo-1583440914964-68f9fa5c5f1e?w=800&auto=format&fit=crop",
    tag: "Top Rated"
  },
  {
    route: "Cebu → Davao",
    from: "CEB",
    to: "DVO",
    price: "₱2,899",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&auto=format&fit=crop",
    tag: "Quick Connect"
  }
];

export default function PopularFlightRoutes() {
  const navigate = useNavigate();

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
            Book the most traveled routes in the Philippines at unbeatable prices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((route, idx) => (
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
                      <p className="text-2xl font-bold text-amber-600">{route.price}</p>
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
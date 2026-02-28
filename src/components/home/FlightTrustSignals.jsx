import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, Clock, CheckCircle, Star, Headphones, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/pages/utils';

const trustSignals = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'SSL encrypted payments',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Award,
    title: 'IATA Certified',
    description: 'Licensed travel agency',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Users,
    title: '50,000+ Travelers',
    description: 'Trust us every year',
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    description: 'Get tickets immediately',
    color: 'from-amber-500 to-orange-600'
  }
];

const features = [
  {
    icon: CheckCircle,
    title: 'Best Price Guarantee',
    description: "Find it cheaper? We'll refund the difference"
  },
  {
    icon: Star,
    title: '4.8/5 Customer Rating',
    description: 'Based on 12,000+ verified reviews'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here whenever you need us'
  },
  {
    icon: Globe,
    title: 'All Major Airlines',
    description: 'Philippine Airlines, Cebu Pacific & more'
  }
];

export default function FlightTrustSignals() {
  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Trust Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {trustSignals.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${signal.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{signal.title}</h3>
                <p className="text-sm text-slate-600">{signal.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Why Book With Us */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Why Book Flights With Us?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who trust GC Travel & Tours for their flight bookings
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-lg transition-all"
              >
                <Icon className="w-10 h-10 text-amber-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="mt-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-amber-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-amber-100">Flights Booked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-amber-100">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-amber-100">Customer Support</div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-4">Secure Payment Methods</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">GCash</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">Maya</div>
          </div>
        </div>
      </div>
    </div>
  );
}
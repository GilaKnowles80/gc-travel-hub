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
             const isSupport = feature.title === '24/7 Support';
             const content = (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-lg transition-all ${isSupport ? 'cursor-pointer' : ''}`}
               >
                 <Icon className="w-10 h-10 text-amber-600 mb-4" />
                 <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                 <p className="text-sm text-slate-600">{feature.description}</p>
               </motion.div>
             );

             return isSupport ? (
               <Link key={idx} to={createPageUrl('Helpdesk')} className="no-underline">
                 {content}
               </Link>
             ) : (
               content
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 68" className="h-6 opacity-50 hover:opacity-100 transition-opacity" aria-label="Visa">
              <rect width="216" height="68" rx="6" fill="#1A1F71"/>
              <path d="M87.2 47.8L93.8 20.4h10.1l-6.6 27.4H87.2zm48.3-26.7c-2-.7-5.1-1.5-9-1.5-9.9 0-16.9 5-16.9 12.2-.1 5.3 5 8.3 8.8 10.1 3.9 1.8 5.2 3 5.2 4.6 0 2.5-3.1 3.6-6 3.6-4 0-6.1-.6-9.4-2l-1.3-.6-1.4 8.2c2.3 1 6.6 1.9 11.1 2 10.5 0 17.3-4.9 17.4-12.5.1-4.2-2.6-7.3-8.3-9.9-3.5-1.7-5.6-2.8-5.6-4.5 0-1.5 1.8-3.1 5.7-3.1 3.2-.1 5.6.7 7.4 1.4l.9.4 1.4-8zM161.9 20.4h-7.7c-2.4 0-4.2.7-5.2 3l-14.8 24.4h10.5s1.7-4.5 2.1-5.5h12.8c.3 1.3 1.2 5.5 1.2 5.5h9.3l-8.2-27.4zm-12.3 15.9c.8-2.1 4-10.3 4-10.3s.8-2.2 1.3-3.6l.7 3.2s1.9 8.7 2.3 10.7h-8.3zM80.2 20.4L70.4 38.9l-1-5.1c-1.8-5.8-7.3-12.1-13.5-15.2l9 29.2h10.6l15.8-27.4H80.2z" fill="white"/>
              <path d="M61.9 20.4H46.1l-.1.8c12.3 3 20.4 10.2 23.8 18.8l-3.4-16.4c-.6-2.3-2.3-3.1-4.5-3.2z" fill="#F9A533"/>
            </svg>
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">GCash</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">Maya</div>
          </div>
        </div>
      </div>
    </div>
  );
}
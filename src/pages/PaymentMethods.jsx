import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Building2, Shield, Check, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentMethods() {
  const paymentMethods = [
    {
      category: 'Credit & Debit Cards',
      icon: CreditCard,
      color: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      description: 'Secure card payments powered by Stripe',
      methods: [
        { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png' },
        { name: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
        { name: 'American Express', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg' },
        { name: 'Discover', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg' }
      ],
      features: [
        '3D Secure authentication',
        'Instant payment confirmation',
        'Worldwide acceptance',
        'Refund protection'
      ]
    },
    {
      category: 'E-Wallets (Philippines)',
      icon: Smartphone,
      color: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-800',
      description: 'Convenient digital wallet payments via PayMongo',
      methods: [
        { name: 'GCash', logo: 'https://logos-world.net/wp-content/uploads/2023/09/GCash-Logo.png' },
        { name: 'PayMaya', logo: 'https://logos-world.net/wp-content/uploads/2021/08/PayMaya-Logo.png' },
        { name: 'GrabPay', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Grab-Logo.png' }
      ],
      features: [
        'Instant payment',
        'No card required',
        'Mobile-first experience',
        'Popular in Philippines'
      ]
    },
    {
      category: 'PayPal',
      icon: Globe,
      color: 'bg-indigo-50 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800',
      description: 'Global payment platform with buyer protection',
      methods: [
        { name: 'PayPal', logo: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg' }
      ],
      features: [
        'Instant payment confirmation',
        'Buyer protection included',
        'Pay with balance, bank, or card',
        'International payments supported'
      ]
    },
    {
      category: 'Bank Transfer (Philippines)',
      icon: Building2,
      color: 'bg-purple-50 border-purple-200',
      badge: 'bg-purple-100 text-purple-800',
      description: 'Direct bank transfers to Philippine banks',
      methods: [
        { name: 'BPI', logo: 'https://logos-world.net/wp-content/uploads/2023/02/BPI-Logo.png' },
        { name: 'BDO', logo: 'https://logos-world.net/wp-content/uploads/2021/03/BDO-Unibank-Logo.png' },
        { name: 'Metrobank', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Metrobank-Logo.png' },
        { name: 'UnionBank', logo: 'https://logos-world.net/wp-content/uploads/2021/09/UnionBank-Logo.png' },
        { name: 'PNB', logo: 'https://logos-world.net/wp-content/uploads/2023/02/PNB-Logo.png' },
        { name: 'Security Bank', logo: 'https://logos-world.net/wp-content/uploads/2023/02/Security-Bank-Logo.png' }
      ],
      features: [
        'No transaction fees',
        'Ideal for large amounts',
        'Manual verification (1-2 business days)',
        'InstaPay & PESONet supported'
      ]
    }
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: 'PCI DSS Compliant',
      description: 'Industry-standard security protocols'
    },
    {
      icon: Globe,
      title: 'SSL Encryption',
      description: 'All transactions are encrypted'
    },
    {
      icon: Check,
      title: 'Fraud Protection',
      description: 'Advanced fraud detection systems'
    }
  ];

  const acceptedServices = [
    { name: 'Flights', available: true },
    { name: 'Hotels', available: true },
    { name: 'Tours', available: true },
    { name: 'Ferries', available: true },
    { name: 'Cruises', available: true },
    { name: 'Trains', available: true },
    { name: 'Car Rentals', available: true },
    { name: 'Bus Tickets', available: true },
    { name: 'Visa Applications', available: true },
    { name: 'Travel Insurance', available: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Payment Methods</h1>
          <p className="text-slate-600">Safe, secure, and convenient payment options for your travel bookings</p>
        </motion.div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {paymentMethods.map((method, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`h-full border-2 ${method.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <method.icon className="w-6 h-6" />
                    <CardTitle className="text-xl">{method.category}</CardTitle>
                  </div>
                  <Badge className={method.badge}>Available Now</Badge>
                  <p className="text-sm text-slate-600 mt-2">{method.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logos */}
                  <div className="grid grid-cols-2 gap-3">
                    {method.methods.map((m, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-center h-16">
                        {m.logo ? (
                          <img src={m.logo} alt={m.name} className="max-h-8 max-w-full object-contain" />
                        ) : (
                          <span className="font-semibold text-sm">{m.name}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {method.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Your Security is Our Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accepted Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Payment Accepted For All Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {acceptedServices.map((service, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 mt-8"
        >
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Are my payment details secure?</h3>
              <p className="text-sm text-slate-600">
                Yes. We use industry-leading payment processors (Stripe and PayMongo) with bank-level encryption. 
                We never store your full card details on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">When will my payment be processed?</h3>
              <p className="text-sm text-slate-600">
                Card and e-wallet payments are processed instantly. Bank transfers may take 1-2 business days for verification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-sm text-slate-600">
                Refund eligibility depends on the service provider's cancellation policy. Most bookings are refundable 
                if cancelled within the specified timeframe. See our Refund Policy for details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you accept international payments?</h3>
              <p className="text-sm text-slate-600">
                Yes. Credit/debit cards are accepted globally. E-wallets (GCash, PayMaya) are available for Philippine customers.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
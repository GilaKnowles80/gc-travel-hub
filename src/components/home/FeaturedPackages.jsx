import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plane, Hotel, MapPin, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import PriceDisplay from '@/components/currency/PriceDisplay';

export default function FeaturedPackages() {
  const { data: packages = [] } = useQuery({
    queryKey: ['featured-packages'],
    queryFn: async () => {
      const paid = await base44.entities.PackageBooking.filter({ status: 'paid' }, '-created_date', 3);
      return paid;
    }
  });

  if (packages.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-8 h-8 text-amber-600" />
            <h2 className="text-4xl font-bold text-slate-900">Popular Travel Packages</h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our most booked custom packages - save up to 15% when you bundle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all border-2 hover:border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{pkg.package_name}</h3>
                    {pkg.discount_percentage > 0 && (
                      <Badge className="bg-green-100 text-green-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {pkg.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.flights?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span>{pkg.flights.length} Flight{pkg.flights.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {pkg.hotels?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Hotel className="w-4 h-4 text-purple-600" />
                        <span>{pkg.hotels.length} Hotel{pkg.hotels.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {pkg.tours?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{pkg.tours.length} Tour{pkg.tours.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    {pkg.discount_percentage > 0 && (
                      <p className="text-sm text-slate-500 line-through mb-1">
                        ${pkg.total_price?.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Starting from</p>
                        <p className="text-3xl font-bold text-amber-600">
                          ${pkg.final_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link to={createPageUrl('PackageBuilder')}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                      Build Similar Package
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl('PackageBuilder')}>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              <Package className="w-5 h-5 mr-2" />
              Build Your Custom Package
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
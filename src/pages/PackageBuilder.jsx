import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel as HotelIcon, MapPin, Plus, Trash2, ShoppingCart, Sparkles, Tag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import FlightSelector from '../components/package/FlightSelector';
import HotelSelector from '../components/package/HotelSelector';
import TourSelector from '../components/package/TourSelector';
import PackageSummary from '../components/package/PackageSummary';
import toast from 'react-hot-toast';

export default function PackageBuilder() {
  const [packageName, setPackageName] = useState('My Custom Package');
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedTours, setSelectedTours] = useState([]);
  const [activeSection, setActiveSection] = useState('flights');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const calculateDiscount = useMemo(() => {
    const itemCount = selectedFlights.length + selectedHotels.length + selectedTours.length;
    if (itemCount >= 3) return 15;
    if (itemCount >= 2) return 10;
    return 0;
  }, [selectedFlights, selectedHotels, selectedTours]);

  const totalPrice = useMemo(() => {
    const flightTotal = selectedFlights.reduce((sum, f) => sum + (f.price * f.passengers), 0);
    const hotelTotal = selectedHotels.reduce((sum, h) => sum + (h.price * h.nights * h.rooms), 0);
    const tourTotal = selectedTours.reduce((sum, t) => sum + (t.price * t.participants), 0);
    return flightTotal + hotelTotal + tourTotal;
  }, [selectedFlights, selectedHotels, selectedTours]);

  const finalPrice = useMemo(() => {
    return totalPrice * (1 - calculateDiscount / 100);
  }, [totalPrice, calculateDiscount]);

  const handlePromoApplied = (code, discount) => {
    setAppliedPromo(code);
    setPromoDiscount(discount);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.PackageBooking.create(data),
    onSuccess: () => {
      toast.success('Package saved successfully!');
      queryClient.invalidateQueries(['package-bookings']);
    }
  });

  const handleSavePackage = async () => {
    if (!user) {
      toast.error('Please login to save your package');
      return;
    }

    if (selectedFlights.length === 0 && selectedHotels.length === 0 && selectedTours.length === 0) {
      toast.error('Please add at least one item to your package');
      return;
    }

    const finalPriceWithPromo = finalPrice - promoDiscount;

    await saveMutation.mutateAsync({
      user_email: user.email,
      package_name: packageName,
      flights: selectedFlights,
      hotels: selectedHotels,
      tours: selectedTours,
      total_price: totalPrice,
      discount_percentage: calculateDiscount,
      final_price: finalPriceWithPromo,
      status: 'draft',
      promo_code: appliedPromo?.code || null
    });

    // Update promo code usage
    if (appliedPromo) {
      await base44.entities.PackagePromoCode.update(appliedPromo.id, {
        usage_count: (appliedPromo.usage_count || 0) + 1
      });
    }

    // Navigate to My Packages
    setTimeout(() => {
      navigate(createPageUrl('MyPackages'));
    }, 1000);
  };

  const sections = [
    { id: 'flights', label: 'Flights', icon: Plane, count: selectedFlights.length },
    { id: 'hotels', label: 'Hotels', icon: HotelIcon, count: selectedHotels.length },
    { id: 'tours', label: 'Tours', icon: MapPin, count: selectedTours.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Build Your Own Package</h1>
          </div>
          <p className="text-amber-50 text-lg">
            Combine flights, hotels, and tours into your perfect travel package
          </p>
          {calculateDiscount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Tag className="w-5 h-5" />
              <span className="font-bold">Save {calculateDiscount}% on your package!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Package Name */}
            <Card>
              <CardContent className="pt-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Package Name</label>
                <Input
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., Summer Europe Trip"
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                      activeSection === section.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                    {section.count > 0 && (
                      <Badge className="ml-1 bg-white text-amber-600">
                        {section.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Section Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'flights' && (
                  <FlightSelector
                    selectedFlights={selectedFlights}
                    onAdd={(flight) => setSelectedFlights([...selectedFlights, flight])}
                    onRemove={(index) => setSelectedFlights(selectedFlights.filter((_, i) => i !== index))}
                  />
                )}
                {activeSection === 'hotels' && (
                  <HotelSelector
                    selectedHotels={selectedHotels}
                    onAdd={(hotel) => setSelectedHotels([...selectedHotels, hotel])}
                    onRemove={(index) => setSelectedHotels(selectedHotels.filter((_, i) => i !== index))}
                  />
                )}
                {activeSection === 'tours' && (
                  <TourSelector
                    selectedTours={selectedTours}
                    onAdd={(tour) => setSelectedTours([...selectedTours, tour])}
                    onRemove={(index) => setSelectedTours(selectedTours.filter((_, i) => i !== index))}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PackageSummary
                packageName={packageName}
                flights={selectedFlights}
                hotels={selectedHotels}
                tours={selectedTours}
                totalPrice={totalPrice}
                discount={calculateDiscount}
                finalPrice={finalPrice}
                onSave={handleSavePackage}
                isSaving={saveMutation.isPending}
                onPromoApplied={handlePromoApplied}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, MapPin, Trash2, CreditCard, Package, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import toast from 'react-hot-toast';

export default function MyPackages() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['my-packages', user?.email],
    queryFn: () => base44.entities.PackageBooking.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PackageBooking.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-packages']);
      toast.success('Package deleted');
    }
  });

  const handleCheckout = async (pkg) => {
    if (window.self !== window.top) {
      toast.error('Checkout works only from the published app, not from the editor');
      return;
    }

    setCheckingOut(pkg.id);
    try {
      const response = await base44.functions.invoke('createPackageCheckout', {
        package_id: pkg.id
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Checkout failed: ' + error.message);
      setCheckingOut(null);
    }
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setShowDetails(true);
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600">Please login to view your packages</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8" />
                <h1 className="text-4xl font-bold">My Travel Packages</h1>
              </div>
              <p className="text-amber-50">View and manage your custom travel packages</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('PackageBuilder'))}
              className="bg-white text-amber-600 hover:bg-amber-50"
            >
              Create New Package
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          </div>
        ) : packages.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No packages yet</h3>
              <p className="text-slate-500 mb-6">Create your first custom travel package</p>
              <Button
                onClick={() => navigate(createPageUrl('PackageBuilder'))}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Build Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">{pkg.package_name}</CardTitle>
                      <Badge className={statusColors[pkg.status]}>{pkg.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {pkg.flights?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Plane className="w-4 h-4 text-blue-600" />
                          <span>{pkg.flights.length} Flight{pkg.flights.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {pkg.hotels?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Hotel className="w-4 h-4 text-purple-600" />
                          <span>{pkg.hotels.length} Hotel{pkg.hotels.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {pkg.tours?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>{pkg.tours.length} Tour{pkg.tours.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t">
                      {pkg.discount_percentage > 0 && (
                        <div className="text-sm text-green-600 mb-1">
                          {pkg.discount_percentage}% package discount applied
                        </div>
                      )}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-2xl font-bold text-slate-900">
                            ${pkg.final_price?.toLocaleString() || pkg.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(pkg)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      {pkg.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckout(pkg)}
                          disabled={checkingOut === pkg.id}
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          {checkingOut === pkg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-1" />
                              Book
                            </>
                          )}
                        </Button>
                      )}
                      {(pkg.status === 'draft' || pkg.status === 'cancelled') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(pkg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPackage?.package_name}</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-6">
              {selectedPackage.flights?.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    Flights
                  </h3>
                  <div className="space-y-2">
                    {selectedPackage.flights.map((flight, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{flight.origin} → {flight.destination}</p>
                              <p className="text-sm text-slate-600">{flight.airline} {flight.flight_number}</p>
                              <p className="text-sm text-slate-600">{flight.cabin_class} • {flight.passengers} passenger(s)</p>
                            </div>
                            <p className="font-bold">${(flight.price * flight.passengers).toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackage.hotels?.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-purple-600" />
                    Hotels
                  </h3>
                  <div className="space-y-2">
                    {selectedPackage.hotels.map((hotel, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{hotel.hotel_name}</p>
                              <p className="text-sm text-slate-600">{hotel.location}</p>
                              <p className="text-sm text-slate-600">{hotel.nights} night(s) • {hotel.rooms} room(s)</p>
                            </div>
                            <p className="font-bold">${(hotel.price * hotel.nights * hotel.rooms).toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackage.tours?.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Tours
                  </h3>
                  <div className="space-y-2">
                    {selectedPackage.tours.map((tour, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{tour.tour_name}</p>
                              <p className="text-sm text-slate-600">{tour.destination}</p>
                              <p className="text-sm text-slate-600">{tour.duration} days • {tour.participants} participant(s)</p>
                            </div>
                            <p className="font-bold">${(tour.price * tour.participants).toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">${selectedPackage.total_price?.toLocaleString()}</span>
                </div>
                {selectedPackage.discount_percentage > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({selectedPackage.discount_percentage}%)</span>
                    <span className="font-bold">-${((selectedPackage.total_price * selectedPackage.discount_percentage) / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">${selectedPackage.final_price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Gauge, Fuel, Search, Loader2, MapPin } from 'lucide-react';
import CarRentalBookingDialog from '@/components/cars/CarRentalBookingDialog';
import PriceDisplay from '@/components/currency/PriceDisplay';
import SupplierPortalsPanel from '@/components/shared/SupplierPortalsPanel';
import moment from 'moment';

export default function CarRentalSearch() {
  const [filters, setFilters] = useState({ car_type: 'all', location: '', pickup_date: '', dropoff_date: '' });
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultsTab, setResultsTab] = useState('duffel');

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['cars-duffel', filters.location, filters.pickup_date, filters.dropoff_date],
    queryFn: async () => {
      const response = await base44.functions.invoke('searchCarRentalsDuffel', {
        location: filters.location,
        pickup_date: filters.pickup_date,
        dropoff_date: filters.dropoff_date
      });
      return response.data;
    },
    enabled: false
  });

  const duffelCars = searchResults?.cars || [];

  // Auto-show Supplier Portals when Duffel returns no products (or errors);
  // switch back to Duffel when results are present or a new search is loading.
  useEffect(() => {
    if (!searched) return;
    if (isLoading) { setResultsTab('duffel'); return; }
    if (error || duffelCars.length === 0) setResultsTab('suppliers');
    else setResultsTab('duffel');
  }, [searched, isLoading, error, duffelCars.length]);

  const handleSearch = () => {
    if (!filters.location || !filters.pickup_date || !filters.dropoff_date) {
      alert('Please fill in location, pick-up and drop-off dates');
      return;
    }
    setSearched(true);
    refetch();
  };

  const rentalDays = searchResults?.rental_days || 0;
  const visibleCars = duffelCars.filter(c => filters.car_type === 'all' || c.car_type === filters.car_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Car Rentals</h1>
          <p className="text-slate-600">Powered by Duffel — 40+ providers across 40,000+ locations worldwide</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Input placeholder="Pick-up location (e.g. Manila, London)" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} />
              <Input type="date" value={filters.pickup_date} min={moment().format('YYYY-MM-DD')} onChange={(e) => setFilters({...filters, pickup_date: e.target.value})} />
              <Input type="date" value={filters.dropoff_date} min={filters.pickup_date || moment().format('YYYY-MM-DD')} onChange={(e) => setFilters({...filters, dropoff_date: e.target.value})} />
              <Select value={filters.car_type} onValueChange={(v) => setFilters({...filters, car_type: v})}>
                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full lg:col-span-2" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Duffel / Supplier Portals tabs */}
        {searched && (
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
            <button onClick={() => setResultsTab('duffel')} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${resultsTab === 'duffel' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              Duffel Cars {duffelCars.length > 0 ? `(${duffelCars.length})` : ''}
            </button>
            <button onClick={() => setResultsTab('suppliers')} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${resultsTab === 'suppliers' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              Supplier Portals
            </button>
          </div>
        )}

        {resultsTab === 'suppliers' ? (
          <Card><CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Book via Supplier Portals</h3>
            <SupplierPortalsPanel />
          </CardContent></Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-lg">Searching cars via Duffel...</span>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50"><CardContent className="py-8 text-center">
            <p className="text-red-600 mb-3">Error: {error.message}</p>
            <Button onClick={() => setResultsTab('suppliers')} className="bg-slate-700 hover:bg-slate-800">Browse Supplier Portals</Button>
          </CardContent></Card>
        ) : visibleCars.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No cars found. Try adjusting your search.</p>
          </CardContent></Card>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{visibleCars.length} car{visibleCars.length !== 1 ? 's' : ''} found · {rentalDays} day{rentalDays !== 1 ? 's' : ''} rental</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCars.map(car => (
                <Card key={car.id} className="hover:shadow-xl transition-shadow overflow-hidden">
                  {car.image_url && <img src={car.image_url} alt={car.car_model} className="w-full h-48 object-cover" />}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl mb-1">{car.car_model}</h3>
                      <Badge className="mb-2">{car.rental_company}</Badge>
                      <p className="text-sm text-slate-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{car.pickup_location_name || car.pickup_address?.city_name || filters.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /><span>{car.seats || 5} seats</span></div>
                      <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-slate-500" /><span className="capitalize">{car.transmission || 'auto'}</span></div>
                      <div className="flex items-center gap-2"><Fuel className="w-4 h-4 text-slate-500" /><span className="capitalize">{car.fuel_type || 'petrol'}</span></div>
                      <div className="flex items-center gap-2"><Car className="w-4 h-4 text-slate-500" /><span className="capitalize">{car.car_type}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold text-orange-600"><PriceDisplay amount={parseFloat(car.total_amount)} fromCurrency={car.currency} /></div>
                        <p className="text-xs text-slate-500">total · {rentalDays} day{rentalDays !== 1 ? 's' : ''} · incl. markup</p>
                      </div>
                      <Button onClick={() => { setSelectedCar(car); setShowBookingDialog(true); }}>Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedCar && (
          <CarRentalBookingDialog
            car={selectedCar}
            open={showBookingDialog}
            onOpenChange={(open) => { setShowBookingDialog(open); if (!open) setSelectedCar(null); }}
          />
        )}
      </div>
    </div>
  );
}
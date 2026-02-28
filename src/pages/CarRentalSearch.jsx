import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Gauge, Fuel, Search } from 'lucide-react';
import CarRentalBookingDialog from '@/components/cars/CarRentalBookingDialog';
import PriceDisplay from '@/components/currency/PriceDisplay';

export default function CarRentalSearch() {
  const [filters, setFilters] = useState({
    company: 'all',
    car_type: 'all',
    location: 'Manila, Philippines'
  });
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { data: cars = [] } = useQuery({
    queryKey: ['cars', filters],
    queryFn: async () => {
      let query = { status: 'active', availability: true };
      if (filters.company !== 'all') query.rental_company = filters.company;
      if (filters.car_type !== 'all') query.car_type = filters.car_type;
      return base44.entities.Car.filter(query);
    }
  });

  const filteredCars = cars.filter(car => {
    const locationMatch = !filters.location || car.location.toLowerCase().includes(filters.location.toLowerCase());
    return locationMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Car Rentals</h1>
          <p className="text-slate-600">Explore the world at your own pace</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.company} onValueChange={(v) => setFilters({...filters, company: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="Hertz">Hertz</SelectItem>
                  <SelectItem value="Avis">Avis</SelectItem>
                  <SelectItem value="Budget">Budget</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Sixt">Sixt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.car_type} onValueChange={(v) => setFilters({...filters, car_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Car Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map(car => (
            <Card key={car.id} className="hover:shadow-xl transition-shadow overflow-hidden">
              {car.image_url && (
                <img src={car.image_url} alt={car.car_model} className="w-full h-48 object-cover" />
              )}
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl mb-1">{car.car_model}</h3>
                  <Badge className="mb-2">{car.rental_company}</Badge>
                  <p className="text-sm text-slate-600">{car.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{car.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-slate-500" />
                    <span className="capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-slate-500" />
                    <span className="capitalize">{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-500" />
                    <span className="capitalize">{car.car_type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">${car.price_per_day}</p>
                    <p className="text-xs text-slate-500">per day</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedCar(car);
                      setShowBookingDialog(true);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No cars found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}

        {selectedCar && (
          <CarRentalBookingDialog
            car={selectedCar}
            open={showBookingDialog}
            onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setSelectedCar(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
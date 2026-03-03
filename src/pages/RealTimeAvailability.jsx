import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Bus, Ship, Car, Train, MapPin, Calendar, Users, DollarSign, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function RealTimeAvailability() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all available inventory
  const { data: flights = [], isLoading: loadingFlights } = useQuery({
    queryKey: ['available-flights'],
    queryFn: () => base44.entities.Flight.filter({ status: 'active' }),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: hotels = [], isLoading: loadingHotels } = useQuery({
    queryKey: ['available-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: tours = [], isLoading: loadingTours } = useQuery({
    queryKey: ['available-tours'],
    queryFn: () => base44.entities.Tour.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: buses = [], isLoading: loadingBuses } = useQuery({
    queryKey: ['available-buses'],
    queryFn: () => base44.entities.Bus.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: ferries = [], isLoading: loadingFerries } = useQuery({
    queryKey: ['available-ferries'],
    queryFn: () => base44.entities.Ferry.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: cruises = [], isLoading: loadingCruises } = useQuery({
    queryKey: ['available-cruises'],
    queryFn: () => base44.entities.Cruise.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: trains = [], isLoading: loadingTrains } = useQuery({
    queryKey: ['available-trains'],
    queryFn: () => base44.entities.Train.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const { data: cars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['available-cars'],
    queryFn: () => base44.entities.Car.filter({ status: 'active' }),
    refetchInterval: 30000
  });

  const AvailabilityCard = ({ item, type, icon: Icon }) => {
    const getPrice = () => {
      switch(type) {
        case 'flight': return item.cabin_classes?.[0]?.price || 0;
        case 'hotel': return item.room_types?.[0]?.price_per_night || 0;
        case 'tour': return item.price_per_person || 0;
        case 'bus': return item.base_price || 0;
        case 'ferry': return item.base_price || 0;
        case 'cruise': return item.starting_price || 0;
        case 'train': return item.base_price || 0;
        case 'car': return item.daily_rate || 0;
        default: return 0;
      }
    };

    const getAvailability = () => {
      switch(type) {
        case 'flight': return item.cabin_classes?.[0]?.seats_available || 0;
        case 'hotel': return item.room_types?.[0]?.rooms_available || 0;
        case 'tour': return item.spots_available || 0;
        case 'bus': return item.seats_available || 0;
        case 'ferry': return item.seats_available || 0;
        case 'cruise': return item.cabins_available || 0;
        case 'train': return item.seats_available || 0;
        case 'car': return item.units_available || 0;
        default: return 0;
      }
    };

    const getTitle = () => {
      switch(type) {
        case 'flight': return `${item.airline_name} ${item.flight_number}`;
        case 'hotel': return item.name;
        case 'tour': return item.title;
        case 'bus': return `${item.operator} - ${item.route}`;
        case 'ferry': return `${item.operator} - ${item.route}`;
        case 'cruise': return item.ship_name;
        case 'train': return `${item.operator} - ${item.route}`;
        case 'car': return `${item.make} ${item.model}`;
        default: return 'Unknown';
      }
    };

    const getRoute = () => {
      switch(type) {
        case 'flight': return `${item.origin} → ${item.destination}`;
        case 'hotel': return item.location;
        case 'tour': return item.destination;
        case 'bus': return item.route;
        case 'ferry': return item.route;
        case 'cruise': return item.itinerary?.[0]?.port || 'Multiple ports';
        case 'train': return item.route;
        case 'car': return item.location;
        default: return '';
      }
    };

    const handleBook = () => {
      switch(type) {
        case 'flight':
          navigate(createPageUrl('FlightDetail'), { state: { flight: item } });
          break;
        case 'hotel':
          navigate(createPageUrl('HotelDetail'), { state: { hotel: item } });
          break;
        case 'tour':
          navigate(createPageUrl('TourDetail') + `?id=${item.id}`);
          break;
        default:
          navigate(createPageUrl('Home'));
      }
    };

    const availability = getAvailability();
    const isLowStock = availability > 0 && availability <= 5;

    return (
      <Card className="hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{getTitle()}</CardTitle>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {getRoute()}
                </p>
              </div>
            </div>
            {availability > 0 ? (
              <Badge className={isLowStock ? "bg-orange-500" : "bg-green-500"}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {availability} Available
              </Badge>
            ) : (
              <Badge variant="destructive">Sold Out</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              <PriceDisplay amount={getPrice()} showOriginal />
            </div>
            {type === 'flight' && item.departure_time && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                {new Date(item.departure_time).toLocaleDateString()}
              </div>
            )}
            {type === 'tour' && item.duration_days && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                {item.duration_days} days
              </div>
            )}
          </div>
          {availability > 0 && (
            <Button onClick={handleBook} className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
              Book Now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = (items, type, icon, loading) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const availableItems = items.filter(item => item.status === 'active');

    if (availableItems.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <icon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600">No available {type}s at the moment</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableItems.map((item) => (
          <AvailabilityCard key={item.id} item={item} type={type} icon={icon} />
        ))}
      </div>
    );
  };

  const allAvailable = [
    ...flights.filter(f => f.status === 'active'),
    ...hotels.filter(h => h.status === 'active'),
    ...tours.filter(t => t.status === 'active'),
    ...buses.filter(b => b.status === 'active'),
    ...ferries.filter(f => f.status === 'active'),
    ...cruises.filter(c => c.status === 'active'),
    ...trains.filter(t => t.status === 'active'),
    ...cars.filter(c => c.status === 'active')
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Real-Time Availability</h1>
          <p className="text-slate-600">Live inventory updates • Refreshes every 30 seconds</p>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
            <span className="text-sm text-slate-600">{allAvailable.length} items available now</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-9 gap-2 h-auto bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              All ({allAvailable.length})
            </TabsTrigger>
            <TabsTrigger value="flights" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Plane className="w-4 h-4 mr-1" />
              Flights ({flights.filter(f => f.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="hotels" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Hotel className="w-4 h-4 mr-1" />
              Hotels ({hotels.filter(h => h.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="tours" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-1" />
              Tours ({tours.filter(t => t.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="buses" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Bus className="w-4 h-4 mr-1" />
              Buses ({buses.filter(b => b.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="ferries" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Ship className="w-4 h-4 mr-1" />
              Ferries ({ferries.filter(f => f.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="cruises" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Ship className="w-4 h-4 mr-1" />
              Cruises ({cruises.filter(c => c.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="trains" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Train className="w-4 h-4 mr-1" />
              Trains ({trains.filter(t => t.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="cars" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Car className="w-4 h-4 mr-1" />
              Cars ({cars.filter(c => c.status === 'active').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.filter(f => f.status === 'active').map(item => (
                <AvailabilityCard key={`flight-${item.id}`} item={item} type="flight" icon={Plane} />
              ))}
              {hotels.filter(h => h.status === 'active').map(item => (
                <AvailabilityCard key={`hotel-${item.id}`} item={item} type="hotel" icon={Hotel} />
              ))}
              {tours.filter(t => t.status === 'active').map(item => (
                <AvailabilityCard key={`tour-${item.id}`} item={item} type="tour" icon={MapPin} />
              ))}
              {buses.filter(b => b.status === 'active').map(item => (
                <AvailabilityCard key={`bus-${item.id}`} item={item} type="bus" icon={Bus} />
              ))}
              {ferries.filter(f => f.status === 'active').map(item => (
                <AvailabilityCard key={`ferry-${item.id}`} item={item} type="ferry" icon={Ship} />
              ))}
              {cruises.filter(c => c.status === 'active').map(item => (
                <AvailabilityCard key={`cruise-${item.id}`} item={item} type="cruise" icon={Ship} />
              ))}
              {trains.filter(t => t.status === 'active').map(item => (
                <AvailabilityCard key={`train-${item.id}`} item={item} type="train" icon={Train} />
              ))}
              {cars.filter(c => c.status === 'active').map(item => (
                <AvailabilityCard key={`car-${item.id}`} item={item} type="car" icon={Car} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flights">
            {renderContent(flights, 'flight', Plane, loadingFlights)}
          </TabsContent>

          <TabsContent value="hotels">
            {renderContent(hotels, 'hotel', Hotel, loadingHotels)}
          </TabsContent>

          <TabsContent value="tours">
            {renderContent(tours, 'tour', MapPin, loadingTours)}
          </TabsContent>

          <TabsContent value="buses">
            {renderContent(buses, 'bus', Bus, loadingBuses)}
          </TabsContent>

          <TabsContent value="ferries">
            {renderContent(ferries, 'ferry', Ship, loadingFerries)}
          </TabsContent>

          <TabsContent value="cruises">
            {renderContent(cruises, 'cruise', Ship, loadingCruises)}
          </TabsContent>

          <TabsContent value="trains">
            {renderContent(trains, 'train', Train, loadingTrains)}
          </TabsContent>

          <TabsContent value="cars">
            {renderContent(cars, 'car', Car, loadingCars)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
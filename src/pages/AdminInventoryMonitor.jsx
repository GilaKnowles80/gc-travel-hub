import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, Bus, Ship, Car, Train, MapPin, AlertTriangle, TrendingUp, Package } from "lucide-react";

export default function AdminInventoryMonitor() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch all inventory with real-time updates
  const { data: flights = [] } = useQuery({
    queryKey: ['admin-flights'],
    queryFn: () => base44.entities.Flight.list(),
    refetchInterval: 10000
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => base44.entities.Hotel.list(),
    refetchInterval: 10000
  });

  const { data: tours = [] } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: () => base44.entities.Tour.list(),
    refetchInterval: 10000
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['admin-buses'],
    queryFn: () => base44.entities.Bus.list(),
    refetchInterval: 10000
  });

  const { data: ferries = [] } = useQuery({
    queryKey: ['admin-ferries'],
    queryFn: () => base44.entities.Ferry.list(),
    refetchInterval: 10000
  });

  const { data: cruises = [] } = useQuery({
    queryKey: ['admin-cruises'],
    queryFn: () => base44.entities.Cruise.list(),
    refetchInterval: 10000
  });

  const { data: trains = [] } = useQuery({
    queryKey: ['admin-trains'],
    queryFn: () => base44.entities.Train.list(),
    refetchInterval: 10000
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => base44.entities.Car.list(),
    refetchInterval: 10000
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStats = (items) => {
    const active = items.filter(i => i.status === 'active').length;
    const soldOut = items.filter(i => i.status === 'sold_out').length;
    const lowStock = items.filter(i => {
      const availability = i.seats_available || i.spots_available || i.units_available || i.cabins_available || i.rooms_available || 0;
      return availability > 0 && availability <= 5;
    }).length;
    return { total: items.length, active, soldOut, lowStock };
  };

  const inventoryStats = [
    { name: 'Flights', icon: Plane, data: flights, color: 'from-blue-500 to-cyan-600' },
    { name: 'Hotels', icon: Hotel, data: hotels, color: 'from-purple-500 to-pink-600' },
    { name: 'Tours', icon: MapPin, data: tours, color: 'from-amber-500 to-orange-600' },
    { name: 'Buses', icon: Bus, data: buses, color: 'from-green-500 to-emerald-600' },
    { name: 'Ferries', icon: Ship, data: ferries, color: 'from-indigo-500 to-blue-600' },
    { name: 'Cruises', icon: Ship, data: cruises, color: 'from-teal-500 to-cyan-600' },
    { name: 'Trains', icon: Train, data: trains, color: 'from-red-500 to-rose-600' },
    { name: 'Cars', icon: Car, data: cars, color: 'from-yellow-500 to-amber-600' },
  ];

  const totalAvailable = inventoryStats.reduce((sum, stat) => sum + getStats(stat.data).active, 0);
  const totalLowStock = inventoryStats.reduce((sum, stat) => sum + getStats(stat.data).lowStock, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Real-Time Inventory Monitor</h1>
          <p className="text-slate-600">Live updates every 10 seconds</p>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live Monitoring
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">{totalAvailable}</div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-600">{totalLowStock}</div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">{inventoryStats.length}</div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventoryStats.map((stat) => {
            const Icon = stat.icon;
            const stats = getStats(stat.data);
            
            return (
              <Card key={stat.name} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>{stat.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total</span>
                      <Badge variant="outline">{stats.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Available</span>
                      <Badge className="bg-green-500">{stats.active}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Sold Out</span>
                      <Badge variant="destructive">{stats.soldOut}</Badge>
                    </div>
                    {stats.lowStock > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Low Stock</span>
                        <Badge className="bg-orange-500">{stats.lowStock}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Low Stock Items */}
        {totalLowStock > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Low Stock Alerts</h2>
            <div className="grid grid-cols-1 gap-4">
              {inventoryStats.map(stat => {
                const lowStockItems = stat.data.filter(item => {
                  const availability = item.seats_available || item.spots_available || item.units_available || item.cabins_available || item.rooms_available || 0;
                  return availability > 0 && availability <= 5 && item.status === 'active';
                });

                return lowStockItems.map(item => {
                  const Icon = stat.icon;
                  const availability = item.seats_available || item.spots_available || item.units_available || item.cabins_available || item.rooms_available || 0;
                  
                  return (
                    <Card key={item.id} className="border-l-4 border-orange-500">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-orange-500" />
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.title || item.name || item.flight_number || item.route || item.ship_name || `${item.make} ${item.model}`}
                              </p>
                              <p className="text-sm text-slate-600">
                                {stat.name} • Only {availability} left
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-orange-500">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
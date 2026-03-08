import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Trash2, Plane, Hotel, TrendingDown, Clock } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "react-hot-toast";

export default function PriceAlerts() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: flightAlerts = [], isLoading: loadingFlights } = useQuery({
    queryKey: ["priceAlerts"],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.PriceAlert.filter({ user_email: user.email }, "-created_date");
    },
    enabled: !!user,
  });

  const { data: hotelAlerts = [], isLoading: loadingHotels } = useQuery({
    queryKey: ["hotelPriceAlerts"],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.HotelPriceAlert.filter({ user_email: user.email }, "-created_date");
    },
    enabled: !!user,
  });

  const deleteFlightAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.PriceAlert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceAlerts"] });
      toast.success("Flight alert deleted");
    },
  });

  const deleteHotelAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.HotelPriceAlert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelPriceAlerts"] });
      toast.success("Hotel alert deleted");
    },
  });

  const activeFlightAlerts = flightAlerts.filter(a => a.is_active && !a.notified);
  const triggeredFlightAlerts = flightAlerts.filter(a => a.notified);
  const activeHotelAlerts = hotelAlerts.filter(a => a.is_active && !a.notified);
  const triggeredHotelAlerts = hotelAlerts.filter(a => a.notified);

  const isLoading = loadingFlights || loadingHotels;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-amber-500" />
            Price Alerts
          </h1>
          <p className="text-slate-600">
            AI-powered monitoring for flights and hotels. Get notified when prices drop to your target.
          </p>
        </div>

        {flightAlerts.length === 0 && hotelAlerts.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl border-0 shadow-sm">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No price alerts yet</h3>
            <p className="text-slate-500 mb-4">
              Visit flight or hotel pages and click "Set Price Alert" to start monitoring prices with AI.
            </p>
          </Card>
        ) : (
          <Tabs defaultValue="flights" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="flights" className="gap-2">
                <Plane className="w-4 h-4" />
                Flights ({flightAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="hotels" className="gap-2">
                <Hotel className="w-4 h-4" />
                Hotels ({hotelAlerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-8 mt-6">
              {activeFlightAlerts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Active Alerts</h2>
                <div className="grid gap-4">
                  {activeAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-blue-100 text-blue-700 border-0">
                                {alert.flight_number}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {alert.cabin_class.replace('_', ' ')}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Plane className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold text-slate-900">{alert.route}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Current Price</p>
                                <p className="text-lg font-bold text-slate-900">
                                  ${alert.current_price.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Target Price</p>
                                <p className="text-lg font-bold text-green-600">
                                  ${alert.target_price.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              Last checked: {alert.last_checked ? moment(alert.last_checked).fromNow() : 'Never'}
                            </div>

                            {alert.current_price > alert.target_price && (
                              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                                <TrendingDown className="w-4 h-4 text-amber-600" />
                                <p className="text-xs text-amber-700">
                                  Waiting for ${(alert.current_price - alert.target_price).toLocaleString()} drop
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlertMutation.mutate(alert.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {triggeredFlightAlerts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Triggered Alerts</h2>
                <div className="grid gap-4">
                  {triggeredFlightAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 rounded-2xl border-0 shadow-sm bg-green-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-green-600 text-white border-0">
                                Price Target Reached!
                              </Badge>
                              <Badge variant="outline">{alert.flight_number}</Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Plane className="w-4 h-4 text-slate-600" />
                              <span className="font-semibold text-slate-900">{alert.route}</span>
                            </div>

                            <p className="text-sm text-slate-700">
                              The price has dropped to or below your target of ${alert.target_price.toLocaleString()}!
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFlightAlertMutation.mutate(alert.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            </TabsContent>

            <TabsContent value="hotels" className="space-y-8 mt-6">
              {activeHotelAlerts.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Active Alerts</h2>
                  <div className="grid gap-4">
                    {activeHotelAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-blue-100 text-blue-700 border-0">
                                  {alert.hotel_name}
                                </Badge>
                                <Badge variant="outline">{alert.room_type}</Badge>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <Hotel className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-slate-900">{alert.location}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Current Price</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    ${alert.current_price}/night
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Target Price</p>
                                  <p className="text-lg font-bold text-green-600">
                                    ${alert.target_price}/night
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs text-slate-500 mb-2">
                                {alert.check_in_date} → {alert.check_out_date}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                Last checked: {alert.last_checked ? moment(alert.last_checked).fromNow() : 'Never'}
                              </div>

                              {alert.current_price > alert.target_price && (
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                                  <TrendingDown className="w-4 h-4 text-amber-600" />
                                  <p className="text-xs text-amber-700">
                                    Waiting for ${(alert.current_price - alert.target_price).toFixed(2)} drop
                                  </p>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteHotelAlertMutation.mutate(alert.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {triggeredHotelAlerts.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Triggered Alerts</h2>
                  <div className="grid gap-4">
                    {triggeredHotelAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-6 rounded-2xl border-0 shadow-sm bg-green-50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-green-600 text-white border-0">
                                  Price Target Reached!
                                </Badge>
                                <Badge variant="outline">{alert.hotel_name}</Badge>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <Hotel className="w-4 h-4 text-slate-600" />
                                <span className="font-semibold text-slate-900">{alert.location}</span>
                              </div>

                              <p className="text-sm text-slate-700">
                                The price has dropped to or below your target of ${alert.target_price}/night!
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteHotelAlertMutation.mutate(alert.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
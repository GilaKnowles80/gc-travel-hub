import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plane, Clock, Calendar, ArrowLeft, Users, CheckCircle, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import FlightBookingForm from "../components/flights/FlightBookingForm";
import moment from "moment";

export default function FlightDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const flightId = urlParams.get("id");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedClass, setSelectedClass] = useState("economy");

  const { data: flight, isLoading } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => base44.entities.Flight.filter({ id: flightId }),
    select: (data) => data?.[0],
    enabled: !!flightId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-600">Flight not found</h2>
        <Link to={createPageUrl("Flights")}>
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flights
          </Button>
        </Link>
      </div>
    );
  }

  const cabinClassLabels = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    business: "Business",
    first_class: "First Class",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl("Flights")}>
            <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-xl mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-white/20 text-white border-white/30">{flight.airline_name}</Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              {flight.flight_number}
            </Badge>
            {flight.is_direct && (
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30">Direct Flight</Badge>
            )}
            {flight.status === "sold_out" && (
              <Badge className="bg-red-500 text-white border-0">Sold Out</Badge>
            )}
          </div>

          <div className="flex items-center gap-8 text-white">
            <div>
              <p className="text-4xl font-bold">{moment(flight.departure_time).format("HH:mm")}</p>
              <p className="text-xl text-white/80 mt-1">{flight.origin}</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <Clock className="w-4 h-4" />
                {flight.duration_hours}h
              </div>
              <div className="w-full h-px bg-white/30 relative">
                <Plane className="w-5 h-5 text-white/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
              </div>
              {!flight.is_direct && flight.stops?.length > 0 && (
                <p className="text-sm text-white/60 mt-2">
                  Stop{flight.stops.length > 1 ? "s" : ""}: {flight.stops.join(", ")}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-4xl font-bold">{moment(flight.arrival_time).format("HH:mm")}</p>
              <p className="text-xl text-white/80 mt-1">{flight.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-white/70">
            <Calendar className="w-4 h-4" />
            {moment(flight.departure_time).format("MMMM DD, YYYY")}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Flight Details</h2>
              <Card className="p-6 rounded-2xl border-0 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Plane className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-500">Aircraft</p>
                      <p className="font-semibold text-slate-900">{flight.aircraft_type || "Boeing 737"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Briefcase className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-500">Baggage Allowance</p>
                      <p className="font-semibold text-slate-900">{flight.baggage_allowance || "23 kg checked, 7 kg cabin"}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {flight.amenities?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {flight.amenities.map((amenity, i) => (
                    <Badge key={i} variant="outline" className="rounded-xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Select Cabin Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flight.cabin_classes?.map((cabin) => (
                  <Card
                    key={cabin.class}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedClass === cabin.class
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedClass(cabin.class)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-900 capitalize">
                        {cabinClassLabels[cabin.class]}
                      </h4>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                        {selectedClass === cabin.class && (
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      ${cabin.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {cabin.seats_available || 0} seats available
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-400">Selected Class</p>
                  <p className="text-xl font-bold text-slate-900 mt-1 capitalize">
                    {cabinClassLabels[selectedClass]}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    ${flight.cabin_classes?.find((c) => c.class === selectedClass)?.price?.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">per person</p>
                </div>

                <Button
                  onClick={() => setShowBooking(true)}
                  disabled={flight.status === "sold_out"}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-6 font-semibold text-base"
                >
                  {flight.status === "sold_out" ? "Sold Out" : "Book Now"}
                </Button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  No payment required to reserve
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Book Your Flight</DialogTitle>
          </DialogHeader>
          <FlightBookingForm flight={flight} cabinClass={selectedClass} onClose={() => setShowBooking(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
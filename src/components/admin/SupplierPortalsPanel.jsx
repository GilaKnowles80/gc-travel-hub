import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Search } from "lucide-react";

const supplierPortals = [
  {
    name: "Biyaheko",
    url: "https://www.biyaheko.com/login",
    description: "Tours, Flights, Hotels",
    color: "bg-blue-500",
    category: "Flights & Tours"
  },
  {
    name: "Wanderlinx",
    url: "https://www.wanderlinx.com/login",
    description: "Travel Services",
    color: "bg-purple-500",
    category: "General"
  },
  {
    name: "Tripzynx",
    url: "https://www.tripzynx.com/login",
    description: "Booking Platform",
    color: "bg-green-500",
    category: "General"
  },
  {
    name: "12Go Asia",
    url: "https://12go.asia/en",
    description: "Trains, Ferries, Buses",
    color: "bg-teal-500",
    category: "Ground & Sea"
  },
  {
    name: "Trainline",
    url: "https://www.thetrainline.com/",
    description: "Train Tickets Europe",
    color: "bg-cyan-500",
    category: "Trains"
  },
  {
    name: "Duffel",
    url: "https://app.duffel.com/",
    description: "Flight API Dashboard",
    color: "bg-violet-500",
    category: "Flights"
  },
  {
    name: "Trip.com",
    url: "https://www.trip.com/",
    description: "Global Travel",
    color: "bg-orange-500",
    category: "General"
  },
  {
    name: "Expedia",
    url: "https://www.expedia.com/",
    description: "Hotels & Flights",
    color: "bg-yellow-500",
    category: "Hotels"
  },
  {
    name: "Traveloka",
    url: "https://www.traveloka.com/",
    description: "Southeast Asia Travel",
    color: "bg-red-500",
    category: "General"
  },
  {
    name: "Amadeus",
    url: "https://developers.amadeus.com/",
    description: "API Dashboard",
    color: "bg-indigo-500",
    category: "API"
  },
  {
    name: "PayMongo",
    url: "https://dashboard.paymongo.com/",
    description: "Payment Dashboard",
    color: "bg-pink-500",
    category: "Payments"
  },
  {
    name: "Stripe",
    url: "https://dashboard.stripe.com/",
    description: "Payment Dashboard",
    color: "bg-slate-700",
    category: "Payments"
  }
];

export default function SupplierPortalsPanel() {
  const handleOpenPortal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Supplier Portals - Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {supplierPortals.map((supplier) => (
            <Button
              key={supplier.name}
              onClick={() => handleOpenPortal(supplier.url)}
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-2 h-2 rounded-full ${supplier.color}`} />
                <span className="font-semibold">{supplier.name}</span>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-400" />
              </div>
              <span className="text-xs text-slate-500">{supplier.description}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Click any supplier to open their portal in a new tab for manual bookings
        </p>
      </CardContent>
    </Card>
  );
}
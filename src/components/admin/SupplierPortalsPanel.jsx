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

const categoryColors = {
  "Flights & Tours": "bg-blue-100 text-blue-700",
  "Ground & Sea": "bg-teal-100 text-teal-700",
  "Trains": "bg-cyan-100 text-cyan-700",
  "Flights": "bg-violet-100 text-violet-700",
  "Hotels": "bg-yellow-100 text-yellow-700",
  "General": "bg-slate-100 text-slate-700",
  "Payments": "bg-pink-100 text-pink-700",
  "API": "bg-indigo-100 text-indigo-700",
};

export default function SupplierPortalsPanel() {
  const [search, setSearch] = useState("");

  const filtered = supplierPortals.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenPortal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Supplier Portals — Quick Access
        </CardTitle>
        <div className="relative mt-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((supplier) => (
            <button
              key={supplier.name}
              onClick={() => handleOpenPortal(supplier.url)}
              className="group text-left border border-slate-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${supplier.color} shrink-0`} />
                <span className="font-bold text-slate-800 group-hover:text-amber-700 flex-1">{supplier.name}</span>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mb-2">{supplier.description}</p>
              <Badge className={`text-xs ${categoryColors[supplier.category] || 'bg-slate-100 text-slate-600'}`}>
                {supplier.category}
              </Badge>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-6">No supplier found.</p>
        )}
        <p className="text-xs text-slate-400 mt-4">
          Click any supplier to open their portal in a new tab.
        </p>
      </CardContent>
    </Card>
  );
}
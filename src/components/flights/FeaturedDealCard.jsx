import React from "react";
import { Plane, Clock, Luggage, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function FeaturedDealCard({ deal, onBook }) {
  const discount = deal.original_price_php
    ? Math.round(((deal.original_price_php - deal.price_php) / deal.original_price_php) * 100)
    : null;

  const isSoldOut = deal.status === "sold_out";
  const isLimited = deal.seats_available > 0 && deal.seats_available <= 5;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${isSoldOut ? "opacity-60" : ""}`}>
      {/* Destination Image */}
      <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.destination_city} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-lg font-bold">{deal.destination_city}</p>
          <p className="text-xs opacity-80">{deal.origin_city} → {deal.destination_city}</p>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {discount && <Badge className="bg-red-500 text-white border-0 text-xs">-{discount}% OFF</Badge>}
          {isSoldOut && <Badge className="bg-slate-800 text-white border-0 text-xs">SOLD OUT</Badge>}
          {isLimited && !isSoldOut && <Badge className="bg-orange-500 text-white border-0 text-xs">⚡ {deal.seats_available} left</Badge>}
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs capitalize">{deal.cabin_class?.replace(/_/g, ' ')}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{deal.trip_type?.replace(/_/g, ' ')}</Badge>
          <Badge variant="outline" className="text-xs">{deal.airline}</Badge>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-slate-800">{deal.origin_code}</span>
          <div className="flex-1 flex items-center">
            <div className="h-px flex-1 bg-slate-200" />
            <Plane className="w-3 h-3 text-amber-500 mx-1" />
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <span className="text-xl font-bold text-slate-800">{deal.destination_code}</span>
        </div>

        {/* Date */}
        {deal.departure_date && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            <span>Departs: {moment(deal.departure_date).format("MMM DD, YYYY")}</span>
            {deal.return_date && <span>· Returns: {moment(deal.return_date).format("MMM DD, YYYY")}</span>}
          </div>
        )}

        {deal.baggage_allowance && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <Luggage className="w-3 h-3" />
            <span>{deal.baggage_allowance}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mt-3">
          <div>
            {deal.original_price_php && (
              <p className="text-xs text-slate-400 line-through">₱{deal.original_price_php.toLocaleString()}</p>
            )}
            <p className="text-2xl font-bold text-amber-600">₱{deal.price_php.toLocaleString()}</p>
            <p className="text-xs text-slate-400">per person</p>
          </div>
          <Button
            onClick={() => onBook(deal)}
            disabled={isSoldOut}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            size="sm"
          >
            {isSoldOut ? "Sold Out" : "Book Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
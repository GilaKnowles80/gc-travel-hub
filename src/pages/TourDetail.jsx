import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Star, MapPin, Clock, Users, CheckCircle, XCircle, ArrowLeft, CalendarDays, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import BookingForm from "../components/tours/BookingForm";
import LocationMap from "../components/shared/LocationMap";
import TourCustomizer from "../components/tours/TourCustomizer";
import { useCurrency } from "@/components/currency/CurrencyContext";

export default function TourDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get("id");
  const [showBooking, setShowBooking] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizedPrice, setCustomizedPrice] = useState(null);
  const { formatPrice } = useCurrency();

  const { data: tour, isLoading } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => base44.entities.Tour.filter({ id: tourId }),
    select: (data) => data?.[0],
    enabled: !!tourId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-600">Tour not found</h2>
        <Link to={createPageUrl("Tours")}>
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tours
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={tour.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <Link to={createPageUrl("Tours")}>
            <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {tour.category && (
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 capitalize">
                  {tour.category.replace(/_/g, " ")}
                </Badge>
              )}
              {tour.status === "sold_out" && (
                <Badge className="bg-red-500 text-white border-0">Sold Out</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {tour.destination}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {tour.duration_days} days
              </div>
              {tour.group_size_max && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Max {tour.group_size_max} people
                </div>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 text-amber-400 ${
                      i < Math.round(tour.rating || 4) ? "fill-current" : "opacity-40"
                    }`}
                  />
                ))}
                <span className="ml-1">({tour.reviews_count || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-10">
             {showCustomizer ? (
               <TourCustomizer tour={tour} onPriceChange={setCustomizedPrice} />
             ) : (
               <>
                 {/* Description */}
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Tour</h2>
                   <p className="text-slate-600 leading-relaxed">
                     {tour.long_description || tour.description || "An amazing travel experience awaits you."}
                   </p>
                 </motion.div>

                 {/* Itinerary */}
                 {tour.itinerary?.length > 0 && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Itinerary</h2>
                     <div className="space-y-3">
                       {tour.itinerary.map((day, i) => (
                         <div
                           key={i}
                           className="bg-white rounded-xl border border-slate-100 overflow-hidden"
                         >
                           <button
                             onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                             className="w-full flex items-center justify-between p-5 text-left"
                           >
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                 <CalendarDays className="w-5 h-5 text-amber-600" />
                               </div>
                               <div>
                                 <p className="text-xs text-amber-500 font-semibold">Day {day.day || i + 1}</p>
                                 <p className="font-semibold text-slate-900">{day.title}</p>
                               </div>
                             </div>
                             {expandedDay === i ? (
                               <ChevronUp className="w-5 h-5 text-slate-400" />
                             ) : (
                               <ChevronDown className="w-5 h-5 text-slate-400" />
                             )}
                           </button>
                           {expandedDay === i && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: "auto", opacity: 1 }}
                               className="px-5 pb-5"
                             >
                               <p className="text-slate-500 text-sm leading-relaxed pl-14">
                                 {day.description}
                               </p>
                             </motion.div>
                           )}
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {/* Inclusions / Exclusions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {tour.inclusions?.length > 0 && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                       <h3 className="text-lg font-bold text-slate-900 mb-4">What's Included</h3>
                       <ul className="space-y-2">
                         {tour.inclusions.map((item, i) => (
                           <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                             {item}
                           </li>
                         ))}
                       </ul>
                     </motion.div>
                   )}
                   {tour.exclusions?.length > 0 && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                       <h3 className="text-lg font-bold text-slate-900 mb-4">Not Included</h3>
                       <ul className="space-y-2">
                         {tour.exclusions.map((item, i) => (
                           <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                             <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                             {item}
                           </li>
                         ))}
                       </ul>
                     </motion.div>
                   )}
                 </div>

                 {/* Location Map */}
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <MapPin className="w-5 h-5 text-amber-500" />
                     Tour Location
                   </h3>
                   <LocationMap
                     lat={14.5995}
                     lng={120.9842}
                     title={tour.destination}
                     className="h-80 border border-slate-200"
                   />
                 </motion.div>

                 {/* Gallery */}
                 {tour.gallery_urls?.length > 0 && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {tour.gallery_urls.map((url, i) => (
                         <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                           <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </>
             )}
           </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
              >
                <div className="text-center mb-6">
                    <p className="text-sm text-slate-400">{showCustomizer ? "Customized" : "Starting from"}</p>
                    <p className="text-4xl font-bold text-slate-900 mt-1">
                      {formatPrice(customizedPrice ?? tour.price_per_person, 'USD')}
                    </p>
                    <p className="text-sm text-slate-400">{showCustomizer ? "total price" : "per person"}</p>
                  </div>

                {!showCustomizer && (
                   <div className="space-y-3 mb-6">
                     <div className="flex items-center gap-3 text-sm text-slate-600">
                       <Clock className="w-4 h-4 text-amber-500" />
                       {tour.duration_days} days
                     </div>
                     {tour.group_size_max && (
                       <div className="flex items-center gap-3 text-sm text-slate-600">
                         <Users className="w-4 h-4 text-amber-500" />
                         Max {tour.group_size_max} travelers
                       </div>
                     )}
                     {tour.departure_dates?.length > 0 && (
                       <div className="flex items-center gap-3 text-sm text-slate-600">
                         <CalendarDays className="w-4 h-4 text-amber-500" />
                         {tour.departure_dates.length} available dates
                       </div>
                     )}
                   </div>
                 )}

                <div className="space-y-2">
                   <Button
                     onClick={() => showCustomizer ? setShowCustomizer(false) : setShowCustomizer(true)}
                     className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl py-6 font-semibold text-base"
                   >
                     {showCustomizer ? "Back to Details" : "Customize Tour"}
                   </Button>

                   {!showCustomizer && (
                     <Button
                       onClick={() => setShowBooking(true)}
                       disabled={tour.status === "sold_out"}
                       className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-6 font-semibold text-base"
                     >
                       {tour.status === "sold_out" ? "Sold Out" : "Book Now"}
                     </Button>
                   )}

                   {showCustomizer && (
                     <Button
                       onClick={() => setShowBooking(true)}
                       disabled={tour.status === "sold_out"}
                       className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-6 font-semibold text-base"
                     >
                       {tour.status === "sold_out" ? "Sold Out" : "Book with Customizations"}
                     </Button>
                   )}
                 </div>

                <p className="text-center text-xs text-slate-400 mt-3">
                  No payment required to reserve
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Book Your Trip</DialogTitle>
          </DialogHeader>
          <BookingForm tour={tour} onClose={() => setShowBooking(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
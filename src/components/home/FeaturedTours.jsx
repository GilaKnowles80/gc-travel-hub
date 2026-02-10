import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

function TourCard({ tour, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={createPageUrl("TourDetail") + `?id=${tour.id}`}>
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl bg-white">
          <div className="relative h-64 overflow-hidden">
            <img
              src={tour.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {tour.is_featured && (
              <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-0 px-3 py-1 text-xs font-semibold">
                Featured
              </Badge>
            )}
            {tour.category && (
              <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 text-xs capitalize">
                {tour.category.replace(/_/g, " ")}
              </Badge>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-1 text-amber-300 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(tour.rating || 4) ? "fill-current" : "opacity-40"
                    }`}
                  />
                ))}
                <span className="text-white/80 text-xs ml-1">
                  ({tour.reviews_count || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {tour.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {tour.destination}
            </div>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed line-clamp-2">
              {tour.description}
            </p>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                {tour.duration_days} days
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">from</p>
                <p className="text-xl font-bold text-slate-900">
                  ${tour.price_per_person?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function FeaturedTours({ tours, isLoading }) {
  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-500 font-semibold tracking-widest uppercase text-sm mb-3">
            Explore
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Popular Tour Packages
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Handpicked experiences designed to create unforgettable moments
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[420px] animate-pulse">
                <div className="h-64 bg-slate-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, i) => (
              <TourCard key={tour.id} tour={tour} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to={createPageUrl("Tours")}>
            <button className="group inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              View All Tours
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
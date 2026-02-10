import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Santos",
    location: "Manila, Philippines",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    text: "GC Travel made our Boracay trip absolutely perfect. Every detail was taken care of, from the flights to the beachfront resort. Couldn't have asked for a better experience!",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    location: "Cebu City",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    text: "The Japan cherry blossom tour was a dream come true. Professional guides, amazing itinerary, and the group was wonderful. Already planning our next trip with GC!",
    rating: 5,
  },
  {
    name: "Anna Reyes",
    location: "Davao City",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    text: "Best travel agency I've ever booked with. The Singapore city tour was perfectly organized and the price was unbeatable. Their customer service is top-notch.",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-500 font-semibold tracking-widest uppercase text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            What Our Travelers Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-slate-50 rounded-2xl p-8 border border-slate-100"
            >
              <Quote className="w-8 h-8 text-amber-200 mb-4" />
              <p className="text-slate-600 leading-relaxed text-sm">{t.text}</p>
              <div className="flex items-center gap-1 mt-4 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
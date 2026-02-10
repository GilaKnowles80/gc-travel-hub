import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function CTASection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/80" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
          Ready for Your Next
          <br />
          <span className="text-amber-400">Adventure?</span>
        </h2>
        <p className="mt-6 text-white/70 text-lg">
          Let us plan your dream vacation. Contact us today and get a
          personalized travel itinerary.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={createPageUrl("Tours")}>
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-8 font-semibold"
            >
              Browse Tours
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 font-semibold"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { Shield, Headphones, Wallet, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your safety is our top priority with verified partners and secure bookings",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance wherever you are in the world",
  },
  {
    icon: Wallet,
    title: "Best Price Guarantee",
    description: "Competitive pricing with no hidden fees — guaranteed",
  },
  {
    icon: Award,
    title: "Trusted Agency",
    description: "Years of experience crafting perfect travel experiences",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm mb-3">
            Why GC Travel
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Why Travel With Us
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                <feat.icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-black font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-black text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
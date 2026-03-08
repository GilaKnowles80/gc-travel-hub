import React from "react";
import { motion } from "framer-motion";
import { Palmtree, Mountain, Landmark, Ship, TreePine, Building, Heart, Church, Bus, Car, Train, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

const categories = [
  { id: "beach", label: "Tour Packages", icon: Palmtree, color: "from-cyan-400 to-blue-500", page: "Tours", query: "" },
  { id: "bus", label: "Bus", icon: Bus, color: "from-emerald-400 to-green-600", page: "BusSearch", query: "" },
  { id: "ferry", label: "Ferry", icon: Ship, color: "from-blue-400 to-cyan-500", page: "FerrySearch", query: "" },
  { id: "cruise", label: "Cruise", icon: Ship, color: "from-indigo-400 to-blue-600", page: "CruiseSearch", query: "" },
  { id: "visa", label: "Tourist Visa", icon: FileText, color: "from-amber-400 to-yellow-600", page: "Visas", query: "" },
  { id: "car", label: "Car Rental", icon: Car, color: "from-orange-400 to-red-500", page: "CarRentalSearch", query: "" },
  { id: "train", label: "Train", icon: Train, color: "from-purple-400 to-indigo-600", page: "TrainSearch", query: "" },
  { id: "adventure", label: "Adventure Tours", icon: Mountain, color: "from-lime-400 to-emerald-600", page: "Tours", query: "?category=adventure" },
];

export default function CategorySection() {
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
            Explore Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Your Complete Travel Companion
          </h2>
          <p className="text-slate-500 mt-3 text-base">Flights, hotels, tours, and more — all in one place</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={createPageUrl(cat.page) + cat.query}>
                <div className="group relative overflow-hidden rounded-2xl bg-slate-50 p-6 md:p-8 text-center hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100 hover:border-transparent">
                  <div className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-black text-base">{cat.label}</p>
                  <p className="text-sm text-slate-500 mt-2 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-300">
                    Browse {cat.label.toLowerCase()} options worldwide
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Edit2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function AdminContentManager() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const toursData = await base44.entities.Tour.list();
      setTours(toursData);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (tour) => {
    try {
      await base44.entities.Tour.update(tour.id, {
        ...tour,
        is_featured: !tour.is_featured,
      });
      fetchTours();
    } catch (error) {
      console.error("Failed to update tour:", error);
    }
  };

  const filteredTours = tours.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Featured Content Management</h3>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Tour
        </Button>
      </div>

      <Input
        placeholder="Search tours..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTours.map((tour, idx) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{tour.title}</p>
                <p className="text-sm text-slate-500">{tour.destination} • ${tour.price_per_person}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeature(tour)}
                  className={`p-2 rounded-lg transition-colors ${
                    tour.is_featured
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                  title={tour.is_featured ? "Remove from featured" : "Add to featured"}
                >
                  {tour.is_featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-amber-600">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Settings, Users, FileText, RefreshCw } from "lucide-react";

export default function AdminQuickActions() {
  const actions = [
    {
      icon: BookOpen,
      label: "View All Bookings",
      page: "ManageReservations",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      label: "Analytics Dashboard",
      page: "AdminAnalytics",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      label: "Customer Management",
      page: "AdminDataManager",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FileText,
      label: "Data Manager",
      page: "AdminDataManager",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Settings,
      label: "System Settings",
      page: "AdminDashboard",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: RefreshCw,
      label: "Sync Data",
      page: "AdminDashboard",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(action.page)}>
                <div className={`bg-gradient-to-br ${action.color} rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 group`}>
                  <Icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-sm">{action.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
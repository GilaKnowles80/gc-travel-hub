import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAdminMode } from "@/components/admin/AdminModeContext";
import AdminStatsPanel from "@/components/admin/AdminStatsPanel";
import AdminContentManager from "@/components/admin/AdminContentManager";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedTours from "@/components/home/FeaturedTours";
import LiveFlightDeals from "@/components/home/LiveFlightDeals";
import TestimonialSection from "@/components/home/TestimonialSection";
import CustomerSatisfaction from "@/components/home/CustomerSatisfaction";
import CTASection from "@/components/home/CTASection";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function AdminHome() {
  const { adminMode } = useAdminMode();
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!adminMode) {
      fetchTours();
    }
  }, [adminMode]);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      const toursData = await base44.entities.Tour.list();
      setTours(toursData);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (adminMode) {
    return (
      <div className="w-full bg-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage your travel platform and view real-time analytics</p>
          </div>

          <AdminStatsPanel />
          <AdminQuickActions />
          <AdminContentManager />
        </div>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="w-full">
      <HeroSection />
      <CategorySection />
      <FeaturedTours tours={tours} isLoading={isLoading} />
      <LiveFlightDeals />
      <TestimonialSection />
      <CustomerSatisfaction />
      <WhyChooseUs />
      <CTASection />
    </div>
  );
}
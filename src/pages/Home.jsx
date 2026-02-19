import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import PopularFlightRoutes from "../components/home/PopularFlightRoutes";
import LiveFlightDeals from "../components/home/LiveFlightDeals";
import FlightTrustSignals from "../components/home/FlightTrustSignals";
import FeaturedTours from "../components/home/FeaturedTours";
import FeaturedPackages from "../components/home/FeaturedPackages";
import CategorySection from "../components/home/CategorySection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import TestimonialSection from "../components/home/TestimonialSection";
import CTASection from "../components/home/CTASection";

export default function Home() {
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["featured-tours"],
    queryFn: () => base44.entities.Tour.filter({ is_featured: true }, "-created_date", 6),
  });

  // Fallback to all tours if no featured ones
  const { data: allTours = [] } = useQuery({
    queryKey: ["all-tours-home"],
    queryFn: () => base44.entities.Tour.filter({ status: "active" }, "-created_date", 6),
    enabled: !isLoading && tours.length === 0,
  });

  const displayTours = tours.length > 0 ? tours : allTours;

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PopularFlightRoutes />
      <LiveFlightDeals />
      <FlightTrustSignals />
      <CategorySection />
      <FeaturedTours tours={displayTours} isLoading={isLoading} />
      <FeaturedPackages />
      <WhyChooseUs />
      <TestimonialSection />
      <CTASection />
    </div>
  );
}
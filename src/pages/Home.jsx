import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency/CurrencyContext";
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
import CustomerSatisfaction from "../components/home/CustomerSatisfaction";
import AbandonmentRecovery from "../components/checkout/AbandonmentRecovery";
import AffiliateOffersSection from "../components/affiliate/AffiliateOffersSection";
import FeaturedListingsSection from "../components/featured/FeaturedListingsSection";

export default function Home() {
  const { countryCode } = useCurrency();

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["featured-tours", countryCode],
    queryFn: async () => {
      const allTours = await base44.entities.Tour.filter({ 
        is_featured: true, 
        status: 'active' 
      }, "-created_date", 20);
      
      // For international visitors, prioritize Philippines destination tours
      if (countryCode !== 'PH') {
        return allTours.sort((a, b) => {
          const aIsPhilippines = a.destination?.toLowerCase().includes('philippines') || 
                                 a.destination?.toLowerCase().includes('manila') ||
                                 a.destination?.toLowerCase().includes('boracay') ||
                                 a.destination?.toLowerCase().includes('palawan');
          const bIsPhilippines = b.destination?.toLowerCase().includes('philippines') || 
                                 b.destination?.toLowerCase().includes('manila') ||
                                 b.destination?.toLowerCase().includes('boracay') ||
                                 b.destination?.toLowerCase().includes('palawan');
          if (aIsPhilippines && !bIsPhilippines) return -1;
          if (!aIsPhilippines && bIsPhilippines) return 1;
          return 0;
        }).slice(0, 6);
      }
      
      return allTours.slice(0, 6);
    },
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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <AbandonmentRecovery />
      </div>
      <FeaturedListingsSection />
      <PopularFlightRoutes />
      <LiveFlightDeals />
      <FlightTrustSignals />
      <CategorySection />
      <FeaturedTours tours={displayTours} isLoading={isLoading} />
      <AffiliateOffersSection />
      <FeaturedPackages />
      <WhyChooseUs />
      <TestimonialSection />
      <CustomerSatisfaction />
      <CTASection />
    </div>
  );
}
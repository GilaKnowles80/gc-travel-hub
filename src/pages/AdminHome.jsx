import React from "react";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedTours from "@/components/home/FeaturedTours";
import LiveFlightDeals from "@/components/home/LiveFlightDeals";
import TestimonialSection from "@/components/home/TestimonialSection";
import CustomerSatisfaction from "@/components/home/CustomerSatisfaction";
import CTASection from "@/components/home/CTASection";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function AdminHome() {
  return (
    <div className="w-full">
      <HeroSection />
      <CategorySection />
      <FeaturedTours />
      <LiveFlightDeals />
      <TestimonialSection />
      <CustomerSatisfaction />
      <WhyChooseUs />
      <CTASection />
    </div>
  );
}
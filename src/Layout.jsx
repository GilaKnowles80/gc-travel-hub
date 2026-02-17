import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, MapPin, BookOpen, Phone, User, Bell, Shield, Mail, Building2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/notifications/NotificationBell";
import { CurrencyProvider } from "@/components/currency/CurrencyContext";
import FloatingContactWidget from "@/components/support/FloatingContactWidget";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";

const navLinks = [
  { name: "Home", page: "Home", icon: Plane },
  { name: "Tours", page: "Tours", icon: MapPin },
  { name: "Flights", page: "Flights", icon: Plane },
  { name: "Hotels", page: "HotelSearch", icon: MapPin },
  { name: "Visas", page: "Visas", icon: MapPin },
  { name: "My Bookings", page: "MyBookings", icon: BookOpen },
  { name: "My Reviews", page: "MyReviews", icon: MapPin },
  { name: "Price Alerts", page: "PriceAlerts", icon: Bell },
  { name: "Support", page: "Helpdesk", icon: Mail },
  { name: "Profile", page: "Profile", icon: User },
  { name: "Admin", page: "AdminDashboard", icon: Shield, adminOnly: true },
  { name: "Security", page: "AdminSecurityCenter", icon: Shield, adminOnly: true },
  { name: "Pricing", page: "AdminPricing", icon: Plane, adminOnly: true },
  { name: "Corporate Clients", page: "AdminCorporateClients", icon: Building2, adminOnly: true },
  { name: "Promotions", page: "AdminPromotions", icon: Plane, adminOnly: true },
  { name: "Bulk Booking", page: "CorporateBooking", icon: Users, adminOnly: true },
  { name: "Email Clients", page: "AdminEmailClients", icon: Mail, adminOnly: true },
  { name: "Helpdesk", page: "AdminHelpdesk", icon: Mail, adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isHome = currentPageName === "Home";

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPageName]);

  const headerBg = isHome && !scrolled
    ? "bg-transparent"
    : "bg-white/95 backdrop-blur-md shadow-sm";

  const textColor = isHome && !scrolled ? "text-white" : "text-slate-700";
  const logoColor = isHome && !scrolled ? "text-white" : "text-slate-900";

  return (
    <RecaptchaProvider>
      <CurrencyProvider>
        <FloatingContactWidget />
        <div className="min-h-screen">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/a59c23110_LogoAgency.jpeg"
                alt="GC Travel and Tours Agency"
                className="h-16 w-auto"
              />
            </Link>



            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.filter(link => !link.adminOnly || user?.role === "admin").map((link) => (
                <Link key={link.page} to={createPageUrl(link.page)}>
                  <button
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      currentPageName === link.page
                        ? isHome && !scrolled
                          ? "bg-white/20 text-white"
                          : "bg-amber-50 text-amber-700"
                        : `${textColor} hover:bg-slate-100/50`
                    }`}
                  >
                    {link.name === "Home" && (
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/0ebce75b4_LogoAgency.jpeg"
                        alt="GC Logo"
                        className="h-6 w-auto"
                      />
                    )}
                    {link.name}
                  </button>
                </Link>
              ))}
              {user && <NotificationBell />}
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-xl ${textColor}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.filter(link => !link.adminOnly || user?.role === "admin").map((link) => (
                  <Link key={link.page} to={createPageUrl(link.page)}>
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        currentPageName === link.page
                          ? "bg-amber-50 text-amber-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main className={isHome ? "" : "pt-16 md:pt-20"}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">GC Travel & Tours</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your trusted travel partner for unforgettable adventures around the world.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase text-slate-300">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                <li><Link to={createPageUrl("Tours")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Tours</Link></li>
                <li><Link to={createPageUrl("Flights")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Flights</Link></li>
                <li><Link to={createPageUrl("HotelSearch")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Hotels</Link></li>
                <li><Link to={createPageUrl("Contact")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Contact Us</Link></li>
                <li>
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            window.open(`https://maps.google.com/?q=Block+12,+Lot+8,+Kapatiran+Village,+Pasong+Buaya+2,+Imus,+Cavite+4103,+Philippines&saddr=${latitude},${longitude}`, '_blank');
                          },
                          () => {
                            window.open('https://maps.google.com/?q=Block+12,+Lot+8,+Kapatiran+Village,+Pasong+Buaya+2,+Imus,+Cavite+4103,+Philippines', '_blank');
                          }
                        );
                      } else {
                        window.open('https://maps.google.com/?q=Block+12,+Lot+8,+Kapatiran+Village,+Pasong+Buaya+2,+Imus,+Cavite+4103,+Philippines', '_blank');
                      }
                    }}
                    className="text-slate-400 hover:text-amber-400 text-sm transition-colors cursor-pointer"
                  >
                    Visit Our Office
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase text-slate-300">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li><Link to={createPageUrl("TermsOfService")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Terms of Service</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link to={createPageUrl("RefundPolicy")} className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase text-slate-300">
                Contact Us
              </h4>
              <ul className="space-y-2.5 text-slate-400 text-sm">
                <li>info@gctravelandtours.com</li>
                <li>+63 915 440 1150</li>
                <li>Imus City, Cavite</li>
                <li>Philippines</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} GC Travel & Tours. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
      </CurrencyProvider>
    </RecaptchaProvider>
  );
}
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, MapPin, BookOpen, Phone, User, Bell, Shield, Mail, Building2, Users, Receipt, ArrowLeft, Crown, DollarSign, TrendingUp, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/notifications/NotificationBell";
import RealTimePaymentNotification from "@/components/payment/RealTimePaymentNotification";

import { CurrencyProvider } from "@/components/currency/CurrencyContext";
import { LanguageProvider } from "@/components/language/LanguageContext";
import LanguageSelector from "@/components/language/LanguageSelector";
import FloatingContactWidget from "@/components/support/FloatingContactWidget";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";
import SessionTimeout from "@/components/security/SessionTimeout";
import CookieConsent from "@/components/gdpr/CookieConsent";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import AdBanner from "@/components/ads/AdBanner";
import GoogleAdsTracking from "@/components/tracking/GoogleAdsTracking";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
import { AdminModeProvider, useAdminMode } from "@/components/admin/AdminModeContext";

const navLinks = [
  { name: "Home", page: "Home", icon: Plane },
  { name: "Flights", page: "Flights", icon: Plane },
  { name: "Hotels", page: "HotelSearch", icon: MapPin },
  { name: "My Bookings", page: "MyBookings", icon: BookOpen },
  { name: "Profile", page: "Profile", icon: User },
  { name: "Support", page: "Helpdesk", icon: Mail },
  { name: "Admin", page: "AdminDashboard", icon: Shield, adminOnly: true },

  { name: "Biyaheko", page: "BiyahekoPortal", icon: Globe, adminOnly: true },
  { name: "Tripzynx", page: "TripzynxPortal", icon: Globe, adminOnly: true },
  { name: "Wanderlinx", page: "WanderlinxPortal", icon: Globe, adminOnly: true },
  { name: "Reservations", page: "ManageReservations", icon: BookOpen, adminOnly: true },
  { name: "Analytics", page: "AdminAnalytics", icon: TrendingUp, adminOnly: true },
  { name: "Data Manager", page: "AdminDataManager", icon: Receipt, adminOnly: true },
  { name: "Advertisements", page: "AdminAdvertisements", icon: Receipt, adminOnly: true },
];

function LayoutContent({ children, currentPageName }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  let adminMode = false;
  let toggleAdminMode = () => {};
  
  try {
    const adminContext = useAdminMode();
    adminMode = adminContext.adminMode;
    toggleAdminMode = adminContext.toggleAdminMode;
  } catch (e) {
    // Hook not available, use defaults
  }
  const adminMenuRef = React.useRef(null);
  const [navigationStack, setNavigationStack] = useState({
    Home: ["/"],
    Tours: [createPageUrl("Tours")],
    Flights: [createPageUrl("Flights")],
    MyBookings: [createPageUrl("MyBookings")],
    Profile: [createPageUrl("Profile")],
  });
  const navigate = useNavigate();
  const isHome = currentPageName === "Home";

  const handleTabPress = (pageName, isCurrentTab) => {
    if (isCurrentTab) {
      // Reset stack to root
      const rootPath = navigationStack[pageName]?.[0];
      if (rootPath) {
        navigate(rootPath);
        setNavigationStack(prev => ({
          ...prev,
          [pageName]: [rootPath]
        }));
      }
    } else {
      // Navigate to tab
      const stack = navigationStack[pageName] || [createPageUrl(pageName)];
      const lastPath = stack[stack.length - 1];
      navigate(lastPath);
    }
  };

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  React.useEffect(() => {
    const handler = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) setAdminMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    <AdminModeProvider>
      <RecaptchaProvider>
        <LanguageProvider>
          <CurrencyProvider>
          <GoogleTagManager />
          <GoogleAdsTracking />
          <FloatingContactWidget />
          <RealTimePaymentNotification />
          {(!user || user.role !== 'admin') && <SessionTimeout />}
          <CookieConsent />
          {user && user.role !== 'admin' && (
            <style>{`
              [data-base44-edit-button],
              .base44-edit-button,
              iframe[src*="base44"] {
                display: none !important;
              }
            `}</style>
          )}
          <div className="min-h-screen">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8" style={{ paddingTop: 0 }}>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Back Button (Mobile Only, not on Home) */}
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className={`md:hidden p-2 rounded-xl ${textColor}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/bddaaee95_GC-logojpg.jpeg"
                alt="GC Travel and Tours Agency"
                className="h-16 w-auto"
              />
            </Link>



            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-end overflow-hidden">
              <div className="flex items-center gap-1 shrink-0">
                <Link to={createPageUrl("Wallet")} className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all bg-amber-50 text-amber-700 hover:bg-amber-100">
                  <DollarSign className="w-4 h-4 inline mr-1.5" />
                  Wallet
                </Link>
                <LanguageSelector showLabel />
              </div>
              {/* Public links - always visible */}
              {navLinks.filter(link => !link.adminOnly).map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link key={link.page} to={createPageUrl(link.page)} className="shrink-0">
                    <button
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        currentPageName === link.page
                          ? isHome && !scrolled
                            ? "bg-white/20 text-white"
                            : "bg-amber-50 text-amber-700"
                          : `${textColor} hover:bg-slate-100/50`
                      }`}
                    >
                      {link.name}
                    </button>
                  </Link>
                );
              })}
              
              {/* Supplier Portal Links - always visible for quick access */}
              {user?.role === "admin" && (
                <div className="flex items-center gap-1 shrink-0">
                  {["BiyahekoPortal", "TripzynxPortal", "WanderlinxPortal"].map((page) => {
                    const portalName = page.replace("Portal", "");
                    return (
                      <Link key={page} to={createPageUrl(page)}>
                        <button
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                            currentPageName === page
                              ? isHome && !scrolled
                                ? "bg-white/20 text-white"
                                : "bg-blue-50 text-blue-700"
                              : `${textColor} hover:bg-slate-100/50`
                          }`}
                          title={`${portalName} Portal`}
                        >
                          {portalName}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              )}
              {/* Admin mode toggle */}
              {user?.role === "admin" && (
                <button
                  onClick={toggleAdminMode}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    adminMode
                      ? "bg-purple-100 text-purple-700 shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={adminMode ? "Switch to user view" : "Switch to admin view"}
                >
                  <Shield className="w-4 h-4" />
                  {adminMode ? "Admin" : "User"}
                </button>
              )}

              {/* Admin links in a dropdown */}
              {user?.role === "admin" && adminMode && (
                <div className="relative shrink-0" ref={adminMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAdminMenuOpen(v => !v);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${adminMenuOpen ? "bg-amber-100 text-amber-800 shadow-md" : "bg-white/10 hover:bg-white/20 text-white border border-white/20"}`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                    <span className={`text-xs transition-transform ml-1 ${adminMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {adminMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[200px] z-50">
                      {navLinks.filter(link => link.adminOnly).map((link) => (
                        <Link key={link.page} to={createPageUrl(link.page)} onClick={() => setAdminMenuOpen(false)} className="block">
                           {(() => {
                             const IconComponent = link.icon;
                             return (
                               <div className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-2 hover:bg-amber-50 cursor-pointer ${currentPageName === link.page ? "bg-amber-100 text-amber-800 border-l-3 border-amber-600" : "text-slate-600"}`}>
                                 <IconComponent className="w-4 h-4" />
                                 {link.name}
                               </div>
                             );
                           })()}
                         </Link>
                        ))}
                        </div>
                  )}
                </div>
              )}
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
                <div className="mb-3 flex justify-center">
                  <LanguageSelector showLabel />
                </div>
                {navLinks.filter(link => !link.adminOnly || user?.role === "admin").map((link) => {
                   const IconComponent = link.icon;
                   return (
                     <Link key={link.page} to={createPageUrl(link.page)}>
                       <button
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                           currentPageName === link.page
                             ? "bg-amber-50 text-amber-700"
                             : "text-slate-600 hover:bg-slate-50"
                         }`}
                       >
                         <IconComponent className="w-4 h-4" />
                         {link.name}
                       </button>
                     </Link>
                   );
                 })}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main className={isHome ? "pb-16 md:pb-0" : "pt-16 md:pt-20 pb-16 md:pb-0"}>
        {/* Top Ad Banner */}
        {!isHome && <AdBanner placement="banner_top" currentPage={currentPageName.toLowerCase()} />}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* Bottom Ad Banner */}
        {!isHome && <AdBanner placement="banner_bottom" currentPage={currentPageName.toLowerCase()} />}
      </main>
      
      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation currentPageName={currentPageName} onTabPress={handleTabPress} />

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
                    className="text-slate-400 hover:text-amber-400 text-sm transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-700/20 active:scale-95"
                    type="button"
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
        </LanguageProvider>
      </RecaptchaProvider>
    </AdminModeProvider>
  );
}

function LayoutContent_WithProvider({ children, currentPageName }) {
  return (
    <AdminModeProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </AdminModeProvider>
  );
}

export default LayoutContent_WithProvider;
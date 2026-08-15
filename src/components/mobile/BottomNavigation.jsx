import React from "react";
import { Home, MapPin, Plane, BookOpen, User } from "lucide-react";

const navItems = [
  { name: "Home", page: "Home", icon: Home },
  { name: "Tours", page: "Tours", icon: MapPin },
  { name: "Flights", page: "Flights", icon: Plane },
  { name: "Bookings", page: "MyBookings", icon: BookOpen },
  { name: "Profile", page: "Profile", icon: User },
];

export default function BottomNavigation({ activeTab, onTabPress }) {
  const handleTabClick = (page) => {
    if (onTabPress) {
      onTabPress(page, page === activeTab);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 md:hidden" 
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.page;
          const Icon = item.icon;
          
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => handleTabClick(item.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users } from "lucide-react";

export default function LiveVisitorCounter() {
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState("");

  // Track current visitor on mount and page changes
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const page = window.location.pathname;
        setCurrentPage(page);
        await base44.functions.invoke('trackVisitor', { page });
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();

    // Send heartbeat every 2 minutes to keep session active
    const heartbeatInterval = setInterval(trackVisitor, 2 * 60 * 1000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Fetch live visitor count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await base44.functions.invoke('getLiveVisitors', {});
        setCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching live visitors:', error);
      }
    };

    // Fetch immediately
    fetchCount();

    // Update every 10 seconds
    const interval = setInterval(fetchCount, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
      <div className="relative">
        <Users className="w-4 h-4" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span>{count}</span>
      <span className="text-green-600">•</span>
      <span className="text-green-600">Live visitors</span>
    </div>
  );
}
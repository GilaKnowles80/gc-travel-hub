import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { Button } from "@/components/ui/button";
import { PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import BookingCard from "@/components/bookings/BookingCard";

const BOOKINGS_PER_PAGE = 8;

export default function MyBookings() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-flight-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-tour-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-hotel-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-ferry-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-bus-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-car-rental-bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-visa-bookings"] }),
    ]);
  };

  // Fetch all booking types
  const { data: flightBookings = [], isLoading: flightLoading, refetch: refetchFlights } = useQuery({
    queryKey: ["my-flight-bookings"],
    queryFn: () => base44.entities.FlightBooking.list("-created_date", 100),
  });

  const { data: tourBookings = [], isLoading: tourLoading } = useQuery({
    queryKey: ["my-tour-bookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 100),
  });

  const { data: hotelBookings = [], isLoading: hotelLoading, refetch: refetchHotels } = useQuery({
    queryKey: ["my-hotel-bookings"],
    queryFn: () => base44.entities.HotelBooking.list("-created_date", 100),
  });

  const { data: ferryBookings = [], isLoading: ferryLoading } = useQuery({
    queryKey: ["my-ferry-bookings"],
    queryFn: () => base44.entities.FerryBooking.list("-created_date", 100),
  });

  const { data: busBookings = [], isLoading: busLoading } = useQuery({
    queryKey: ["my-bus-bookings"],
    queryFn: () => base44.entities.BusBooking.list("-created_date", 100),
  });

  const { data: carRentalBookings = [], isLoading: carRentalLoading } = useQuery({
    queryKey: ["my-car-rental-bookings"],
    queryFn: () => base44.entities.CarRentalBooking.list("-created_date", 100),
  });

  const { data: visaBookings = [], isLoading: visaLoading } = useQuery({
    queryKey: ["my-visa-bookings"],
    queryFn: () => base44.entities.Visa.list("-created_date", 100),
  });

  // Combine all bookings with type info
  const allBookings = useMemo(() => {
    const combined = [
      ...flightBookings.map(b => ({ ...b, type: "flight" })),
      ...tourBookings.map(b => ({ ...b, type: "tour" })),
      ...hotelBookings.map(b => ({ ...b, type: "hotel" })),
      ...ferryBookings.map(b => ({ ...b, type: "ferry" })),
      ...busBookings.map(b => ({ ...b, type: "bus" })),
      ...carRentalBookings.map(b => ({ ...b, type: "car_rental" })),
      ...visaBookings.map(b => ({ ...b, type: "visa" })),
    ];
    return combined.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [flightBookings, tourBookings, hotelBookings, ferryBookings, busBookings, carRentalBookings, visaBookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (filterType === "all") return allBookings;
    return allBookings.filter(b => b.type === filterType);
  }, [allBookings, filterType]);

  // Paginate
  const totalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);

  const isLoading = flightLoading || tourLoading || hotelLoading || ferryLoading || busLoading || carRentalLoading || visaLoading;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-3 text-slate-400">Track and manage all your travel reservations</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Flights", value: "flight" },
            { label: "Tours", value: "tour" },
            { label: "Hotels", value: "hotel" },
            { label: "Ferry", value: "ferry" },
            { label: "Bus", value: "bus" },
            { label: "Visa", value: "visa" },
            { label: "Car Rental", value: "car_rental" },
          ].map(tab => (
            <Button
              key={tab.value}
              onClick={() => { setFilterType(tab.value); setCurrentPage(1); }}
              variant={filterType === tab.value ? "default" : "outline"}
              className={filterType === tab.value ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">
              {filterType === "all" ? "No bookings yet" : `No ${filterType} bookings`}
            </h3>
            <p className="text-slate-400 mt-2">Start exploring our amazing travel options!</p>
            <Link to={createPageUrl("Home")}>
              <button className="mt-6 text-amber-600 font-semibold hover:text-amber-700">
                Back to Home →
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {paginatedBookings.map((booking, i) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={i} 
                  type={booking.type}
                  onCancelled={() => {
                    refetchFlights();
                    refetchHotels();
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + BOOKINGS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-amber-500 hover:bg-amber-600" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </PullToRefresh>
  );
}
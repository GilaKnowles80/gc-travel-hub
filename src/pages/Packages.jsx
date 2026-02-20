import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Clock, Users, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";

export default function Packages() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const { data: packages = [] } = useQuery({
    queryKey: ["travel-packages"],
    queryFn: async () => {
      const all = await base44.entities.TravelPackage.list("-created_date");
      return all.filter((p) => p.status === "active");
    },
  });

  const filtered = packages.filter((pkg) => {
    if (filter === "all") return true;
    return pkg.category === filter;
  });

  const handleBookNow = async (pkg) => {
    try {
      const user = await base44.auth.me();
      
      // Create package booking
      const booking = await base44.entities.PackageBooking.create({
        user_email: user.email,
        package_name: pkg.package_name,
        total_price: pkg.price_per_person,
        final_price: pkg.price_per_person,
        status: "draft",
      });

      // Navigate to checkout
      navigate(createPageUrl("PackageBookingSuccess") + `?bookingId=${booking.id}`);
    } catch (error) {
      toast.error("Please log in to book");
      base44.auth.redirectToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Travel Packages</h1>
          <p className="text-xl text-white/90">Pre-designed packages for hassle-free travel</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "beach", "adventure", "cultural", "honeymoon", "family", "luxury", "budget"].map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              onClick={() => setFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {pkg.image_url && (
                <img
                  src={pkg.image_url}
                  alt={pkg.package_name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{pkg.package_name}</CardTitle>
                  {pkg.is_featured && <Badge variant="default">Featured</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{pkg.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{pkg.duration_days} Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Max {pkg.max_participants} people</span>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pkg.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      ₱{pkg.price_per_person?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">per person</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowDetails(true);
                      }}
                    >
                      Details
                    </Button>
                    <Button size="sm" onClick={() => handleBookNow(pkg)}>
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No packages available in this category</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Dialog */}
      {showDetails && selectedPackage && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPackage.package_name}</DialogTitle>
            </DialogHeader>

            {selectedPackage.image_url && (
              <img
                src={selectedPackage.image_url}
                alt={selectedPackage.package_name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Overview</h3>
                <p className="text-slate-600">{selectedPackage.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="font-semibold">{selectedPackage.duration_days} Days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Max Group</p>
                  <p className="font-semibold">{selectedPackage.max_participants} People</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Price</p>
                  <p className="font-semibold text-amber-600">
                    ₱{selectedPackage.price_per_person?.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedPackage.inclusions?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <ul className="space-y-2">
                    {selectedPackage.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPackage.exclusions?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Not Included</h3>
                  <ul className="space-y-2">
                    {selectedPackage.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600">
                        <X className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setShowDetails(false);
                  handleBookNow(selectedPackage);
                }}
              >
                Book This Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
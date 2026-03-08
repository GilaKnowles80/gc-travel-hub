import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Crown, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminMonetization() {
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const queryClient = useQueryClient();

  const { data: serviceFees = [] } = useQuery({
    queryKey: ["service-fees"],
    queryFn: () => base44.entities.ServiceFeeSettings.list(),
  });

  const { data: premiumMembers = [] } = useQuery({
    queryKey: ["premium-members"],
    queryFn: () => base44.entities.PremiumMembership.filter({ status: "active" }),
  });

  const { data: featuredListings = [] } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: () => base44.entities.FeaturedListing.list("-created_date"),
  });

  const saveFeeSettingMutation = useMutation({
    mutationFn: (data) => {
      if (selectedFee?.id) {
        return base44.entities.ServiceFeeSettings.update(selectedFee.id, data);
      }
      return base44.entities.ServiceFeeSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["service-fees"]);
      toast.success("Service fee setting saved");
      setShowFeeDialog(false);
      setSelectedFee(null);
    },
  });

  const handleSubmitFee = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveFeeSettingMutation.mutate({
      booking_type: formData.get("booking_type"),
      fee_type: formData.get("fee_type"),
      fee_value: parseFloat(formData.get("fee_value")),
      minimum_fee: parseFloat(formData.get("minimum_fee")) || 0,
      maximum_fee: parseFloat(formData.get("maximum_fee")) || null,
      premium_discount: parseFloat(formData.get("premium_discount")) || 50,
      is_active: true,
    });
  };

  const totalMonthlyRecurring = premiumMembers.reduce((sum, m) => {
    return sum + (m.plan_type === "monthly" ? m.plan_price : m.plan_price / 12);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Monetization Settings</h1>
          <p className="text-slate-600">Manage service fees, premium memberships, and featured listings</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <p className="text-sm text-slate-600">Monthly Recurring</p>
              </div>
              <p className="text-3xl font-bold">₱{totalMonthlyRecurring.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-amber-600" />
                <p className="text-sm text-slate-600">Premium Members</p>
              </div>
              <p className="text-3xl font-bold">{premiumMembers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-purple-600" />
                <p className="text-sm text-slate-600">Featured Listings</p>
              </div>
              <p className="text-3xl font-bold">{featuredListings.filter(f => f.status === "active").length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fees">
          <TabsList>
            <TabsTrigger value="fees">Service Fees</TabsTrigger>
            <TabsTrigger value="premium">Premium Members</TabsTrigger>
            <TabsTrigger value="featured">Featured Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Fee Settings</CardTitle>
                  <Button onClick={() => {
                    setSelectedFee(null);
                    setShowFeeDialog(true);
                  }}>
                    Add Fee Setting
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Booking Type</th>
                        <th className="text-left p-3">Fee Type</th>
                        <th className="text-right p-3">Fee Value</th>
                        <th className="text-right p-3">Min Fee</th>
                        <th className="text-right p-3">Premium Discount</th>
                        <th className="text-center p-3">Status</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceFees.map((fee) => (
                        <tr key={fee.id} className="border-b">
                          <td className="p-3 capitalize">{fee.booking_type}</td>
                          <td className="p-3 capitalize">{fee.fee_type}</td>
                          <td className="p-3 text-right">
                            {fee.fee_type === "percentage" ? `${fee.fee_value}%` : `₱${fee.fee_value}`}
                          </td>
                          <td className="p-3 text-right">₱{fee.minimum_fee}</td>
                          <td className="p-3 text-right">{fee.premium_discount}%</td>
                          <td className="p-3 text-center">
                            <Switch checked={fee.is_active} />
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFee(fee);
                                setShowFeeDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premium">
            <Card>
              <CardHeader>
                <CardTitle>Premium Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {premiumMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{member.user_email}</p>
                        <p className="text-sm text-slate-600 capitalize">{member.plan_type} plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ₱{member.total_savings?.toLocaleString() || 0} saved
                        </p>
                        <p className="text-sm text-slate-600">
                          Expires: {new Date(member.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <Card>
              <CardHeader>
                <CardTitle>Featured Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Placement</th>
                        <th className="text-right p-3">Price Paid</th>
                        <th className="text-right p-3">Impressions</th>
                        <th className="text-right p-3">Clicks</th>
                        <th className="text-right p-3">Bookings</th>
                        <th className="text-center p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featuredListings.map((listing) => (
                        <tr key={listing.id} className="border-b">
                          <td className="p-3 capitalize">{listing.entity_type}</td>
                          <td className="p-3 capitalize">{listing.placement.replace("_", " ")}</td>
                          <td className="p-3 text-right">₱{listing.price_paid?.toLocaleString()}</td>
                          <td className="p-3 text-right">{listing.impressions || 0}</td>
                          <td className="p-3 text-right">{listing.clicks || 0}</td>
                          <td className="p-3 text-right">{listing.bookings || 0}</td>
                          <td className="p-3 text-center capitalize">{listing.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fee Setting Dialog */}
      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFee ? "Edit" : "Add"} Service Fee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitFee} className="space-y-4">
            <div>
              <Label>Booking Type</Label>
              <Select name="booking_type" defaultValue={selectedFee?.booking_type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="cruise">Cruise</SelectItem>
                  <SelectItem value="ferry">Ferry</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="car">Car Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fee Type</Label>
              <Select name="fee_type" defaultValue={selectedFee?.fee_type || "percentage"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fee Value</Label>
              <Input
                name="fee_value"
                type="number"
                step="0.01"
                defaultValue={selectedFee?.fee_value}
                required
              />
            </div>
            <div>
              <Label>Minimum Fee (₱)</Label>
              <Input
                name="minimum_fee"
                type="number"
                step="0.01"
                defaultValue={selectedFee?.minimum_fee || 0}
              />
            </div>
            <div>
              <Label>Maximum Fee (₱)</Label>
              <Input
                name="maximum_fee"
                type="number"
                step="0.01"
                defaultValue={selectedFee?.maximum_fee}
              />
            </div>
            <div>
              <Label>Premium Member Discount (%)</Label>
              <Input
                name="premium_discount"
                type="number"
                step="1"
                defaultValue={selectedFee?.premium_discount || 50}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowFeeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
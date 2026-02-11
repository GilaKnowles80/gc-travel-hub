import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FlightBookingEditForm({ booking, onClose }) {
  const [formData, setFormData] = useState({
    passenger_name: booking.passenger_name || "",
    passenger_email: booking.passenger_email || "",
    passenger_phone: booking.passenger_phone || "",
    passport_number: booking.passport_number || "",
    date_of_birth: booking.date_of_birth || "",
    special_requests: booking.special_requests || "",
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.FlightBooking.update(booking.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-bookings"] });
      toast.success("Booking updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-slate-900 mb-3">Booking Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Flight:</span>
            <span className="font-medium">{booking.flight_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Route:</span>
            <span className="font-medium">{booking.route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Cabin Class:</span>
            <span className="font-medium capitalize">{booking.cabin_class?.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Passengers:</span>
            <span className="font-medium">{booking.number_of_passengers}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passenger-name">Full Name *</Label>
        <Input
          id="passenger-name"
          required
          value={formData.passenger_name}
          onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passenger-email">Email *</Label>
        <Input
          id="passenger-email"
          type="email"
          required
          value={formData.passenger_email}
          onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passenger-phone">Phone *</Label>
        <Input
          id="passenger-phone"
          required
          value={formData.passenger_phone}
          onChange={(e) => setFormData({ ...formData, passenger_phone: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passport-number">Passport Number</Label>
        <Input
          id="passport-number"
          value={formData.passport_number}
          onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-of-birth">Date of Birth</Label>
        <Input
          id="date-of-birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special-requests">Special Requests</Label>
        <Textarea
          id="special-requests"
          placeholder="Meal preferences, seat requests, accessibility needs..."
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          className="rounded-xl h-24"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
        <p className="font-medium mb-1">Note:</p>
        <p>You can only edit passenger information and special requests. Flight details, cabin class, and pricing cannot be modified. To change these, please cancel and create a new booking.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Booking"
          )}
        </Button>
      </div>
    </form>
  );
}
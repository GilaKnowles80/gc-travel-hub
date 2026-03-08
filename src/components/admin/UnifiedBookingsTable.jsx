import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Hotel, Ship, Bus, Car, Calendar, DollarSign, User, ExternalLink } from "lucide-react";
import BookingQuickCopy from "./BookingQuickCopy";
import moment from "moment";
import { toast } from "sonner";

export default function UnifiedBookingsTable() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [supplierRef, setSupplierRef] = React.useState("");
  const [newStatus, setNewStatus] = React.useState("");
  const [supplierUsed, setSupplierUsed] = React.useState("");
  const [priceNotes, setPriceNotes] = React.useState("");
  const [bookingRef, setBookingRef] = React.useState("");
  const [generatingRef, setGeneratingRef] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: flightBookings = [] } = useQuery({
    queryKey: ['admin-flight-bookings'],
    queryFn: () => base44.entities.FlightBooking.list('-created_date')
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ['admin-hotel-bookings'],
    queryFn: () => base44.entities.HotelBooking.list('-created_date')
  });

  const { data: ferryBookings = [] } = useQuery({
    queryKey: ['admin-ferry-bookings'],
    queryFn: () => base44.entities.FerryBooking.list('-created_date')
  });

  const { data: busBookings = [] } = useQuery({
    queryKey: ['admin-bus-bookings'],
    queryFn: () => base44.entities.BusBooking.list('-created_date')
  });

  const { data: carBookings = [] } = useQuery({
    queryKey: ['admin-car-bookings'],
    queryFn: () => base44.entities.CarRentalBooking.list('-created_date')
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ type, id, data }) => {
      const entity = {
        flight: 'FlightBooking',
        hotel: 'HotelBooking',
        ferry: 'FerryBooking',
        bus: 'BusBooking',
        car: 'CarRentalBooking'
      }[type];
      return base44.entities[entity].update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.type}-bookings`] });
      toast.success("Booking updated successfully");
      setSelectedBooking(null);
    }
  });

  const allBookings = [
    ...flightBookings.map(b => ({ ...b, type: 'flight', icon: Plane })),
    ...hotelBookings.map(b => ({ ...b, type: 'hotel', icon: Hotel })),
    ...ferryBookings.map(b => ({ ...b, type: 'ferry', icon: Ship })),
    ...busBookings.map(b => ({ ...b, type: 'bus', icon: Bus })),
    ...carBookings.map(b => ({ ...b, type: 'car', icon: Car }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const filteredBookings = activeTab === 'all' 
    ? allBookings 
    : allBookings.filter(b => b.type === activeTab);

  const pendingCount = allBookings.filter(b => b.status === 'pending').length;

  const generateBookingRef = async () => {
    if (!selectedBooking || selectedBooking.type !== 'flight') return;
    setGeneratingRef(true);
    try {
      const origin = selectedBooking.route?.split(/[→\-]/)[0]?.trim().split(' ').pop() || '';
      const destination = selectedBooking.route?.split(/[→\-]/)[1]?.trim().split(' ')[0] || '';
      const refRes = await base44.functions.invoke('generateFlightBookingRef', {
        origin,
        destination,
        trip_type: selectedBooking.trip_type || 'one_way',
      });
      const ref = refRes?.data?.booking_ref;
      if (ref) setBookingRef(ref);
    } catch (e) {
      console.error('Could not generate booking ref', e);
    }
    setGeneratingRef(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;
    
    const updateData = {
      status: newStatus,
      ...(supplierRef && { supplier_reference: supplierRef }),
      ...(supplierUsed && { supplier: supplierUsed }),
      ...(priceNotes && { price_comparison_notes: priceNotes }),
      ...(bookingRef && { booking_ref: bookingRef }),
    };

    updateBookingMutation.mutate({
      type: selectedBooking.type,
      id: selectedBooking.id,
      data: updateData
    });
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const PaymentBadge = ({ status }) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const SupplierBadge = ({ supplier }) => {
    if (!supplier) return null;
    const colors = {
      biyaheko: 'bg-blue-100 text-blue-800',
      wanderlinx: 'bg-purple-100 text-purple-800',
      tripzynx: 'bg-indigo-100 text-indigo-800',
      direct: 'bg-green-100 text-green-800'
    };
    return <Badge variant="outline" className={colors[supplier]}>{supplier}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <div className="font-semibold">⚡ Quick Workflow:</div>
          <div className="text-sm">
            1. Click "Quick Copy" → 2. Paste in supplier portal → 3. Update status with reference
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>
          <TabsTrigger value="flight">Flights</TabsTrigger>
          <TabsTrigger value="hotel">Hotels</TabsTrigger>
          <TabsTrigger value="ferry">Ferry</TabsTrigger>
          <TabsTrigger value="bus">Bus</TabsTrigger>
          <TabsTrigger value="car">Car Rental</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No bookings found
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const Icon = booking.icon;
              const customerName = booking.passenger_name || booking.guest_name || booking.driver_name;
              const customerEmail = booking.passenger_email || booking.guest_email || booking.driver_email;
              
              return (
                <Card key={`${booking.type}-${booking.id}`} className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className="w-5 h-5 text-slate-600" />
                        <span className="font-semibold text-slate-900">
                          {booking.route || booking.hotel_name || booking.car_type}
                        </span>
                        {booking.booking_ref && (
                          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{booking.booking_ref}</span>
                        )}
                        <StatusBadge status={booking.status} />
                        <SupplierBadge supplier={booking.supplier} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {customerName}
                        </span>
                        <span>{customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {moment(booking.created_date).format('MMM D, YYYY h:mm A')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.number_of_passengers || booking.number_of_guests || booking.number_of_travelers || 1} pax
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ₱{booking.total_price}
                        </span>
                        <PaymentBadge status={booking.payment_status} />
                      </div>
                      {booking.supplier_reference && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Supplier Ref:</span> {booking.supplier_reference}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-6 flex items-center justify-end gap-2">
                      <BookingQuickCopy booking={booking} type={booking.type} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setNewStatus(booking.status);
                          setSupplierRef(booking.supplier_reference || '');
                          setSupplierUsed(booking.supplier || '');
                          setPriceNotes(booking.price_comparison_notes || '');
                          setBookingRef(booking.booking_ref || '');
                        }}
                      >
                        Update Status
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open('https://biyaheko.ph', '_blank')}
                          className="text-xs"
                        >
                          Biyaheko
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open('https://mywanderlinx.com', '_blank')}
                          className="text-xs"
                        >
                          Wanderlinx
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open('https://tripzynx.com', '_blank')}
                          className="text-xs"
                        >
                          Tripzynx
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details & Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Booking Details Section */}
            {selectedBooking && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">📋 Booking Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                   ['Booking Ref', selectedBooking.booking_ref || '—'],
                   ['Booking ID', selectedBooking.id],
                   ['Type', selectedBooking.type?.toUpperCase()],
                    ['Route / Service', selectedBooking.route || selectedBooking.hotel_name || selectedBooking.car_type || '—'],
                    ['Flight Number', selectedBooking.flight_number || '—'],
                    ['Passenger / Guest', selectedBooking.passenger_name || selectedBooking.guest_name || selectedBooking.driver_name || '—'],
                    ['Email', selectedBooking.passenger_email || selectedBooking.guest_email || selectedBooking.driver_email || '—'],
                    ['Phone', selectedBooking.passenger_phone || selectedBooking.guest_phone || selectedBooking.driver_phone || '—'],
                    ['Passport No.', selectedBooking.passport_number || '—'],
                    ['Date of Birth', selectedBooking.date_of_birth || '—'],
                    ['Pax / Guests', selectedBooking.number_of_passengers || selectedBooking.number_of_guests || selectedBooking.number_of_travelers || 1],
                    ['Cabin Class', selectedBooking.cabin_class || selectedBooking.class_type || selectedBooking.seat_type || selectedBooking.accommodation_type || '—'],
                    ['Trip Type', selectedBooking.trip_type || '—'],
                    ['Check-in', selectedBooking.check_in_date || selectedBooking.departure_date || '—'],
                    ['Check-out / Return', selectedBooking.check_out_date || '—'],
                    ['Total Price', selectedBooking.total_price ? `₱${Number(selectedBooking.total_price).toLocaleString()}` : '—'],
                    ['Payment Status', selectedBooking.payment_status || '—'],
                    ['Status', selectedBooking.status || '—'],
                    ['Supplier', selectedBooking.supplier || '—'],
                    ['Supplier Reference', selectedBooking.supplier_reference || '—'],
                    ['Special Requests', selectedBooking.special_requests || '—'],
                    ['Notes', selectedBooking.price_comparison_notes || '—'],
                    ['Booked On', selectedBooking.created_date ? moment(selectedBooking.created_date).format('MMM D, YYYY h:mm A') : '—'],
                    ['Booked By', selectedBooking.created_by || '—'],
                  ].filter(([, v]) => v && v !== '—' || true).map(([label, value]) => (
                    <React.Fragment key={label}>
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className="text-slate-800 font-semibold break-all">{value}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            <hr />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <strong>Price Check Workflow:</strong> Check prices on all 3 suppliers → Choose best rate → Update booking
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Supplier Used</label>
                <Select value={supplierUsed} onValueChange={setSupplierUsed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biyaheko">Biyaheko.ph</SelectItem>
                    <SelectItem value="wanderlinx">Wanderlinx.com</SelectItem>
                    <SelectItem value="tripzynx">Tripzynx.com</SelectItem>
                    <SelectItem value="direct">Direct/Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Supplier Reference</label>
              <Input
                placeholder="e.g., BIYA-12345"
                value={supplierRef}
                onChange={(e) => setSupplierRef(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Price Comparison Notes</label>
              <Input
                placeholder="e.g., Biyaheko: ₱5,200 | Wanderlinx: ₱5,500 | Tripzynx: ₱5,350"
                value={priceNotes}
                onChange={(e) => setPriceNotes(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">Track which supplier quoted what price</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateStatus} className="flex-1">
                Update Booking
              </Button>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
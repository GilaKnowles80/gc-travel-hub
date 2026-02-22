import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Hotel, MapPin, Calendar, User, Phone, Mail, DollarSign, Search, Edit, Trash2, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ManageReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all bookings
  const { data: flightBookings = [], isLoading: loadingFlights } = useQuery({
    queryKey: ['admin-flight-bookings'],
    queryFn: () => base44.entities.FlightBooking.list('-created_date', 200)
  });

  const { data: hotelBookings = [], isLoading: loadingHotels } = useQuery({
    queryKey: ['admin-hotel-bookings'],
    queryFn: () => base44.entities.HotelBooking.list('-created_date', 200)
  });

  const { data: tourBookings = [], isLoading: loadingTours } = useQuery({
    queryKey: ['admin-tour-bookings'],
    queryFn: () => base44.entities.PackageBooking.list('-created_date', 200)
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ type, id, data }) => {
      if (type === 'flight') {
        return await base44.entities.FlightBooking.update(id, data);
      } else if (type === 'hotel') {
        return await base44.entities.HotelBooking.update(id, data);
      } else {
        return await base44.entities.PackageBooking.update(id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hotel-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-bookings'] });
      toast.success('Booking updated successfully');
      setEditDialogOpen(false);
    }
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      if (type === 'flight') {
        return await base44.entities.FlightBooking.delete(id);
      } else if (type === 'hotel') {
        return await base44.entities.HotelBooking.delete(id);
      } else {
        return await base44.entities.PackageBooking.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hotel-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-bookings'] });
      toast.success('Booking deleted successfully');
    }
  });

  // Filter bookings
  const filterBookings = (bookings, type) => {
    return bookings.filter(booking => {
      const matchesSearch = searchTerm === "" || 
        booking.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passenger_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadge = (status) => {
    const colors = {
      unpaid: "bg-red-100 text-red-800",
      partial: "bg-orange-100 text-orange-800",
      paid: "bg-green-100 text-green-800",
      refunded: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleEdit = (booking, type) => {
    setSelectedBooking({ ...booking, type });
    setEditDialogOpen(true);
  };

  const handleDelete = (id, type) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBookingMutation.mutate({ type, id });
    }
  };

  const handleStatusChange = (status) => {
    if (selectedBooking) {
      updateBookingMutation.mutate({
        type: selectedBooking.type,
        id: selectedBooking.id,
        data: { status }
      });
    }
  };

  const handlePaymentStatusChange = (payment_status) => {
    if (selectedBooking) {
      updateBookingMutation.mutate({
        type: selectedBooking.type,
        id: selectedBooking.id,
        data: { payment_status }
      });
    }
  };

  const BookingCard = ({ booking, type, icon: Icon }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Icon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {booking.passenger_name || booking.guest_name || booking.user_email}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {type === 'flight' ? booking.route : type === 'hotel' ? booking.hotel_name : booking.package_name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(booking, type)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(booking.id, type)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{booking.passenger_email || booking.guest_email || booking.user_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{booking.passenger_phone || booking.guest_phone || 'N/A'}</span>
          </div>
          {type === 'flight' && (
            <>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{booking.flight_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{booking.number_of_passengers} passengers</span>
              </div>
            </>
          )}
          {type === 'hotel' && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{booking.check_in_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{booking.check_out_date}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Badge className={getStatusBadge(booking.status)}>
              {booking.status}
            </Badge>
            <Badge className={getPaymentBadge(booking.payment_status)}>
              {booking.payment_status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-lg font-bold text-amber-600">
            <DollarSign className="w-5 h-5" />
            {booking.total_price?.toLocaleString()}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Supplier: {booking.supplier || 'N/A'} • Created: {new Date(booking.created_date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const filteredFlights = filterBookings(flightBookings, 'flight');
  const filteredHotels = filterBookings(hotelBookings, 'hotel');
  const filteredTours = filterBookings(tourBookings, 'tour');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Reservations</h1>
          <p className="text-gray-600">View and manage all flight, hotel, and tour bookings</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or flight number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="flights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Flights ({filteredFlights.length})
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Hotels ({filteredHotels.length})
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Tours ({filteredTours.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights">
            {loadingFlights ? (
              <div className="text-center py-12">Loading flights...</div>
            ) : filteredFlights.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No flight bookings found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFlights.map(booking => (
                  <BookingCard key={booking.id} booking={booking} type="flight" icon={Plane} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotels">
            {loadingHotels ? (
              <div className="text-center py-12">Loading hotels...</div>
            ) : filteredHotels.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No hotel bookings found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHotels.map(booking => (
                  <BookingCard key={booking.id} booking={booking} type="hotel" icon={Hotel} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tours">
            {loadingTours ? (
              <div className="text-center py-12">Loading tours...</div>
            ) : filteredTours.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No tour bookings found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTours.map(booking => (
                  <BookingCard key={booking.id} booking={booking} type="tour" icon={MapPin} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Booking Status</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Booking Status</Label>
                  <Select defaultValue={selectedBooking.status} onValueChange={handleStatusChange}>
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
                  <Label>Payment Status</Label>
                  <Select defaultValue={selectedBooking.payment_status} onValueChange={handlePaymentStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plane, Plus, Edit, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "react-hot-toast";

export default function AdminFlights() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    airline_name: "",
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    duration_hours: 0,
    aircraft_type: "",
    status: "active",
    is_direct: true,
    cabin_classes: [
      { class: "economy", price: 0, seats_available: 100 },
      { class: "business", price: 0, seats_available: 20 },
    ],
  });

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ["admin-flights"],
    queryFn: () => base44.entities.Flight.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Flight.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flights"] });
      toast.success("Flight created successfully");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Flight.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flights"] });
      toast.success("Flight updated successfully");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Flight.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flights"] });
      toast.success("Flight deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      airline_name: "",
      flight_number: "",
      origin: "",
      destination: "",
      departure_time: "",
      arrival_time: "",
      duration_hours: 0,
      aircraft_type: "",
      status: "active",
      is_direct: true,
      cabin_classes: [
        { class: "economy", price: 0, seats_available: 100 },
        { class: "business", price: 0, seats_available: 20 },
      ],
    });
    setEditingFlight(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setFormData({
      airline_name: flight.airline_name,
      flight_number: flight.flight_number,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      duration_hours: flight.duration_hours || 0,
      aircraft_type: flight.aircraft_type || "",
      status: flight.status || "active",
      is_direct: flight.is_direct ?? true,
      cabin_classes: flight.cabin_classes || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFlight) {
      updateMutation.mutate({ id: editingFlight.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredFlights = flights.filter(
    (flight) =>
      flight.airline_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              <Plane className="w-8 h-8 text-amber-500" />
              Manage Flights
            </h1>
            <p className="text-slate-600">{flights.length} total flights</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Flight
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search flights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Flights List */}
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {flight.airline_name} {flight.flight_number}
                      </h3>
                      <Badge variant={flight.status === "active" ? "default" : "outline"}>
                        {flight.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-2">
                      {flight.origin} → {flight.destination}
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>Departure: {moment(flight.departure_time).format("MMM D, h:mm A")}</span>
                      <span>Arrival: {moment(flight.arrival_time).format("MMM D, h:mm A")}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {flight.cabin_classes?.map((cabin, idx) => (
                        <Badge key={idx} variant="outline">
                          {cabin.class}: ${cabin.price}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(flight)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(flight.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFlight ? "Edit Flight" : "Add New Flight"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Airline Name *</Label>
                  <Input
                    required
                    value={formData.airline_name}
                    onChange={(e) => setFormData({ ...formData, airline_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flight Number *</Label>
                  <Input
                    required
                    value={formData.flight_number}
                    onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origin *</Label>
                  <Input
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destination *</Label>
                  <Input
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Time *</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival Time *</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aircraft Type</Label>
                  <Input
                    value={formData.aircraft_type}
                    onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold_out">Sold Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Economy Price *</Label>
                <Input
                  type="number"
                  required
                  value={formData.cabin_classes[0]?.price || 0}
                  onChange={(e) => {
                    const classes = [...formData.cabin_classes];
                    classes[0].price = parseFloat(e.target.value);
                    setFormData({ ...formData, cabin_classes: classes });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Business Price</Label>
                <Input
                  type="number"
                  value={formData.cabin_classes[1]?.price || 0}
                  onChange={(e) => {
                    const classes = [...formData.cabin_classes];
                    classes[1].price = parseFloat(e.target.value);
                    setFormData({ ...formData, cabin_classes: classes });
                  }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {editingFlight ? "Update" : "Create"} Flight
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
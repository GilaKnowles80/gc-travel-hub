import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBuses() {
  const [editingBus, setEditingBus] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ["admin-buses"],
    queryFn: () => base44.entities.BusBooking.list(),
    enabled: user?.role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingBus) {
        return base44.entities.BusBooking.update(editingBus.id, data);
      }
      return base44.entities.BusBooking.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-buses"]);
      setShowDialog(false);
      setEditingBus(null);
      toast.success(editingBus ? "Bus route updated" : "Bus route added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusBooking.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-buses"]);
      toast.success("Bus route deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      route: formData.get("route"),
      bus_company: formData.get("bus_company"),
      departure_date: formData.get("departure_date"),
      departure_time: formData.get("departure_time"),
      seat_type: formData.get("seat_type"),
      supplier: formData.get("supplier"),
      passenger_name: "Sample Passenger",
      passenger_email: "sample@example.com",
      status: "pending",
      payment_status: "unpaid",
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Bus Routes</h1>
            <p className="text-slate-500 mt-1">Add bus routes from suppliers</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBus(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Bus Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBus ? "Edit" : "Add"} Bus Route</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Route</Label>
                    <Input name="route" defaultValue={editingBus?.route} placeholder="Manila - Baguio" required />
                  </div>
                  <div>
                    <Label>Bus Company</Label>
                    <Input name="bus_company" defaultValue={editingBus?.bus_company} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Date</Label>
                    <Input name="departure_date" type="date" defaultValue={editingBus?.departure_date} required />
                  </div>
                  <div>
                    <Label>Departure Time</Label>
                    <Input name="departure_time" type="time" defaultValue={editingBus?.departure_time} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Seat Type</Label>
                    <Select name="seat_type" defaultValue={editingBus?.seat_type || "regular"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="sleeper">Sleeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Select name="supplier" defaultValue={editingBus?.supplier || "biyaheko"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="biyaheko">Biyaheko</SelectItem>
                        <SelectItem value="wanderlinx">Wanderlinx</SelectItem>
                        <SelectItem value="tripzynx">Tripzynx</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <Card key={bus.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bus className="w-5 h-5" />
                        {bus.route}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{bus.bus_company}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingBus(bus);
                          setShowDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(bus.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-500">Departure:</span> {bus.departure_date} at {bus.departure_time}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Seat Type:</span> {bus.seat_type}
                  </div>
                  <Badge variant="outline">{bus.supplier}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
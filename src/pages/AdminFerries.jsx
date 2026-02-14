import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ship, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminFerries() {
  const [editingFerry, setEditingFerry] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: ferries = [], isLoading } = useQuery({
    queryKey: ["admin-ferries"],
    queryFn: () => base44.entities.FerryBooking.list(),
    enabled: user?.role === "admin",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingFerry) {
        return base44.entities.FerryBooking.update(editingFerry.id, data);
      }
      return base44.entities.FerryBooking.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-ferries"]);
      setShowDialog(false);
      setEditingFerry(null);
      toast.success(editingFerry ? "Ferry updated" : "Ferry added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FerryBooking.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-ferries"]);
      toast.success("Ferry deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      route: formData.get("route"),
      ferry_company: formData.get("ferry_company"),
      departure_date: formData.get("departure_date"),
      departure_time: formData.get("departure_time"),
      accommodation_type: formData.get("accommodation_type"),
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
            <h1 className="text-3xl font-bold text-slate-900">Manage Ferry Routes</h1>
            <p className="text-slate-500 mt-1">Add ferry routes from suppliers</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFerry(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Ferry Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingFerry ? "Edit" : "Add"} Ferry Route</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Route</Label>
                    <Input name="route" defaultValue={editingFerry?.route} placeholder="Manila - Cebu" required />
                  </div>
                  <div>
                    <Label>Ferry Company</Label>
                    <Input name="ferry_company" defaultValue={editingFerry?.ferry_company} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Date</Label>
                    <Input name="departure_date" type="date" defaultValue={editingFerry?.departure_date} required />
                  </div>
                  <div>
                    <Label>Departure Time</Label>
                    <Input name="departure_time" type="time" defaultValue={editingFerry?.departure_time} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Accommodation Type</Label>
                    <Select name="accommodation_type" defaultValue={editingFerry?.accommodation_type || "economy"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="tourist_class">Tourist Class</SelectItem>
                        <SelectItem value="cabin">Cabin</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Select name="supplier" defaultValue={editingFerry?.supplier || "biyaheko"}>
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
            {ferries.map((ferry) => (
              <Card key={ferry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ship className="w-5 h-5" />
                        {ferry.route}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{ferry.ferry_company}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingFerry(ferry);
                          setShowDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(ferry.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-500">Departure:</span> {ferry.departure_date} at {ferry.departure_time}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Type:</span> {ferry.accommodation_type}
                  </div>
                  <Badge variant="outline">{ferry.supplier}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
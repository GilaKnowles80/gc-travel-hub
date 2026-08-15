import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Loader2, Plus, Trash2, Edit2, User, Calendar, Plane } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SavedTravelersTab({ user }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "MALE",
    email: "",
    phone: "",
    passport_number: "",
    passport_country: "",
    passport_expiry: "",
    nationality: ""
  });

  const { data: travelers, isLoading } = useQuery({
    queryKey: ["saved-travelers", user?.email],
    queryFn: async () => {
      const result = await base44.entities.SavedTraveler.filter({ user_email: user.email });
      return result || [];
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SavedTraveler.create({
        user_email: user.email,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-travelers"] });
      toast.success("Traveler saved successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save traveler");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SavedTraveler.update(editingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-travelers"] });
      toast.success("Traveler updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update traveler");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.SavedTraveler.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-travelers"] });
      toast.success("Traveler deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete traveler");
    }
  });

  const resetForm = () => {
    setFormData({
      label: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "MALE",
      email: "",
      phone: "",
      passport_number: "",
      passport_country: "",
      passport_expiry: "",
      nationality: ""
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (traveler) => {
    setFormData({
      label: traveler.label || "",
      first_name: traveler.first_name || "",
      last_name: traveler.last_name || "",
      date_of_birth: traveler.date_of_birth || "",
      gender: traveler.gender || "MALE",
      email: traveler.email || "",
      phone: traveler.phone || "",
      passport_number: traveler.passport_number || "",
      passport_country: traveler.passport_country || "",
      passport_expiry: traveler.passport_expiry || "",
      nationality: traveler.nationality || ""
    });
    setEditingId(traveler.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast.error("Please fill in first and last name");
      return;
    }

    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-500" />
            Saved Travelers
          </CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Traveler
          </Button>
        </CardHeader>
        <CardContent>
          {travelers && travelers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelers.map((traveler) => (
                <div key={traveler.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{traveler.label || `${traveler.first_name} ${traveler.last_name}`}</h3>
                      <p className="text-sm text-slate-600">{traveler.first_name} {traveler.last_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(traveler)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(traveler.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {traveler.date_of_birth && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {traveler.date_of_birth}
                      </div>
                    )}
                    {traveler.email && <p className="text-slate-600">{traveler.email}</p>}
                    {traveler.phone && <p className="text-slate-600">{traveler.phone}</p>}
                    {traveler.passport_number && <p className="text-slate-600">Passport: {traveler.passport_number}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No saved travelers yet</p>
              <p className="text-sm text-slate-500">Add travelers to streamline your flight bookings</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Traveler" : "Add New Traveler"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Label (e.g., Myself, Spouse)</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Myself"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <MobileSelect value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })} placeholder="Gender">
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </MobileSelect>
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Passport Number</Label>
              <Input
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Passport Country</Label>
                <Input
                  value={formData.passport_country}
                  onChange={(e) => setFormData({ ...formData, passport_country: e.target.value })}
                />
              </div>
              <div>
                <Label>Passport Expiry</Label>
                <Input
                  type="date"
                  value={formData.passport_expiry}
                  onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Nationality</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
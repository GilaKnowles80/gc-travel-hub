import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Loader2, Plus, Trash2, Edit2, User, Hotel } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SavedGuestsTab({ user }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    title: "MR",
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });

  const { data: guests, isLoading } = useQuery({
    queryKey: ["saved-guests", user?.email],
    queryFn: async () => {
      const result = await base44.entities.SavedGuest.filter({ user_email: user.email });
      return result || [];
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SavedGuest.create({
        user_email: user.email,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-guests"] });
      toast.success("Guest saved successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save guest");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.SavedGuest.update(editingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-guests"] });
      toast.success("Guest updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update guest");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.SavedGuest.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-guests"] });
      toast.success("Guest deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete guest");
    }
  });

  const resetForm = () => {
    setFormData({
      label: "",
      title: "MR",
      first_name: "",
      last_name: "",
      email: "",
      phone: ""
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (guest) => {
    setFormData({
      label: guest.label || "",
      title: guest.title || "MR",
      first_name: guest.first_name || "",
      last_name: guest.last_name || "",
      email: guest.email || "",
      phone: guest.phone || ""
    });
    setEditingId(guest.id);
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
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-blue-500" />
            Saved Guests
          </CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </CardHeader>
        <CardContent>
          {guests && guests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guests.map((guest) => (
                <div key={guest.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{guest.label || `${guest.title} ${guest.first_name} ${guest.last_name}`}</h3>
                      <p className="text-sm text-slate-600">{guest.title} {guest.first_name} {guest.last_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(guest)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(guest.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {guest.email && <p className="text-slate-600">{guest.email}</p>}
                    {guest.phone && <p className="text-slate-600">{guest.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No saved guests yet</p>
              <p className="text-sm text-slate-500">Add guests to streamline your hotel bookings</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Guest" : "Add New Guest"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Label (e.g., Myself, Family)</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Myself"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Title</Label>
                <MobileSelect value={formData.title} onValueChange={(v) => setFormData({ ...formData, title: v })} placeholder="Title">
                  <Select value={formData.title} onValueChange={(v) => setFormData({ ...formData, title: v })}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MR">Mr.</SelectItem>
                      <SelectItem value="MRS">Mrs.</SelectItem>
                      <SelectItem value="MS">Ms.</SelectItem>
                    </SelectContent>
                  </Select>
                </MobileSelect>
              </div>
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

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
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
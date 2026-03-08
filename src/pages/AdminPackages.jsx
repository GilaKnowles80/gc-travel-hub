import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminPackages() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const queryClient = useQueryClient();

  const { data: packages = [] } = useQuery({
    queryKey: ["travel-packages"],
    queryFn: () => base44.entities.TravelPackage.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TravelPackage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["travel-packages"]);
      toast.success("Package deleted");
    },
  });

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setShowDialog(true);
  };

  const handleNew = () => {
    setSelectedPackage(null);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Travel Packages</h1>
            <p className="text-slate-600 mt-1">Create and manage pre-defined packages</p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Package
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              {pkg.image_url && (
                <img
                  src={pkg.image_url}
                  alt={pkg.package_name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                  <Badge variant={pkg.status === "active" ? "default" : "secondary"}>
                    {pkg.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-2">{pkg.destination}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">{pkg.duration_days} days</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ₱{pkg.price_per_person?.toLocaleString()}
                    <span className="text-sm font-normal text-slate-600">/person</span>
                  </p>
                  <p className="text-xs text-slate-500">{pkg.bookings_count || 0} bookings</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)} className="flex-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this package?")) {
                        deleteMutation.mutate(pkg.id);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No packages yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showDialog && (
        <PackageFormDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          package={selectedPackage}
        />
      )}
    </div>
  );
}

function PackageFormDialog({ open, onClose, package: pkg }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    package_name: pkg?.package_name || "",
    description: pkg?.description || "",
    destination: pkg?.destination || "",
    duration_days: pkg?.duration_days || 3,
    image_url: pkg?.image_url || "",
    price_per_person: pkg?.price_per_person || 0,
    max_participants: pkg?.max_participants || 20,
    category: pkg?.category || "beach",
    status: pkg?.status || "draft",
    inclusions: pkg?.inclusions || [],
    exclusions: pkg?.exclusions || [],
    is_featured: pkg?.is_featured || false,
  });

  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (pkg) {
        return await base44.entities.TravelPackage.update(pkg.id, formData);
      } else {
        return await base44.entities.TravelPackage.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["travel-packages"]);
      toast.success(pkg ? "Package updated" : "Package created");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, inclusionInput.trim()],
      });
      setInclusionInput("");
    }
  };

  const addExclusion = () => {
    if (exclusionInput.trim()) {
      setFormData({
        ...formData,
        exclusions: [...formData.exclusions, exclusionInput.trim()],
      });
      setExclusionInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "New Package"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Package Name *</Label>
              <Input
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                placeholder="Tokyo Cherry Blossom Tour"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Experience the beauty of..."
                rows={3}
              />
            </div>

            <div>
              <Label>Destination *</Label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Tokyo, Japan"
              />
            </div>

            <div>
              <Label>Duration (Days) *</Label>
              <Input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>

            <div>
              <Label>Price Per Person (PHP) *</Label>
              <Input
                type="number"
                value={formData.price_per_person}
                onChange={(e) => setFormData({ ...formData, price_per_person: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div>
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="beach">Beach</option>
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="honeymoon">Honeymoon</option>
                <option value="family">Family</option>
                <option value="luxury">Luxury</option>
                <option value="budget">Budget</option>
              </select>
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                Featured Package (Show on homepage)
              </Label>
            </div>

            <div className="col-span-2">
              <Label>Inclusions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={inclusionInput}
                  onChange={(e) => setInclusionInput(e.target.value)}
                  placeholder="Add inclusion"
                  onKeyPress={(e) => e.key === "Enter" && addInclusion()}
                />
                <Button type="button" onClick={addInclusion}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.inclusions.map((item, i) => (
                  <Badge key={i} variant="secondary">
                    {item}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          inclusions: formData.inclusions.filter((_, idx) => idx !== i),
                        })
                      }
                      className="ml-2 text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Exclusions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={exclusionInput}
                  onChange={(e) => setExclusionInput(e.target.value)}
                  placeholder="Add exclusion"
                  onKeyPress={(e) => e.key === "Enter" && addExclusion()}
                />
                <Button type="button" onClick={addExclusion}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.exclusions.map((item, i) => (
                  <Badge key={i} variant="secondary">
                    {item}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          exclusions: formData.exclusions.filter((_, idx) => idx !== i),
                        })
                      }
                      className="ml-2 text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Package"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User, Mail, Phone, Calendar, CreditCard, Globe, Camera } from "lucide-react";
import { toast } from "sonner";

export default function PersonalInfoTab({ user }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
    date_of_birth: user.date_of_birth || "",
    passport_number: user.passport_number || "",
    nationality: user.nationality || "",
    profile_picture: user.profile_picture || "",
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => await base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture: file_url });
      await base44.auth.updateMe({ profile_picture: file_url });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {formData.profile_picture ? (
              <img
                src={formData.profile_picture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-100 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-4 border-amber-100 shadow-lg">
                <User className="w-16 h-16 text-amber-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-colors">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {uploading && (
            <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 rounded-xl bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport_number">Passport Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="passport_number"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 rounded-xl"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
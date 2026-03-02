import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function KYCVerification({ user, currentKyc }) {
  const [formData, setFormData] = useState({
    identity_type: currentKyc?.identity_type || "national_id",
    identity_number: currentKyc?.identity_number || "",
    full_name: currentKyc?.full_name || "",
    date_of_birth: currentKyc?.date_of_birth || "",
    nationality: currentKyc?.nationality || "Philippine",
    phone_number: currentKyc?.phone_number || "",
    address: currentKyc?.address || "",
    city: currentKyc?.city || "",
    postal_code: currentKyc?.postal_code || "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      if (currentKyc?.id) {
        return await base44.entities.WalletKYC.update(currentKyc.id, data);
      }
      return await base44.entities.WalletKYC.create({ ...data, user_email: user.email });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (currentKyc?.kyc_status === "verified") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">KYC Verified</h3>
        <p className="text-green-800 mb-4">Your identity has been verified. All features unlocked!</p>
        <div className="bg-green-100 rounded-lg p-4 text-left space-y-2 mb-4">
          <p className="text-sm"><strong>Name:</strong> {currentKyc.full_name}</p>
          <p className="text-sm"><strong>ID Type:</strong> {currentKyc.identity_type}</p>
          <p className="text-sm"><strong>Verified:</strong> {new Date(currentKyc.verification_date).toLocaleDateString()}</p>
          <p className="text-sm"><strong>Expires:</strong> {currentKyc.expiry_date}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon(currentKyc?.kyc_status)}
        <div>
          <h3 className="font-bold">
            {currentKyc?.kyc_status === "pending" ? "KYC Under Review" : "Complete KYC Verification"}
          </h3>
          <p className="text-sm text-slate-600">Required for higher transaction limits</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Identity Type</label>
            <Select value={formData.identity_type} onValueChange={(val) => setFormData({...formData, identity_type: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="tin">TIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">ID Number</label>
            <Input
              value={formData.identity_number}
              onChange={(e) => setFormData({...formData, identity_number: e.target.value})}
              placeholder="XX-XXXX-XXX-X"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              placeholder="+63 9XX XXXX XXX"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nationality</label>
            <Input
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Manila"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
              placeholder="1000"
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            📸 You'll need to upload ID documents and a selfie after submitting this form. Verification takes 1-2 hours.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={submitMutation.isPending}
          className="w-full"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
        </Button>
      </form>
    </Card>
  );
}
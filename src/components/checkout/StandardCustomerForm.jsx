import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * StandardCustomerForm - Reusable customer information form for all booking types
 */
export default function StandardCustomerForm({ bookingType, onDataChange }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    passport: "",
  });
  const [errors, setErrors] = useState({});
  const [autoFilled, setAutoFilled] = useState(false);

  // Auto-fill from logged-in user
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user && !autoFilled) {
        const filled = {
          name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          country: user.country || "Philippines",
          passport: user.passport_number || "",
        };
        setFormData(filled);
        onDataChange(filled);
        if (user.full_name || user.email) setAutoFilled(true);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    onDataChange({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    
    // Passport required for flights/visas
    if (["flight", "visa"].includes(bookingType) && !formData.passport.trim()) {
      newErrors.passport = "Passport number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form className="space-y-4">
      {/* Full Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
          Full Name *
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name}
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email Address *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </div>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
          Phone Number *
        </Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+63 915 123 4567"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.phone}
          </div>
        )}
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country" className="text-sm font-medium text-slate-700">
          Country *
        </Label>
        <Input
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Philippines"
          className={errors.country ? "border-red-500" : ""}
        />
        {errors.country && (
          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.country}
          </div>
        )}
      </div>

      {/* Passport (for flights/visas) */}
      {["flight", "visa"].includes(bookingType) && (
        <div>
          <Label htmlFor="passport" className="text-sm font-medium text-slate-700">
            Passport Number *
          </Label>
          <Input
            id="passport"
            name="passport"
            value={formData.passport}
            onChange={handleChange}
            placeholder="A12345678"
            className={errors.passport ? "border-red-500" : ""}
          />
          {errors.passport && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.passport}
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        onClick={validateForm}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-6"
      >
        Validate Information
      </Button>
    </form>
  );
}
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "general", label: "General Inquiries", email: "info@gctravelandtours.com" },
  { value: "tour", label: "Tour Packages", email: "tour@gctravelandtours.com" },
  { value: "flights", label: "Flights", email: "flights@gctravelandtours.com" },
  { value: "visa", label: "Visa", email: "visa@gctravelandtours.com" },
  { value: "bus", label: "Bus", email: "bus@gctravelandtours.com" },
  { value: "car_rental", label: "Car Rentals", email: "car@gctravelandtours.com" },
  { value: "ferry", label: "Ferry", email: "ferry@gctravelandtours.com" },
  { value: "hotel", label: "Hotels", email: "hotel@gctravelandtours.com" },
  { value: "travel_insurance", label: "Travel Insurance", email: "insurance@gctravelandtours.com" },
  { value: "refund", label: "Refund", email: "refund@gctravelandtours.com" },
  { value: "dispute", label: "Dispute", email: "dispute@gctravelandtours.com" },
  { value: "complaint", label: "Complaint", email: "complaint@gctravelandtours.com" }
];

export default function HelpdeskForm() {
  const [formData, setFormData] = useState({
    category: "general",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    booking_reference: ""
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.HelpdeskTicket.create(data);
    },
    onSuccess: () => {
      toast.success("Ticket submitted successfully! We'll respond within 24 hours.");
      setFormData({
        category: "general",
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        booking_reference: ""
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit ticket");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(formData);
  };

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category);

  return (
    <Card className="rounded-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          Submit a Helpdesk Ticket
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Get in touch with our support team. We'll respond within 24 hours.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-9 rounded-lg border border-input px-3 mt-1.5 text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {selectedCategory && (
              <p className="text-xs text-slate-500 mt-1">
                📧 This will be routed to: {selectedCategory.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 9XX XXXX XXX"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="booking_reference">Booking Reference (Optional)</Label>
              <Input
                id="booking_reference"
                value={formData.booking_reference}
                onChange={(e) => setFormData({ ...formData, booking_reference: e.target.value })}
                placeholder="Your booking ID"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your inquiry"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please provide details about your inquiry..."
              className="mt-1.5 min-h-32 resize-none rounded-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 rounded-lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
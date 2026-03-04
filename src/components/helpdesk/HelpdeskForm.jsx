import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, MessageSquare, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRecaptcha } from "@/components/security/RecaptchaProvider";
import { HoneypotField } from "@/components/security/HoneypotField";
import EmailVerificationDialog from "@/components/security/EmailVerificationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "general",          label: "General Inquiries",  email: "info@gctravelandtours.com" },
  { value: "tour",             label: "Tour Packages",       email: "info@gctravelandtours.com" },
  { value: "hotel",            label: "Hotels",              email: "info@gctravelandtours.com" },
  { value: "travel_insurance", label: "Travel Insurance",    email: "info@gctravelandtours.com" },
  { value: "flights",          label: "Flights",             email: "sales@gctravelandtours.com" },
  { value: "bus",              label: "Bus",                 email: "sales@gctravelandtours.com" },
  { value: "ferry",            label: "Ferry",               email: "sales@gctravelandtours.com" },
  { value: "car_rental",       label: "Car Rentals",         email: "sales@gctravelandtours.com" },
  { value: "cruise",           label: "Cruise",              email: "sales@gctravelandtours.com" },
  { value: "train",            label: "Train",               email: "sales@gctravelandtours.com" },
  { value: "visa",             label: "Visa Processing",     email: "helpdesk@gctravelandtours.com" },
  { value: "refund",           label: "Refund",              email: "helpdesk@gctravelandtours.com" },
  { value: "dispute",          label: "Dispute",             email: "helpdesk@gctravelandtours.com" },
  { value: "complaint",        label: "Complaint",           email: "helpdesk@gctravelandtours.com" },
];

export default function HelpdeskForm() {
  const { executeRecaptcha } = useRecaptcha();
  const [honeypot, setHoneypot] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);
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
      const ticket = await base44.entities.HelpdeskTicket.create(data);
      // Send emails to department and customer
      await base44.functions.invoke('sendHelpdeskEmail', { ticket_id: ticket.id });
      return ticket;
    },
    onSuccess: (data) => {
      toast.success(`Ticket #${data.id} submitted! Check your email for confirmation.`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      toast.error("Spam detected");
      return;
    }

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Execute reCAPTCHA
    const recaptchaToken = await executeRecaptcha('helpdesk_submit');
    if (!recaptchaToken) {
      toast.error("Security verification failed. Please try again.");
      return;
    }

    // Verify reCAPTCHA with backend
    try {
      const { data: verification } = await base44.functions.invoke('verifyRecaptcha', { 
        token: recaptchaToken 
      });
      
      if (!verification.success) {
        toast.error("Security check failed. Please try again later.");
        return;
      }
    } catch (error) {
      toast.error("Security verification error");
      return;
    }

    // Store ticket data and show email verification
    setPendingTicket(formData);
    setShowVerification(true);
  };

  const handleVerified = () => {
    mutation.mutate(pendingTicket);
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
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="w-4 h-4 text-green-600" />
          <p className="text-xs text-green-700">Protected by anti-spam & email verification</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <EmailVerificationDialog
          open={showVerification}
          onOpenChange={setShowVerification}
          email={formData.email}
          onVerified={handleVerified}
          type="helpdesk"
        />
      </CardContent>
    </Card>
  );
}
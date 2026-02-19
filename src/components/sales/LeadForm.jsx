import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function LeadForm({ open, onClose, lead, salesPerson }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: lead?.full_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    country: lead?.country || "",
    lead_source: lead?.lead_source || "website",
    interested_in: lead?.interested_in || [],
    destination: lead?.destination || "",
    travel_dates: lead?.travel_dates || "",
    budget: lead?.budget || "",
    group_size: lead?.group_size || 1,
    status: lead?.status || "new",
    priority: lead?.priority || "medium",
    notes: lead?.notes || "",
    assigned_to: lead?.assigned_to || salesPerson?.email || "",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (lead) {
        return await base44.entities.Lead.update(lead.id, formData);
      } else {
        return await base44.entities.Lead.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      toast.success(lead ? "Lead updated" : "Lead created");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save lead");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Full Name *</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+63 912 345 6789"
            />
          </div>

          <div>
            <Label>Country</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Philippines"
            />
          </div>

          <div>
            <Label>Lead Source *</Label>
            <Select value={formData.lead_source} onValueChange={(v) => setFormData({ ...formData, lead_source: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="phone_inquiry">Phone Inquiry</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Destination</Label>
            <Input
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Japan"
            />
          </div>

          <div>
            <Label>Travel Dates</Label>
            <Input
              value={formData.travel_dates}
              onChange={(e) => setFormData({ ...formData, travel_dates: e.target.value })}
              placeholder="Dec 2026"
            />
          </div>

          <div>
            <Label>Budget (PHP)</Label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              placeholder="50000"
            />
          </div>

          <div>
            <Label>Group Size</Label>
            <Input
              type="number"
              value={formData.group_size}
              onChange={(e) => setFormData({ ...formData, group_size: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="unresponsive">Unresponsive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
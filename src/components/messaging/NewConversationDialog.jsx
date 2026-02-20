import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewConversationDialog({ open, onClose, onSuccess }) {
  const [subject, setSubject] = useState("");
  const [leadId, setLeadId] = useState("");
  const [bookingId, setBookingId] = useState("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const conversation = await base44.entities.Conversation.create({
        customer_email: user.email,
        subject: subject.trim(),
        status: "open",
        related_lead_id: leadId || null,
        related_booking_id: bookingId || null,
        last_message_at: new Date().toISOString(),
        unread_customer: 0,
        unread_agent: 0,
      });

      return conversation;
    },
    onSuccess: (conversation) => {
      toast.success("Conversation created");
      setSubject("");
      setLeadId("");
      setBookingId("");
      onSuccess(conversation);
    },
    onError: (error) => {
      toast.error("Failed to create conversation");
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Subject *</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>

          <div>
            <Label>Related Lead ID (Optional)</Label>
            <Input
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              placeholder="Lead ID if applicable"
            />
          </div>

          <div>
            <Label>Related Booking ID (Optional)</Label>
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Booking ID if applicable"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!subject.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Start Conversation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
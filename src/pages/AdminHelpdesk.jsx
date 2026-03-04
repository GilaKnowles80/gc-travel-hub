import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Mail, MessageSquare, AlertCircle, CheckCircle, Clock, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = {
  general:          { label: "General Inquiries", email: "info@gctravelandtours.com",     color: "bg-blue-100 text-blue-700" },
  tour:             { label: "Tour Packages",      email: "info@gctravelandtours.com",     color: "bg-green-100 text-green-700" },
  hotel:            { label: "Hotels",             email: "info@gctravelandtours.com",     color: "bg-pink-100 text-pink-700" },
  travel_insurance: { label: "Travel Insurance",   email: "info@gctravelandtours.com",     color: "bg-indigo-100 text-indigo-700" },
  flights:          { label: "Flights",            email: "sales@gctravelandtours.com",    color: "bg-sky-100 text-sky-700" },
  bus:              { label: "Bus",                email: "sales@gctravelandtours.com",    color: "bg-yellow-100 text-yellow-700" },
  ferry:            { label: "Ferry",              email: "sales@gctravelandtours.com",    color: "bg-cyan-100 text-cyan-700" },
  car_rental:       { label: "Car Rentals",        email: "sales@gctravelandtours.com",    color: "bg-orange-100 text-orange-700" },
  cruise:           { label: "Cruise",             email: "sales@gctravelandtours.com",    color: "bg-teal-100 text-teal-700" },
  train:            { label: "Train",              email: "sales@gctravelandtours.com",    color: "bg-lime-100 text-lime-700" },
  visa:             { label: "Visa Processing",    email: "helpdesk@gctravelandtours.com", color: "bg-purple-100 text-purple-700" },
  refund:           { label: "Refund",             email: "helpdesk@gctravelandtours.com", color: "bg-red-100 text-red-700" },
  dispute:          { label: "Dispute",            email: "helpdesk@gctravelandtours.com", color: "bg-rose-100 text-rose-700" },
  complaint:        { label: "Complaint",          email: "helpdesk@gctravelandtours.com", color: "bg-amber-100 text-amber-700" },
};

const STATUS_COLORS = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-800"
};

const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700"
};

export default function AdminHelpdesk() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me()
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["helpdesk-tickets"],
    queryFn: async () => {
      const result = await base44.entities.HelpdeskTicket.list('-created_date', 100);
      return result || [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.HelpdeskTicket.update(selectedTicket.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      toast.success("Ticket updated successfully");
      setIsDetailDialogOpen(false);
      setSelectedTicket(null);
      setInternalNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ticket");
    }
  });

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesCategory = filterCategory === "all" || ticket.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setInternalNotes(ticket.internal_notes || "");
    setIsDetailDialogOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({
      status: newStatus,
      assigned_to: user?.email || selectedTicket.assigned_to,
      resolved_date: newStatus === "resolved" ? new Date().toISOString().split('T')[0] : selectedTicket.resolved_date
    });
  };

  const handlePriorityChange = (newPriority) => {
    updateMutation.mutate({
      priority: newPriority,
      assigned_to: user?.email || selectedTicket.assigned_to
    });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({
      ...selectedTicket,
      internal_notes: internalNotes,
      assigned_to: user?.email || selectedTicket.assigned_to
    });
  };

  const [replyMessage, setReplyMessage] = useState("");
  const [syncingGmail, setSyncingGmail] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('replyToCustomerEmail', {
        ticket_id: selectedTicket.id,
        reply_message: replyMessage,
        admin_name: user?.full_name || ''
      });
    },
    onSuccess: () => {
      toast.success(`Reply sent to ${selectedTicket.email}`);
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    },
    onError: (error) => toast.error(error.message || "Failed to send reply")
  });

  const handleSyncGmail = async () => {
    setSyncingGmail(true);
    try {
      const { data } = await base44.functions.invoke('syncGmailToHelpdesk');
      toast.success(`Synced ${data.synced} new email(s) from GC Travel inboxes`);
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    } catch (e) {
      toast.error("Gmail sync failed");
    } finally {
      setSyncingGmail(false);
    }
  };

  const openCount = tickets?.filter(t => t.status === "open").length || 0;
  const inProgressCount = tickets?.filter(t => t.status === "in_progress").length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Helpdesk</h1>
          <p className="text-slate-600 mt-2">Manage customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{tickets?.length || 0}</div>
              <p className="text-sm text-slate-600 mt-1">Total Tickets</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-700">{openCount}</div>
              <p className="text-sm text-yellow-600 mt-1">Open</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-700">{inProgressCount}</div>
              <p className="text-sm text-blue-600 mt-1">In Progress</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{tickets?.filter(t => t.status === "resolved").length || 0}</div>
              <p className="text-sm text-slate-600 mt-1">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Search</Label>
                <Input
                  placeholder="Search by name, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2 rounded-lg"
                />
              </div>
              <div>
                <Label className="text-sm">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card className="rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTickets.length > 0 ? (
              <div className="space-y-3 overflow-x-auto">
                {filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket)}
                    className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${CATEGORIES[ticket.category]?.color}`}>
                            {CATEGORIES[ticket.category]?.label}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[ticket.status]}`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${PRIORITY_COLORS[ticket.priority]}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mt-2 truncate">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <span>{ticket.name}</span>
                          <span>{ticket.email}</span>
                          {ticket.booking_reference && <span className="text-slate-500">Ref: {ticket.booking_reference}</span>}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {format(new Date(ticket.created_date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No tickets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      {selectedTicket && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTicket.subject}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <Label className="text-xs text-slate-500">Category</Label>
                  <p className="font-semibold mt-1">{CATEGORIES[selectedTicket.category]?.label}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">From</Label>
                  <p className="font-semibold mt-1">{selectedTicket.name}</p>
                  <p className="text-sm text-slate-600">{selectedTicket.email}</p>
                </div>
                {selectedTicket.phone && (
                  <div>
                    <Label className="text-xs text-slate-500">Phone</Label>
                    <p className="font-semibold mt-1">{selectedTicket.phone}</p>
                  </div>
                )}
                {selectedTicket.booking_reference && (
                  <div>
                    <Label className="text-xs text-slate-500">Booking Reference</Label>
                    <p className="font-semibold mt-1">{selectedTicket.booking_reference}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <Label className="text-xs text-slate-500">Message</Label>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Status</Label>
                  <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Priority</Label>
                  <Select value={selectedTicket.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="mt-1 h-8">
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
              </div>

              {/* Internal Notes */}
              <div>
                <Label className="text-xs text-slate-500">Internal Notes</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes for your team..."
                  className="mt-2 min-h-20 resize-none rounded-lg text-sm"
                />
              </div>

              {/* Action Info */}
              <div className="text-xs text-slate-500 space-y-1 pt-2 border-t">
                <p>Created: {format(new Date(selectedTicket.created_date), "PPpp")}</p>
                {selectedTicket.assigned_to && <p>Assigned to: {selectedTicket.assigned_to}</p>}
                {selectedTicket.resolved_date && <p>Resolved: {selectedTicket.resolved_date}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleSaveNotes}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
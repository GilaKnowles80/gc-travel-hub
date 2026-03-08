import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, MessageSquare, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export default function UnifiedSupportCenter() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await base44.auth.me()
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["unified-support"],
    queryFn: async () => {
      try {
        const [helpdeskTickets, leads] = await Promise.all([
          base44.entities.HelpdeskTicket.list('-created_date', 200),
          base44.entities.Lead.list('-created_date', 200).catch(() => [])
        ]);
        
        // Combine and normalize data
        const normalized = [
          ...(helpdeskTickets || []).map(t => ({
            ...t,
            type: 'helpdesk',
            inquiryEmail: t.email,
            inquiryName: t.name,
            inquiryMessage: t.message || t.subject,
            inquirySubject: t.subject
          })),
          ...(leads || []).map(l => ({
            ...l,
            type: 'lead',
            id: l.id,
            inquiryEmail: l.email,
            inquiryName: l.full_name,
            inquiryMessage: l.message || l.notes || '',
            inquirySubject: l.travel_type || 'Travel Inquiry',
            status: l.status || 'open',
            priority: l.priority || 'medium'
          }))
        ];
        
        return normalized.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      } catch (e) {
        console.error('Error fetching inquiries:', e);
        return [];
      }
    },
    refetchInterval: 30000
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedMessage.type === 'lead') {
        return await base44.entities.Lead.update(selectedMessage.id, data);
      }
      return await base44.entities.HelpdeskTicket.update(selectedMessage.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-support"] });
      toast.success("Inquiry updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update")
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('replyToCustomerEmail', {
        ticket_id: selectedMessage.id,
        reply_message: replyText,
        admin_name: user?.full_name || 'Support Team'
      });
    },
    onSuccess: () => {
      toast.success("Reply sent!");
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["unified-support"] });
    },
    onError: (error) => toast.error(error.message || "Failed to send reply")
  });

  const filteredMessages = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.inquirySubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.inquiryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.inquiryEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const unresolvedCount = tickets.filter(t => t.status === "in_progress").length;

  const handleQuickReply = (status = "in_progress") => {
    if (!replyText.trim()) {
      toast.error("Please write a reply");
      return;
    }
    updateMutation.mutate({
      status,
      assigned_to: user?.email || selectedMessage.assigned_to,
      internal_notes: internalNotes,
      resolved_date: status === "resolved" ? new Date().toISOString().split('T')[0] : undefined
    });
    replyMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{tickets.length}</div>
            <p className="text-sm text-slate-600 mt-1">Total Messages</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-700">{openCount}</div>
            <p className="text-sm text-yellow-600 mt-1">New</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-700">{unresolvedCount}</div>
            <p className="text-sm text-blue-600 mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-700">{tickets.filter(t => t.status === "resolved").length}</div>
            <p className="text-sm text-green-600 mt-1">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-64"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            All Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length > 0 ? (
            <div className="space-y-3">
              {filteredMessages.map(ticket => (
                <div
                  key={`${ticket.type}-${ticket.id}`}
                  onClick={() => {
                    setSelectedMessage(ticket);
                    setReplyText("");
                    setInternalNotes(ticket.internal_notes || ticket.notes || "");
                    setIsDetailOpen(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-amber-50/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                          {ticket.type === 'lead' ? '🎯 Lead' : '📧 Support'}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${PRIORITY_COLORS[ticket.priority || 'medium']}`}>
                          {ticket.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{ticket.inquirySubject}</h3>
                      <p className="text-sm text-slate-600 mt-1">{ticket.inquiryName} • {ticket.inquiryEmail}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.inquiryMessage}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500 flex-shrink-0">
                      {format(new Date(ticket.created_date), "MMM d")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedMessage && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">From</p>
                    <p className="font-semibold">{selectedMessage.inquiryName}</p>
                    <p className="text-sm text-slate-600">{selectedMessage.inquiryEmail}</p>
                  </div>
                  {(selectedMessage.phone || selectedMessage.phone_number) && (
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-semibold">{selectedMessage.phone || selectedMessage.phone_number}</p>
                    </div>
                  )}
                </div>
                {selectedMessage.type === 'lead' && selectedMessage.travel_type && (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Interested In:</span> {selectedMessage.travel_type}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Inquiry</p>
                <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.inquiryMessage || selectedMessage.notes || 'No message'}
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Status</p>
                  <Select value={selectedMessage.status} onValueChange={(val) => 
                    setSelectedMessage({...selectedMessage, status: val})
                  }>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Priority</p>
                  <Select value={selectedMessage.priority || 'medium'} onValueChange={(val) => 
                    setSelectedMessage({...selectedMessage, priority: val})
                  }>
                    <SelectTrigger className="h-8">
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

              {/* Reply Box */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Quick Reply
                </p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type your reply to ${selectedMessage.name}...`}
                  className="min-h-24 resize-none bg-white mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickReply("in_progress")}
                    disabled={replyMutation.isPending || !replyText.trim()}
                    className="gap-1"
                  >
                    <Send className="w-3 h-3" /> Reply
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 gap-1"
                    onClick={() => handleQuickReply("resolved")}
                    disabled={replyMutation.isPending || !replyText.trim()}
                  >
                    <CheckCircle className="w-3 h-3" /> Reply & Resolve
                  </Button>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Internal Notes</p>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add notes for your team..."
                  className="min-h-20 resize-none"
                />
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-500 pt-2 border-t space-y-1">
                <p>Type: {selectedMessage.type === 'lead' ? 'Sales Lead' : 'Support Ticket'}</p>
                <p>Created: {format(new Date(selectedMessage.created_date), "PPpp")}</p>
                {selectedMessage.assigned_to && <p>Assigned to: {selectedMessage.assigned_to}</p>}
                {selectedMessage.booking_reference && <p>Booking Ref: {selectedMessage.booking_reference}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => {
                  updateMutation.mutate({
                    status: selectedMessage.status,
                    priority: selectedMessage.priority,
                    internal_notes: internalNotes,
                    assigned_to: user?.email || selectedMessage.assigned_to,
                    resolved_date: selectedMessage.status === "resolved" ? new Date().toISOString().split('T')[0] : undefined
                  });
                }}
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
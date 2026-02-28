import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupportTicketsPanel() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100)
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }) =>
      base44.functions.invoke('addTicketMessage', {
        ticketId,
        message,
        senderType: 'support'
      }),
    onSuccess: () => {
      setReplyMessage('');
      setSelectedTicket(null);
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ ticketId, status, notes, assignedTo }) =>
      base44.entities.SupportTicket.update(ticketId, {
        status,
        notes: notes || '',
        assigned_to: assignedTo
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    }
  });

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplying(true);
    setError(null);

    try {
      await replyMutation.mutateAsync({
        ticketId: selectedTicket.id,
        message: replyMessage
      });
    } catch (err) {
      setError(err.message);
      setReplying(false);
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    waiting_customer: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-purple-100 text-purple-800',
    closed: 'bg-slate-100 text-slate-800'
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading support tickets...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Tickets List */}
      <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-3">Support Tickets</h3>
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-500">No support tickets yet</p>
        ) : (
          tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                selectedTicket?.id === ticket.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500">{ticket.customer_name}</p>
                  <p className="text-xs text-slate-400 truncate">{ticket.customer_email}</p>
                </div>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge className={statusColors[ticket.status]}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Ticket Details */}
      {selectedTicket && (
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">ID: {selectedTicket.id}</p>
                </div>
                <Badge className={statusColors[selectedTicket.status]}>
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Customer</p>
                  <p className="font-medium">{selectedTicket.customer_name}</p>
                  <p className="text-slate-600">{selectedTicket.customer_email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Booking</p>
                  <p className="font-medium">{selectedTicket.booking_type || 'N/A'}</p>
                  {selectedTicket.booking_id && (
                    <p className="text-slate-600">{selectedTicket.booking_id}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="bg-slate-50 p-3 rounded-lg space-y-3 max-h-48 overflow-y-auto">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={msg.sender === 'customer' ? 'text-left' : 'text-right'}>
                    <div
                      className={`inline-block max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.sender === 'customer'
                          ? 'bg-white text-slate-900 border'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full p-2 border rounded-lg text-sm resize-none"
                  rows="3"
                  disabled={replying}
                />
                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={replying || !replyMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {replying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketMutation.mutate({
                        ticketId: selectedTicket.id,
                        status: e.target.value
                      })
                    }
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
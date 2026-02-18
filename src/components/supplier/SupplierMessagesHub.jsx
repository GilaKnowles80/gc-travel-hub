import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, AlertCircle, Bell, DollarSign, Info, 
  Reply, Eye, Paperclip 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SupplierMessagesHub({ supplierId }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['supplier-messages', supplierId],
    queryFn: () => base44.entities.SupplierMessage.filter({ supplier_id: supplierId }, '-created_date')
  });

  const markReadMutation = useMutation({
    mutationFn: (messageId) => base44.entities.SupplierMessage.update(messageId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-messages']);
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (data) => {
      const supplier = await base44.entities.Supplier.get(supplierId);
      return base44.entities.SupplierMessage.create({
        supplier_id: supplierId,
        sender_type: 'supplier',
        sender_email: supplier.email,
        sender_name: supplier.company_name,
        subject: `Re: ${data.original_subject}`,
        message: data.reply_text,
        message_type: 'support',
        priority: 'normal',
        parent_message_id: data.parent_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['supplier-messages']);
      setReplyText('');
      toast.success('Reply sent');
    }
  });

  const unreadCount = messages.filter(m => !m.is_read && m.sender_type !== 'supplier').length;

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.sender_type !== 'supplier') {
      markReadMutation.mutate(message.id);
    }
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({
      parent_id: selectedMessage.id,
      original_subject: selectedMessage.subject,
      reply_text: replyText
    });
  };

  const getMessageIcon = (type) => {
    const icons = {
      announcement: Bell,
      support: MessageSquare,
      payment: DollarSign,
      update: Info,
      alert: AlertCircle
    };
    return icons[type] || MessageSquare;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-amber-100 text-amber-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Messages & Communications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-600">{unreadCount} Unread</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                const Icon = getMessageIcon(message.message_type);
                return (
                  <div
                    key={message.id}
                    onClick={() => handleViewMessage(message)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      !message.is_read && message.sender_type !== 'supplier'
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span className={`font-medium ${!message.is_read && message.sender_type !== 'supplier' ? 'text-blue-900' : ''}`}>
                          {message.subject}
                        </span>
                        {message.is_broadcast && (
                          <Badge variant="outline" className="text-xs">Broadcast</Badge>
                        )}
                      </div>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 line-clamp-1">{message.message}</p>
                      <span className="text-xs text-slate-500 ml-4">
                        {format(new Date(message.created_date), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    {message.sender_type === 'admin' && (
                      <p className="text-xs text-slate-500 mt-1">From: Admin</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle>{selectedMessage.subject}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                      <Badge className="capitalize">{selectedMessage.message_type}</Badge>
                      {selectedMessage.is_broadcast && (
                        <Badge variant="outline">Broadcast</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">
                        {selectedMessage.sender_type === 'admin' ? 'Admin' : selectedMessage.sender_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(selectedMessage.created_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Attachments:</p>
                      {selectedMessage.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Paperclip className="w-4 h-4" />
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMessage.sender_type === 'admin' && (
                  <div>
                    <Label>Reply</Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                      className="mt-2"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="mt-2"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                )}

                {/* Show thread/replies if any */}
                {messages.filter(m => m.parent_message_id === selectedMessage.id).length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Replies:</p>
                    {messages
                      .filter(m => m.parent_message_id === selectedMessage.id)
                      .map(reply => (
                        <div key={reply.id} className="bg-slate-50 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{reply.sender_name}</p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(reply.created_date), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-slate-700">{reply.message}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminSupplierComms() {
  const [formData, setFormData] = useState({
    supplier_id: '',
    subject: '',
    message: '',
    message_type: 'announcement',
    priority: 'normal',
    is_broadcast: false
  });

  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.filter({ status: 'active' })
  });

  const { data: recentMessages = [] } = useQuery({
    queryKey: ['recent-supplier-messages'],
    queryFn: () => base44.entities.SupplierMessage.filter({}, '-created_date', 20)
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('sendSupplierMessage', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['recent-supplier-messages']);
      toast.success('Message sent successfully');
      setFormData({
        supplier_id: '',
        subject: '',
        message: '',
        message_type: 'announcement',
        priority: 'normal',
        is_broadcast: false
      });
    }
  });

  const handleSend = () => {
    if (!formData.subject || !formData.message) {
      toast.error('Subject and message are required');
      return;
    }
    if (!formData.is_broadcast && !formData.supplier_id) {
      toast.error('Please select a supplier or enable broadcast');
      return;
    }

    sendMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Supplier Communications
          </h1>
          <p className="text-slate-600">Send messages and announcements to suppliers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose Message */}
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Broadcast to All Suppliers</p>
                  <p className="text-sm text-slate-600">Send to all active suppliers</p>
                </div>
                <Switch
                  checked={formData.is_broadcast}
                  onCheckedChange={(checked) => setFormData({...formData, is_broadcast: checked})}
                />
              </div>

              {!formData.is_broadcast && (
                <div>
                  <Label>Select Supplier</Label>
                  <Select 
                    value={formData.supplier_id} 
                    onValueChange={(v) => setFormData({...formData, supplier_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.company_name} ({supplier.supplier_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Message subject..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.message_type} 
                    onValueChange={(v) => setFormData({...formData, message_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v) => setFormData({...formData, priority: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Type your message..."
                  rows={6}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.priority === 'urgent' || formData.priority === 'high' 
                    ? '⚠️ High/Urgent priority messages will also send email notifications'
                    : 'Suppliers will receive in-app notifications'}
                </p>
              </div>

              <Button 
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {formData.is_broadcast ? `Send to ${suppliers.length} Suppliers` : 'Send Message'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map(msg => (
                    <div key={msg.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{msg.subject}</span>
                            {msg.is_broadcast && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                Broadcast
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{msg.message}</p>
                        </div>
                        <Badge className={
                          msg.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          msg.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {msg.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(msg.created_date), 'MMM dd, HH:mm')}
                        <span>•</span>
                        <span className="capitalize">{msg.message_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
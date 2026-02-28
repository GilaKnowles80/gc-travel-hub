import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportChatWidget({
  defaultOpen = false,
  bookingId = null,
  bookingType = 'general'
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [ticketId, setTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(!defaultOpen);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', subject: '' });
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.subject) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('createSupportTicket', {
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        subject: customerInfo.subject,
        description: inputValue || 'Customer initiated chat',
        bookingId: bookingId || null,
        bookingType: bookingType || 'general',
        category: 'other',
        priority: 'medium'
      });

      setTicketId(response.data.ticketId);
      setMessages([
        {
          sender: 'customer',
          sender_name: customerInfo.name,
          message: inputValue || 'Customer initiated chat',
          timestamp: new Date().toISOString()
        }
      ]);
      setInputValue('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !ticketId) return;

    setLoading(true);
    setError(null);

    try {
      await base44.functions.invoke('addTicketMessage', {
        ticketId,
        message: inputValue,
        senderType: 'customer'
      });

      setMessages([
        ...messages,
        {
          sender: 'customer',
          sender_name: customerInfo.name,
          message: inputValue,
          timestamp: new Date().toISOString()
        }
      ]);
      setInputValue('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-96 max-w-full z-40"
          >
            <Card className="shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold">Support Chat</h3>
                    <p className="text-xs text-blue-100">Average response: 5 min</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {showForm ? (
                  <form onSubmit={handleCreateTicket} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <Input
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="Your name"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <Input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="your@email.com"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Subject</label>
                      <Input
                        value={customerInfo.subject}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, subject: e.target.value })}
                        placeholder="How can we help?"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Message</label>
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Describe your issue..."
                        className="w-full p-2 border rounded-lg text-sm resize-none"
                        rows="3"
                        disabled={loading}
                      />
                    </div>
                    {error && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Start Chat
                    </Button>
                  </form>
                ) : (
                  <>
                    {ticketId && (
                      <div className="text-xs bg-blue-50 p-2 rounded text-blue-700">
                        Ticket ID: <strong>{ticketId}</strong>
                      </div>
                    )}
                    
                    <div className="space-y-3 min-h-32">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              msg.sender === 'customer'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {error && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              {ticketId && !showForm && (
                <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Float Button */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
}
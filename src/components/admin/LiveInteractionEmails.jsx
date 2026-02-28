import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LiveInteractionEmails() {
  const [activeTab, setActiveTab] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const emailAccounts = [
    {
      id: 1,
      type: 'General Inquiries',
      email: 'info@gctravelandtours.com',
      icon: '💬',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      badgeColor: 'bg-blue-100 text-blue-800',
      unreadCount: 3,
      lastActivity: 'Just now',
      status: 'active',
      recentMessages: [
        { sender: 'John Doe', subject: 'Route inquiry', time: '2 mins ago', preview: 'Hi, I want to know more about...' },
        { sender: 'Maria Santos', subject: 'Package question', time: '15 mins ago', preview: 'Can you provide more details...' },
        { sender: 'Alex Chen', subject: 'Tour availability', time: '1 hour ago', preview: 'Is the Japan tour still...' }
      ]
    },
    {
      id: 2,
      type: 'Bookings',
      email: 'gctravelandtours2021@gmail.com',
      icon: '📧',
      color: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-300',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      unreadCount: 7,
      lastActivity: 'Just now',
      status: 'active',
      recentMessages: [
        { sender: 'Booking Confirmation', subject: 'Booking #BK-45231', time: '1 min ago', preview: 'Your booking has been confirmed' },
        { sender: 'Customer Payment', subject: 'Payment Received - BK-45230', time: '5 mins ago', preview: 'Payment of ₱45,000 received' },
        { sender: 'Booking Reminder', subject: 'Reminder: Your flight departs', time: '2 hours ago', preview: 'Your PAL flight to London...' },
        { sender: 'Itinerary Update', subject: 'Updated Itinerary - BK-45229', time: '5 hours ago', preview: 'Your updated travel itinerary' },
        { sender: 'Hotel Confirmation', subject: 'Hotel booking confirmed', time: '1 day ago', preview: 'Your hotel reservation at...' }
      ]
    },
    {
      id: 3,
      type: 'Support',
      email: 'support@gctravelandtours.com',
      icon: '🆘',
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      badgeColor: 'bg-orange-100 text-orange-800',
      unreadCount: 2,
      lastActivity: '5 mins ago',
      status: 'active',
      recentMessages: [
        { sender: 'Customer Support', subject: 'RE: Flight cancellation help', time: '5 mins ago', preview: 'We have processed your refund request...' },
        { sender: 'Technical Support', subject: 'Website issues - RESOLVED', time: '30 mins ago', preview: 'The checkout issue has been fixed' },
        { sender: 'Complaint Resolution', subject: 'RE: Flight delay complaint', time: '2 hours ago', preview: 'We apologize for the inconvenience...' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate real-time email updates
    const interval = setInterval(() => {
      setConnectionStatus(prev => prev === 'connected' ? 'connected' : 'connected');
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const account = emailAccounts[activeTab];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Live Interaction Emails
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">Monitor and manage customer communications across all channels</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-600">Live Monitoring Active</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Email Account Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {emailAccounts.map((acc, idx) => (
            <button
              key={acc.id}
              onClick={() => setActiveTab(idx)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeTab === idx
                  ? `${acc.borderColor} ${acc.color} border-opacity-100`
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{acc.icon}</span>
                {acc.unreadCount > 0 && (
                  <Badge className={acc.badgeColor}>{acc.unreadCount}</Badge>
                )}
              </div>
              <p className="font-semibold text-sm text-slate-900">{acc.type}</p>
              <p className="text-xs text-slate-600 mt-1 truncate">{acc.email}</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">{acc.lastActivity}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Active Account Details */}
        <div className={`bg-gradient-to-br ${account.color} ${account.borderColor} border-2 rounded-lg p-6 mb-6`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{account.type}</h3>
              <a
                href={`mailto:${account.email}`}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                {account.email}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold text-slate-900">Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-60 rounded p-3">
              <p className="text-2xl font-bold text-slate-900">{account.unreadCount}</p>
              <p className="text-xs text-slate-600">Unread Messages</p>
            </div>
            <div className="bg-white bg-opacity-60 rounded p-3">
              <p className="text-2xl font-bold text-slate-900">{account.recentMessages.length}</p>
              <p className="text-xs text-slate-600">Recent Activity</p>
            </div>
            <div className="bg-white bg-opacity-60 rounded p-3">
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-600">Uptime</p>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Recent Messages
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {account.recentMessages.map((msg, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm text-slate-900">{msg.sender}</p>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-700 mb-1">{msg.subject}</p>
                <p className="text-xs text-slate-600 line-clamp-1">{msg.preview}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-2">
          <button className="flex-1 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors text-sm font-semibold">
            Open in Email Client
          </button>
          <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors text-sm font-semibold">
            View Full Thread
          </button>
          <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors text-sm font-semibold">
            Reply
          </button>
        </div>

        {/* Connection Status */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">
                All email accounts are synced and live
              </span>
            </div>
            <span className="text-xs text-slate-500">Last sync: Just now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
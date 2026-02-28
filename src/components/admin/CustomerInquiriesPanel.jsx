import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, AlertCircle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CustomerInquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('readCustomerInquiries', {
        maxResults: 25,
        unreadOnly
      });
      setInquiries(response.data.inquiries || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [unreadOnly]);

  const extractEmail = (fromString) => {
    const match = fromString.match(/<(.+?)>/);
    return match ? match[1] : fromString;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Customer Inquiries</CardTitle>
              <CardDescription>Read and manage customer support emails</CardDescription>
            </div>
          </div>
          <Button
            onClick={fetchInquiries}
            disabled={loading}
            size="sm"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Toggle */}
        <div className="flex gap-2">
          <Button
            variant={unreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUnreadOnly(true)}
          >
            Unread Only
          </Button>
          <Button
            variant={!unreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUnreadOnly(false)}
          >
            All Inquiries
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Inquiry List */}
            <div className="divide-y border rounded-lg">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedInquiry?.id === inquiry.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedInquiry(selectedInquiry?.id === inquiry.id ? null : inquiry)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">
                        {inquiry.subject || '(No Subject)'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <User className="w-3 h-3" />
                        <span className="truncate">{extractEmail(inquiry.from)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {inquiry.date && formatDistanceToNow(new Date(inquiry.date), { addSuffix: true })}
                      </div>
                      {inquiry.isUnread && (
                        <div className="mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Unread
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Inquiry Details */}
                  {selectedInquiry?.id === inquiry.id && (
                    <div className="mt-4 pt-4 border-t bg-slate-50 -mx-4 -mb-4 p-4">
                      <h5 className="font-semibold text-sm mb-2">Preview:</h5>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                        {inquiry.body || inquiry.snippet || '(No content)'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://mail.google.com/mail/u/0/#inbox/${inquiry.id}`, '_blank');
                        }}
                      >
                        Open in Gmail
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center pt-2">
              Showing {inquiries.length} inquiries
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
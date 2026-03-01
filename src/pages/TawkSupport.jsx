import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ExternalLink, RefreshCw } from "lucide-react";

export default function TawkSupport() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Open Tawk dashboard in new window for now
      const tawkDashboard = "https://dashboard.tawk.to";
      window.open(tawkDashboard, "_blank");
      
      // Mock conversations until Tawk API integration
      setConversations([
        {
          id: "conv_1",
          visitorName: "John Doe",
          email: "john@example.com",
          lastMessage: "When can I book my flight?",
          timestamp: new Date(Date.now() - 3600000),
          status: "pending"
        },
        {
          id: "conv_2",
          visitorName: "Jane Smith",
          email: "jane@example.com",
          lastMessage: "Is there a discount for groups?",
          timestamp: new Date(Date.now() - 7200000),
          status: "pending"
        }
      ]);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Mock messages
    setMessages([
      { id: 1, type: "visitor", text: conv.lastMessage, timestamp: conv.timestamp },
      { id: 2, type: "agent", text: "Thank you for reaching out! How can I help?", timestamp: new Date() }
    ]);
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedConversation) return;

    const newMessage = {
      id: messages.length + 1,
      type: "agent",
      text: reply,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setReply("");

    // In production, send to Tawk API
    console.log("Sending reply to Tawk:", newMessage);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tawk.to Support</h1>
          <div className="flex gap-2">
            <Button onClick={loadConversations} variant="outline" className="rounded-lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => window.open("https://dashboard.tawk.to", "_blank")}
              className="bg-amber-500 hover:bg-amber-600 rounded-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Tawk Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="rounded-xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Conversations ({conversations.length})
                </h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No conversations yet. Check Tawk dashboard for messages.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 text-left transition-all ${
                        selectedConversation?.id === conv.id
                          ? "bg-amber-50 border-l-4 border-amber-500"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-slate-900 text-sm">{conv.visitorName}</p>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Pending</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{conv.email}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{conv.lastMessage}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {conv.timestamp.toLocaleTimeString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Messages View */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <Card className="rounded-xl flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b">
                  <h3 className="font-semibold text-slate-900">{selectedConversation.visitorName}</h3>
                  <p className="text-sm text-slate-600">{selectedConversation.email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === "agent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.type === "agent"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.type === "agent" ? "text-amber-100" : "text-slate-500"
                        }`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t bg-slate-50 space-y-3">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={!reply.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="rounded-xl p-8 text-center">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a conversation to view messages</p>
              </Card>
            )}
          </div>
        </div>

        {/* Info Box */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> For full Tawk.to integration, visit the{" "}
            <button
              onClick={() => window.open("https://dashboard.tawk.to", "_blank")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Tawk Dashboard
            </button>
            {" "}to manage conversations, set up automation, and view detailed analytics. This page provides a quick view of pending conversations.
          </p>
        </Card>
      </div>
    </div>
  );
}
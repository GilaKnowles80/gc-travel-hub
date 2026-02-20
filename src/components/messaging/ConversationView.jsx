import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, X, User } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function ConversationView({ conversation, onUpdate }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: () =>
      base44.entities.Message.filter({ conversation_id: conversation.id }, "created_date"),
    refetchInterval: 3000,
  });

  const isSalesAgent = user?.role === "sales" || user?.role === "sales_manager" || user?.role === "admin";

  // Real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversation.id) {
        queryClient.invalidateQueries(["messages", conversation.id]);
      }
    });

    return unsubscribe;
  }, [conversation.id, queryClient]);

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => !msg.is_read && msg.sender_email !== user?.email
      );

      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { is_read: true });
      }

      if (unreadMessages.length > 0) {
        const unreadField = isSalesAgent ? "unread_agent" : "unread_customer";
        await base44.entities.Conversation.update(conversation.id, {
          [unreadField]: 0,
        });
        onUpdate();
      }
    };

    if (user && messages.length > 0) {
      markAsRead();
    }
  }, [messages, user, conversation.id, isSalesAgent, onUpdate]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const senderRole = isSalesAgent ? (user.role === "admin" ? "admin" : "agent") : "customer";

      // Create message
      const newMessage = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_role: senderRole,
        message: message.trim(),
        attachments: attachments,
      });

      // Update conversation
      const otherUnreadField = isSalesAgent ? "unread_customer" : "unread_agent";
      await base44.entities.Conversation.update(conversation.id, {
        last_message_at: new Date().toISOString(),
        [otherUnreadField]: (conversation[otherUnreadField] || 0) + 1,
      });

      // Send notification
      const recipientEmail = isSalesAgent ? conversation.customer_email : conversation.agent_email;
      if (recipientEmail) {
        await base44.entities.Notification.create({
          user_email: recipientEmail,
          title: `New message from ${user.full_name}`,
          message: message.substring(0, 100),
          type: "info",
          link: "/messages",
        });
      }

      return newMessage;
    },
    onSuccess: () => {
      setMessage("");
      setAttachments([]);
      queryClient.invalidateQueries(["messages", conversation.id]);
      onUpdate();
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments((prev) => [...prev, file_url]);
        toast.success("File uploaded");
      } catch (error) {
        toast.error("Upload failed");
      }
    }
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    sendMutation.mutate();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{conversation.subject}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {isSalesAgent ? conversation.customer_email : conversation.agent_email || "Unassigned"}
            </p>
          </div>
          <Badge variant={
            conversation.status === "open" ? "secondary" :
            conversation.status === "assigned" ? "default" : "outline"
          }>
            {conversation.status}
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_email === user?.email;

          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  {!isOwn && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                  <span className="text-xs text-slate-600">
                    {msg.sender_name} • {moment(msg.created_date).format("MMM D, h:mm A")}
                  </span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  {msg.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline block"
                        >
                          Attachment {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachments.map((url, i) => (
              <div key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs">
                <span>Attachment {i + 1}</span>
                <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" size="icon" asChild>
              <span className="cursor-pointer">
                <Paperclip className="w-4 h-4" />
              </span>
            </Button>
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending || (!message.trim() && attachments.length === 0)}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
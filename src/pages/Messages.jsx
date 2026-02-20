import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Search } from "lucide-react";
import ConversationView from "@/components/messaging/ConversationView";
import NewConversationDialog from "@/components/messaging/NewConversationDialog";
import { toast } from "sonner";
import moment from "moment";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.email],
    queryFn: async () => {
      const isSales = user?.role === "sales" || user?.role === "sales_manager" || user?.role === "admin";
      
      if (isSales) {
        return await base44.entities.Conversation.list("-last_message_at");
      } else {
        return await base44.entities.Conversation.filter(
          { customer_email: user.email },
          "-last_message_at"
        );
      }
    },
    enabled: !!user,
  });

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      queryClient.invalidateQueries(["conversations"]);
      
      if (selectedConversation && event.id === selectedConversation.id) {
        setSelectedConversation(event.data);
      }
    });

    return unsubscribe;
  }, [user, selectedConversation, queryClient]);

  const filtered = conversations.filter((conv) => {
    const search = searchQuery.toLowerCase();
    return (
      conv.subject?.toLowerCase().includes(search) ||
      conv.customer_email?.toLowerCase().includes(search) ||
      conv.agent_email?.toLowerCase().includes(search)
    );
  });

  const isSalesAgent = user?.role === "sales" || user?.role === "sales_manager" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
            <p className="text-slate-600">Direct communication with {isSalesAgent ? "customers" : "sales team"}</p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-lg">Conversations</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filtered.map((conv) => {
                  const unreadCount = isSalesAgent ? conv.unread_agent : conv.unread_customer;
                  const isSelected = selectedConversation?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-amber-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-slate-900 line-clamp-1 flex-1">
                          {conv.subject}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {isSalesAgent ? conv.customer_email : conv.agent_email || "Unassigned"}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          conv.status === "open" ? "secondary" :
                          conv.status === "assigned" ? "default" : "outline"
                        }>
                          {conv.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {conv.last_message_at ? moment(conv.last_message_at).fromNow() : "No messages"}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No conversations yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversation View */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ConversationView
                conversation={selectedConversation}
                onUpdate={() => queryClient.invalidateQueries(["conversations"])}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">Select a conversation to view messages</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <NewConversationDialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onSuccess={(conv) => {
          setShowNewDialog(false);
          setSelectedConversation(conv);
          queryClient.invalidateQueries(["conversations"]);
        }}
      />
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, Compass, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "@/components/agents/MessageBubble";

const AGENT_NAME = "tour_booking_assistant";

export default function TourAssistant() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Load or create a conversation on mount
  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      try {
        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        let convo = existing && existing.length > 0 ? existing[0] : null;
        if (!convo) {
          convo = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "Tour Concierge", description: "Discover and book your ideal tour" },
          });
        }
        setConversation(convo);
        setMessages(convo.messages || []);

        unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
          setMessages(data.messages || []);
        });
      } catch (e) {
        console.error("Agent conversation error:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversation || sending) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    "I want a beach trip under $500",
    "Show me adventure tours in the Philippines",
    "Help me book a honeymoon tour",
    "What cultural tours do you have?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 pt-16 md:pt-20 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-16 md:top-20 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Tour Concierge
              <Sparkles className="w-4 h-4 text-orange-500" />
            </h1>
            <p className="text-xs text-slate-500 truncate">Discover & book your ideal tour with AI</p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hi! I'm your Tour Concierge 🌍</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Tell me where you'd like to go, your budget, and your vibe — I'll find the perfect tour and help you book it.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 pt-4 bg-white/80 backdrop-blur">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your dream tour..."
            disabled={sending || loading}
            className="rounded-xl"
          />
          <Button type="submit" disabled={sending || loading || !input.trim()} className="rounded-xl bg-orange-500 hover:bg-orange-600 shrink-0">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
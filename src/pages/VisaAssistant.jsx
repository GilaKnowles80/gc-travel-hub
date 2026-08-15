import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "@/components/agents/MessageBubble";

const AGENT_NAME = "visa_booking_assistant";

export default function VisaAssistant() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      try {
        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        let convo = existing && existing.length > 0 ? existing[0] : null;
        if (!convo) {
          convo = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "Visa Concierge", description: "Guide through booking a visa appointment" },
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
    "I need a tourist visa for Japan",
    "How do I get a US tourist visa?",
    "Business visa for Singapore",
    "Student visa requirements for Canada",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-16 md:pt-20 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-16 md:top-20 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Visa Concierge
              <Sparkles className="w-4 h-4 text-blue-500" />
            </h1>
            <p className="text-xs text-slate-500 truncate">Guided visa appointment booking with AI</p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Hi! I'm your Visa Concierge 🛂</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Tell me your destination country and travel purpose — I'll find the right visa, explain the requirements, and help you book an appointment.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
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
            placeholder="Where are you traveling to?"
            disabled={sending || loading}
            className="rounded-xl"
          />
          <Button type="submit" disabled={sending || loading || !input.trim()} className="rounded-xl bg-blue-500 hover:bg-blue-600 shrink-0">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
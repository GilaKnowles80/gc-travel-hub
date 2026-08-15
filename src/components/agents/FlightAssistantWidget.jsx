import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, X, Plane, Sparkles, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "@/components/agents/MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

const AGENT_NAME = "flight_booking_assistant";

const stepSuggestions = {
  "Flight Search": [
    "Find cheap flights to Tokyo",
    "What's the cheapest day to fly?",
    "Direct flights only, please",
  ],
  "Flight Details": [
    "What cabin class should I pick?",
    "How much baggage is included?",
    "Is this a direct flight?",
  ],
  Checkout: [
    "Do I need travel insurance?",
    "Should names match my passport?",
    "What add-ons are worth it?",
  ],
  Payment: [
    "What payment methods are accepted?",
    "Is my payment secure?",
    "Will the fare change at checkout?",
  ],
  Confirmation: [
    "Where's my booking reference?",
    "When will I get my e-ticket?",
    "Check my booking status",
  ],
};

export default function FlightAssistantWidget({ stepLabel = "Flights" }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open || conversation) return;
    let unsubscribe = () => {};
    setLoading(true);
    (async () => {
      try {
        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        let convo = existing && existing.length > 0 ? existing[0] : null;
        if (!convo) {
          convo = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: {
              name: "Flight Concierge",
              description: "Guides through flight booking to issued itinerary",
              step: stepLabel,
            },
          });
        }
        setConversation(convo);
        setMessages(convo.messages || []);
        unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
          setMessages(data.messages || []);
        });
      } catch (e) {
        console.error("Flight assistant error:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => unsubscribe();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversation || sending) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const suggestions = stepSuggestions[stepLabel] || stepSuggestions["Flight Search"];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white"
            title="Flight Assistant"
          >
            <Plane className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-40 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex items-center gap-3 text-white shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">Flight Concierge</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-white/80">{stepLabel} • here to help</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 bg-slate-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6 px-2">
                  <p className="text-sm font-medium text-slate-700 mb-1">Need help with your flight? ✈️</p>
                  <p className="text-xs text-slate-500 mb-4">Ask me anything — fares, cabins, baggage, payment, or your booking status.</p>
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
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
            <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your flight..."
                disabled={sending || loading}
                className="rounded-full text-sm h-9"
              />
              <Button type="submit" size="icon" disabled={sending || loading || !input.trim()} className="rounded-full bg-amber-500 hover:bg-amber-600 h-9 w-9 shrink-0">
                {sending ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
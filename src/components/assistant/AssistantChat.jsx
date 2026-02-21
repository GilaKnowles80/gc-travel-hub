import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function AssistantChat({ context = {} }) {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: "assistant", 
      text: "👋 Hi! I'm your AI travel assistant. I can help you with:\n\n🌍 Destination recommendations based on your budget and interests\n✈️ Flight and hotel suggestions for your itinerary\n📋 Travel FAQs (visas, packing, best times to visit)\n\nTell me about your dream trip, or ask me anything about travel!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await base44.functions.invoke('travelAssistant', {
        message: userMessage,
        context
      });
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", text: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", text: "Sorry, I encountered an error. Please try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-2xl flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <h2 className="font-semibold">Travel Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-orange-500 text-white rounded-br-none"
                    : msg.isError
                    ? "bg-red-100 text-red-700 rounded-bl-none"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-slate-500"
          >
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 rounded-b-2xl">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about destinations, itineraries..."
            className="rounded-xl"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
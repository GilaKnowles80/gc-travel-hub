import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, MessageCircle, X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";

const PHONE_NUMBERS = [
  { provider: "GLOBE", number: "+639154401150", formatted: "09154401150" },
  { provider: "SMART", number: "+639620595263", formatted: "09620595263" }
];

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("call");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! How can we assist you today? Ask us anything about tours, flights, hotels, visas, or bookings." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful customer service assistant for GC Travel & Tours Agency. A customer asked: "${userMessage}". 
        
        Help them with questions about:
        - Tours and travel packages
        - Flight bookings
        - Hotel reservations
        - Visa assistance
        - General travel advice
        
        Keep responses brief and friendly. If they need to speak with a representative, suggest they call our hotlines: +639154401150 (GLOBE) or +639620595263 (SMART).`
      });

      setMessages(prev => [...prev, { role: "assistant", text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't process that. Please try calling us at +639154401150 (GLOBE) or +639620595263 (SMART)." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone className="w-6 h-6" />
      </motion.button>

      {/* Support Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="border-b pb-3">
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("call")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "call"
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-slate-500"
              }`}
            >
              <Phone className="w-4 h-4" />
              Call Us
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "chat"
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-slate-500"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>

          {/* Call Tab */}
          {activeTab === "call" && (
            <div className="flex-1 py-6 px-4 space-y-3">
              <p className="text-sm text-slate-600 text-center mb-4">
                Choose your preferred network to call us
              </p>
              {PHONE_NUMBERS.map((phone) => (
                <Button
                  key={phone.provider}
                  onClick={() => handleCall(phone.number)}
                  className="w-full h-16 bg-slate-50 hover:bg-amber-50 text-slate-900 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1"
                >
                  <Phone className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">{phone.provider}</span>
                  <span className="text-sm text-slate-600">{phone.number}</span>
                </Button>
              ))}
              <p className="text-xs text-slate-500 text-center mt-4">
                Click to call using your device's phone app
              </p>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4 bg-slate-50 rounded-lg">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-amber-600 text-white rounded-br-none"
                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-700 border border-slate-200 rounded-lg rounded-bl-none px-4 py-2">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask us something..."
                  className="flex-1 rounded-lg text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
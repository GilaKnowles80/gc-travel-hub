import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Globe, Lock, Send, Eye, EyeOff, Plus } from "lucide-react";
import { motion } from "framer-motion";
import VirtualCardManager from "./VirtualCardManager";
import KYCVerification from "./KYCVerification";
import BankTransferForm from "./BankTransferForm";
import MultiCurrencyWallet from "./MultiCurrencyWallet";

export default function WalletFintech({ user }) {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");
  const queryClient = useQueryClient();

  // Fetch user's wallet cards
  const { data: cards = [] } = useQuery({
    queryKey: ["wallet-cards", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.WalletCard.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  // Fetch KYC status
  const { data: kycData } = useQuery({
    queryKey: ["wallet-kyc", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const kycs = await base44.entities.WalletKYC.filter({ user_email: user.email });
      return kycs[0] || null;
    },
    enabled: !!user?.email,
  });

  // Fetch currency accounts
  const { data: currencies = [] } = useQuery({
    queryKey: ["currency-accounts", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.CurrencyAccount.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const primaryCard = cards.find(c => c.is_primary);
  const kycVerified = kycData?.kyc_status === "verified";

  return (
    <div className="space-y-6">
      {/* KYC Alert */}
      {!kycVerified && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <p className="text-amber-900 font-semibold mb-2">⚠️ KYC Verification Required</p>
          <p className="text-amber-800 text-sm mb-3">Complete KYC to unlock higher limits and premium features.</p>
          <Button 
            size="sm" 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setActiveTab("kyc")}
          >
            Verify Now
          </Button>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="currencies" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Currencies</span>
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Transfers</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
        </TabsList>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          {primaryCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-xl h-56"
            >
              <div className="absolute top-4 right-4">
                <CreditCard className="w-8 h-8 opacity-20" />
              </div>
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-2">CARD NUMBER</p>
                  <p className="text-2xl font-mono tracking-widest">
                    {showCardDetails ? primaryCard.card_number : `•••• •••• •••• ${primaryCard.card_number.slice(-4)}`}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100 text-xs mb-1">CARDHOLDER</p>
                    <p className="font-semibold">{primaryCard.card_holder_name}</p>
                  </div>
                  <button onClick={() => setShowCardDetails(!showCardDetails)} className="text-blue-100 hover:text-white">
                    {showCardDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <VirtualCardManager user={user} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["wallet-cards"] })} />
        </TabsContent>

        {/* Currencies Tab */}
        <TabsContent value="currencies">
          <MultiCurrencyWallet user={user} accounts={currencies} />
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers">
          <BankTransferForm user={user} kycVerified={kycVerified} />
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc">
          <KYCVerification user={user} currentKyc={kycData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
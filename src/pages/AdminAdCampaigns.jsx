import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdCampaignManager from "@/components/ads/AdCampaignManager.jsx";
import AdCopyGenerator from "@/components/ads/AdCopyGenerator.jsx";
import AdPixelManager from "@/components/ads/AdPixelManager.jsx";
import { AlertTriangle, Megaphone } from "lucide-react";

export default function AdminAdCampaigns() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
    </div>
  );

  if (!user || user.role !== 'admin') return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p className="text-slate-500">Admin only.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ad Campaign Center</h1>
            <p className="text-sm text-slate-500">Manage campaigns, generate ad copy & track conversions across all platforms</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="campaigns">
          <TabsList className="mb-6">
            <TabsTrigger value="campaigns">📊 Campaign Manager</TabsTrigger>
            <TabsTrigger value="copy">✍️ AI Ad Copy</TabsTrigger>
            <TabsTrigger value="pixels">🔍 Pixel Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns"><AdCampaignManager /></TabsContent>
          <TabsContent value="copy"><AdCopyGenerator /></TabsContent>
          <TabsContent value="pixels"><AdPixelManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
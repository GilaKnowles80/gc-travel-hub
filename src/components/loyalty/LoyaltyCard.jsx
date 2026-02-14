import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Gift } from "lucide-react";

export default function LoyaltyCard({ account, settings }) {
  if (!account) {
    return (
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Loyalty Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Join our loyalty program to earn points on every booking!</p>
        </CardContent>
      </Card>
    );
  }

  const tierColors = {
    bronze: "bg-orange-100 text-orange-700 border-orange-300",
    silver: "bg-slate-200 text-slate-700 border-slate-400",
    gold: "bg-amber-100 text-amber-700 border-amber-400",
    platinum: "bg-purple-100 text-purple-700 border-purple-400",
  };

  const tierGradients = {
    bronze: "from-orange-500 to-orange-700",
    silver: "from-slate-400 to-slate-600",
    gold: "from-amber-400 to-amber-600",
    platinum: "from-purple-500 to-purple-700",
  };

  const nextTier = {
    bronze: { name: "Silver", threshold: settings?.silver_threshold || 5000 },
    silver: { name: "Gold", threshold: settings?.gold_threshold || 15000 },
    gold: { name: "Platinum", threshold: settings?.platinum_threshold || 30000 },
    platinum: null,
  }[account.tier];

  const pointsToNext = nextTier
    ? Math.max(0, nextTier.threshold - (account.lifetime_points || 0))
    : 0;

  const progressPercent = nextTier
    ? Math.min(100, ((account.lifetime_points || 0) / nextTier.threshold) * 100)
    : 100;

  const redemptionValue = (account.points_balance || 0) * (settings?.peso_per_point || 0.5);

  return (
    <Card className={`bg-gradient-to-br ${tierGradients[account.tier]} text-white border-0 shadow-lg`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6" />
              {account.tier?.toUpperCase()} Member
            </CardTitle>
            <p className="text-white/80 text-sm">{account.user_email}</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-lg font-bold px-4 py-2">
            {account.points_balance?.toLocaleString() || 0} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span className="text-white/90">Redemption Value:</span>
          </div>
          <span className="font-semibold">₱{redemptionValue.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-white/90">Lifetime Points:</span>
          </div>
          <span className="font-semibold">{account.lifetime_points?.toLocaleString() || 0}</span>
        </div>

        {nextTier && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-white/90 mb-2">
              <span>{pointsToNext.toLocaleString()} points to {nextTier.name}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
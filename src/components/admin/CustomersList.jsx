import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, Phone, Crown, Star, TrendingUp, Plane, Hotel, MapPin } from "lucide-react";

const tierColors = {
  platinum: "bg-purple-100 text-purple-700",
  gold: "bg-yellow-100 text-yellow-700",
  silver: "bg-slate-100 text-slate-600",
  bronze: "bg-amber-100 text-amber-700",
};

const tierIcon = {
  platinum: "💎",
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

export default function CustomersList() {
  const [users, setUsers] = useState([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState({});
  const [bookingCounts, setBookingCounts] = useState({});
  const [totalSpending, setTotalSpending] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, loyaltyData, flightBookings, hotelBookings, tourBookings] = await Promise.all([
      base44.entities.User.list("-created_date", 200),
      base44.entities.LoyaltyAccount.list("-lifetime_points", 200),
      base44.entities.FlightBooking.list("-created_date", 500),
      base44.entities.HotelBooking.list("-created_date", 500),
      base44.entities.Booking.list("-created_date", 500),
    ]);

    // Map loyalty by email
    const loyaltyMap = {};
    loyaltyData.forEach((l) => { loyaltyMap[l.user_email] = l; });

    // Count bookings and spending per email
    const counts = {};
    const spending = {};
    const allBookings = [
      ...flightBookings.map(b => ({ email: b.passenger_email, amount: b.total_price || 0 })),
      ...hotelBookings.map(b => ({ email: b.guest_email, amount: b.total_price || 0 })),
      ...tourBookings.map(b => ({ email: b.customer_email, amount: b.total_price || 0 })),
    ];

    allBookings.forEach(({ email, amount }) => {
      if (!email) return;
      counts[email] = (counts[email] || 0) + 1;
      spending[email] = (spending[email] || 0) + amount;
    });

    setUsers(usersData);
    setLoyaltyAccounts(loyaltyMap);
    setBookingCounts(counts);
    setTotalSpending(spending);
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Customers
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">{users.length} registered customers</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500 text-xs uppercase">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Loyalty Tier</th>
                <th className="pb-3 font-medium">Points</th>
                <th className="pb-3 font-medium">Total Bookings</th>
                <th className="pb-3 font-medium">Total Spending</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const loyalty = loyaltyAccounts[user.email];
                const tier = loyalty?.tier || "bronze";
                const points = loyalty?.points_balance || 0;
                const lifetimePoints = loyalty?.lifetime_points || 0;
                const bookings = bookingCounts[user.email] || 0;
                const spent = totalSpending[user.email] || 0;

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.full_name || "—"}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={`${tierColors[tier]} border-0 text-xs`}>
                        {tierIcon[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-800">{points.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{lifetimePoints.toLocaleString()} lifetime</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Plane className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="font-semibold text-slate-800">{bookings}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-green-700">
                        ₱{spent.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">
                        {user.role || "user"}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {user.created_date ? new Date(user.created_date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">No customers found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
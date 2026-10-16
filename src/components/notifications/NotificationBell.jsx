import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const queryClient = useQueryClient();
  
  // Audio instance for notification sound
  const notificationSound = React.useRef(null);
  
  useEffect(() => {
    // Create audio element for notification sound
    notificationSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==');
    notificationSound.current.volume = 0.5;
  }, []);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 45000, // Cache for 45 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Play sound when new notification arrives
  useEffect(() => {
    if (notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      // New notification received
      if (notificationSound.current) {
        notificationSound.current.play().catch(e => console.log('Sound play failed:', e));
      }
    }
    setLastNotificationCount(notifications.length);
  }, [notifications.length]);

  const getNotificationIcon = (type, bookingType) => {
    const bookingTypeIcons = {
      flight: "✈️",
      hotel: "🏨",
      tour: "🗺️",
      ferry: "⛴️",
      bus: "🚌",
      car_rental: "🚗",
      visa: "🛂",
      cruise: "🚢",
      train: "🚆",
      package: "📦",
      insurance: "🛡️",
      digital: "🛍️",
      reservation: "📋",
    };
    const typeIcons = {
      booking_created: "🎫",
      booking_confirmed: "✅",
      booking_completed: "🎉",
      booking_cancelled: "❌",
      booking_updated: "📝",
      payment_confirmed: "💳",
      payment_failed: "⚠️",
      refund_processed: "💰",
      supplier_payment_done: "💸",
      checkout_payment: "🧾",
      reservation_confirmed: "📋",
      reservation_cancelled: "❌",
      reservation_updated: "📝",
      order_created: "🛍️",
      order_completed: "✅",
      order_shipped: "📧",
      order_cancelled: "❌",
      info: "ℹ️",
    };
    return bookingTypeIcons[bookingType] || typeIcons[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    if (type?.includes("cancelled") || type === "payment_failed") return "text-red-500";
    if (type?.includes("confirmed") || type?.includes("completed") || type === "payment_confirmed") return "text-green-500";
    if (type?.includes("created") || type === "checkout_payment" || type === "order_created") return "text-amber-500";
    if (type?.includes("updated") || type === "order_shipped") return "text-blue-500";
    return "text-slate-500";
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">{getNotificationIcon(notification.type, notification.booking_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 whitespace-pre-line">{notification.message}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                          </span>
                          {notification.booking_type && (
                            <Badge variant="outline" className={`text-[10px] capitalize ${getNotificationColor(notification.type)}`}>
                              {notification.booking_type.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            View →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
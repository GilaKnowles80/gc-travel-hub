import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const STATUS_VARIANT = {
  synced: "default",
  pending: "secondary",
  failed: "destructive",
  skipped: "outline",
};

export default function PassengerCalendarList() {
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["passenger-calendar-records"],
    queryFn: () => base44.entities.PassengerCalendar.list("-last_synced_at"),
  });

  const syncMutation = useMutation({
    mutationFn: async (rec) => {
      const fn =
        rec.booking_type === "flight"
          ? "addFlightToGoogleCalendar"
          : "addTourToGoogleCalendar";
      return base44.functions.invoke(fn, { booking_id: rec.booking_id });
    },
    onMutate: (rec) => setSyncingId(rec.id),
    onSuccess: (data) => {
      toast.success(
        data?.success ? "Synced to Google Calendar" : "Sync attempted — check status"
      );
      queryClient.invalidateQueries(["passenger-calendar-records"]);
    },
    onError: (e) => toast.error(e.message || "Sync failed"),
    onSettled: () => setSyncingId(null),
  });

  const syncedCount = records.filter((r) => r.status === "synced").length;
  const pendingCount = records.filter(
    (r) => r.status === "pending" || r.status === "failed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-600" />
            Passenger Calendar Sync
          </h1>
          <p className="text-slate-600">
            Automated Google Calendar records per confirmed flight &amp; tour booking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Total Records</p>
              <p className="text-3xl font-bold">{records.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Synced</p>
              <p className="text-3xl font-bold text-green-600">{syncedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-1">Pending / Failed</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Passenger Calendar Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-center text-slate-500 py-12">
                No calendar records yet. Records are created automatically when a
                flight or tour booking is confirmed.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Passenger</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Event</th>
                      <th className="text-left p-3">Start</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-left p-3">Last Synced</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm">
                          <div className="font-medium text-slate-900">
                            {rec.passenger_name || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {rec.passenger_email || ""}
                          </div>
                        </td>
                        <td className="p-3 text-sm capitalize">{rec.booking_type}</td>
                        <td className="p-3 text-sm max-w-xs truncate">
                          {rec.event_title || "—"}
                        </td>
                        <td className="p-3 text-sm">
                          {rec.event_start
                            ? moment(rec.event_start).format("MMM D, YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={STATUS_VARIANT[rec.status] || "outline"}>
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-slate-500">
                          {rec.last_synced_at
                            ? moment(rec.last_synced_at).format("MMM D, YYYY HH:mm")
                            : "—"}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            {rec.google_event_link && (
                              <a
                                href={rec.google_event_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={syncingId === rec.id}
                              onClick={() => syncMutation.mutate(rec)}
                            >
                              {syncingId === rec.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
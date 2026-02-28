import React from "react";
import { Clock } from "lucide-react";

export default function FlightDurationDisplay({ durationHours }) {
  if (!durationHours) return null;

  const hours = Math.floor(durationHours);
  const minutes = Math.round((durationHours - hours) * 60);

  return (
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
      <Clock className="w-3 h-3" />
      {hours}h {minutes > 0 ? `${minutes}m` : ''}
    </div>
  );
}
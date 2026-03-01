import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function SeatAvailabilityIndicator({ seatsAvailable, isLimited = false, isSoldOut = false }) {
  if (isSoldOut) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-xs font-semibold text-red-700">SOLD OUT</span>
      </div>
    );
  }

  if (isLimited) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg animate-pulse">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">
          Only {seatsAvailable} left
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
      <Check className="w-4 h-4 text-green-600" />
      <span className="text-xs font-semibold text-green-700">
        {seatsAvailable} seats available
      </span>
    </div>
  );
}
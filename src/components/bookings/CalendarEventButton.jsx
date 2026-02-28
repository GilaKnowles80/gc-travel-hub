import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarEventButton({ booking, type }) {
  // Show for tour and hotel bookings only
  if (!['tour', 'hotel'].includes(type)) return null;

  // Only show if calendar event exists
  if (!booking.calendar_event_id) return null;

  const handleOpenCalendar = () => {
    // Opens Google Calendar in a new tab
    window.open(`https://calendar.google.com/calendar/u/0/r`, '_blank');
  };

  return (
    <Button
      onClick={handleOpenCalendar}
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
    >
      <Calendar className="w-3 h-3" />
      View in Calendar
    </Button>
  );
}
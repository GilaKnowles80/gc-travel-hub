import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CalendarEventButton({ booking, type, airlineName }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCalendar = async () => {
    if (type === 'flight') {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('addFlightToGoogleCalendar', {
          booking,
          airlineName: airlineName || 'Flight'
        });

        if (response.data?.success) {
          toast.success('Flight added to Google Calendar with 2-day reminder');
        } else {
          toast.error(response.data?.message || 'Failed to add to calendar');
        }
      } catch (error) {
        console.error('Calendar error:', error);
        toast.error('Error adding to calendar');
      } finally {
        setLoading(false);
      }
      return;
    }

    // For tour and hotel, just open calendar
    window.open(`https://calendar.google.com/calendar/u/0/r`, '_blank');
  };

  // Show for flight, tour, and hotel bookings
  if (!['flight', 'tour', 'hotel'].includes(type)) return null;

  return (
    <Button
      onClick={handleAddToCalendar}
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
      disabled={loading}
    >
      <Calendar className="w-3 h-3" />
      {loading ? 'Adding...' : type === 'flight' ? 'Add to Calendar' : 'View Calendar'}
    </Button>
  );
}
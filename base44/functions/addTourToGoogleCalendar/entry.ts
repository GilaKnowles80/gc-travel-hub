import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id required' }, { status: 400 });
    }

    // Fetch tour booking details
    const booking = await base44.asServiceRole.entities.TourBooking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Fetch tour details
    const tour = await base44.asServiceRole.entities.Tour.get(booking.tour_id);
    if (!tour) {
      return Response.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Build event details
    const startDate = booking.departure_date || tour.departure_dates?.[0] || new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date(startDate).getTime() + tour.duration_days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const event = {
      summary: `${tour.title} - Tour Booking`,
      description: `Tour Booking #${booking_id}\n\nClient: ${booking.client_name}\nEmail: ${booking.client_email}\nPhone: ${booking.client_phone}\n\n${tour.description || ''}`,
      start: { date: startDate },
      end: { date: endDate },
      location: tour.destination,
      attendees: [{ email: booking.client_email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // 1 day before
          { method: 'notification', minutes: 60 } // 1 hour before
        ]
      }
    };

    // Create event in Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Calendar error:', error);
      return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    const calendarEvent = await response.json();

    // Update booking with calendar event ID
    await base44.asServiceRole.entities.TourBooking.update(booking_id, {
      calendar_event_id: calendarEvent.id
    });

    return Response.json({ success: true, event_id: calendarEvent.id });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
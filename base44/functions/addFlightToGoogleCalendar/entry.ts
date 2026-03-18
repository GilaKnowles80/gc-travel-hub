import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking, airlineName } = await req.json();

    if (!booking || !booking.departure_time) {
      return Response.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    // Get Google Calendar connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    if (!accessToken) {
      return Response.json(
        { error: 'Google Calendar not connected', message: 'Please authorize Google Calendar in settings' },
        { status: 503 }
      );
    }

    const departureDate = new Date(booking.departure_time);
    const reminderDate = new Date(departureDate);
    reminderDate.setDate(reminderDate.getDate() - 2);

    // Format times for Google Calendar API (RFC 3339)
    const startTime = departureDate.toISOString();
    const endTime = new Date(departureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hour flight duration

    const eventBody = {
      summary: `Flight ${booking.flight_number} - ${airlineName || 'Flight Booking'}`,
      description: `Booking Reference: ${booking.supplier_reference || 'N/A'}\nRoute: ${booking.route}\nPassengers: ${booking.number_of_passengers || 1}\nCabin: ${booking.cabin_class}`,
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Manila'
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Manila'
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'email',
            minutes: 2880 // 2 days = 2880 minutes
          },
          {
            method: 'popup',
            minutes: 60 // Also popup 1 hour before
          }
        ]
      },
      location: `${booking.route}`,
      attendees: [
        {
          email: user.email,
          responseStatus: 'accepted'
        }
      ]
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API error:', errorData);
      return Response.json(
        { error: 'Failed to create calendar event', details: errorData },
        { status: response.status }
      );
    }

    const event = await response.json();

    // Log analytics
    await base44.analytics.track({
      eventName: 'flight_added_to_calendar',
      properties: {
        flight_number: booking.flight_number,
        departure_date: booking.departure_time,
        user_email: user.email,
        calendar_event_id: event.id
      }
    });

    return Response.json({
      success: true,
      message: 'Flight added to Google Calendar with 2-day reminder',
      event_id: event.id,
      event_link: event.htmlLink
    });

  } catch (error) {
    console.error('Calendar error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
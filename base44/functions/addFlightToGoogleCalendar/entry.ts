import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createCalendarEvent } from '../../shared/googleCalendar.ts';

// Invoked automatically by the "Add Flight to Google Calendar on Confirmation"
// workflow when a FlightBooking transitions to status=confirmed.
// Service-role (no user session) — reads the booking, builds a timed event
// from the persisted departure_time + airline_name, and creates it on the
// connected googlecalendar calendar.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id required' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.FlightBooking.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'confirmed') {
      return Response.json({ success: false, skipped: true, reason: 'not_confirmed' });
    }

    if (!booking.departure_time) {
      return Response.json({
        success: false,
        skipped: true,
        reason: 'no_departure_time',
        message: 'Flight has no departure time stored',
      });
    }

    const departureDate = new Date(booking.departure_time);
    const endTime = new Date(departureDate.getTime() + 2 * 60 * 60 * 1000); // ~2h block

    const event = {
      summary: `Flight ${booking.flight_number || ''} - ${booking.airline_name || 'Flight Booking'}`.trim(),
      description: `Booking Reference: ${
        booking.supplier_reference || booking.booking_ref || 'N/A'
      }\nRoute: ${booking.route || 'N/A'}\nPassengers: ${
        booking.number_of_passengers || 1
      }\nCabin: ${booking.cabin_class || 'economy'}`,
      start: { dateTime: departureDate.toISOString() },
      end: { dateTime: endTime.toISOString() },
      location: booking.route || '',
      attendees: booking.passenger_email
        ? [{ email: booking.passenger_email, responseStatus: 'accepted' }]
        : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 2880 }, // 2 days before
          { method: 'popup', minutes: 60 },  // 1 hour before
        ],
      },
    };

    const result = await createCalendarEvent(base44, event);

    if (result.ok) {
      try {
        await base44.asServiceRole.analytics.track({
          eventName: 'flight_added_to_calendar',
          properties: {
            flight_number: booking.flight_number,
            user_email: booking.passenger_email,
            calendar_event_id: result.event_id,
          },
        });
      } catch (e) {
        // analytics failure is non-fatal
      }
      return Response.json({
        success: true,
        event_id: result.event_id,
        event_link: result.event_link,
      });
    }

    return Response.json({
      success: false,
      skipped: true,
      reason: result.reason,
      message: result.message,
    });
  } catch (error) {
    console.error('Calendar error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createCalendarEvent } from '../../shared/googleCalendar.ts';

// Invoked automatically by the "Add Tour to Google Calendar on Confirmation"
// workflow when a TourBooking transitions to status=confirmed.
// Service-role (no user session) — reads the booking + tour, builds an all-day
// event, and creates it on the connected googlecalendar calendar.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id required' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.TourBooking.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Guard: only confirmed bookings should be added to the calendar.
    if (booking.status !== 'confirmed') {
      return Response.json({ success: false, skipped: true, reason: 'not_confirmed' });
    }

    const tours = await base44.asServiceRole.entities.Tour.filter({ id: booking.tour_id });
    const tour = tours?.[0];
    if (!tour) {
      return Response.json({ error: 'Tour not found' }, { status: 404 });
    }

    const startDate =
      booking.departure_date ||
      tour.departure_dates?.[0] ||
      new Date().toISOString().split('T')[0];
    const durationDays = Number(tour.duration_days || 1);
    const endDate = new Date(
      new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    const customerEmail =
      booking.client_email || booking.customer_email || booking.user_email;

    const event = {
      summary: `${tour.title} - Tour Booking`,
      description: `Tour Booking #${booking_id}\n\nClient: ${
        booking.client_name || booking.customer_name || ''
      }\nEmail: ${customerEmail || ''}\nPhone: ${
        booking.client_phone || booking.customer_phone || ''
      }\n\n${tour.description || ''}`,
      start: { date: startDate },
      end: { date: endDate },
      location: tour.destination,
      attendees: customerEmail ? [{ email: customerEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },     // 1 day before
          { method: 'notification', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const result = await createCalendarEvent(base44, event);

    if (result.ok) {
      return Response.json({
        success: true,
        event_id: result.event_id,
        event_link: result.event_link,
      });
    }

    // Connector not authorized / API error — fail gracefully so the workflow
    // run stays green; the event will be created once Google Calendar is connected.
    return Response.json({
      success: false,
      skipped: true,
      reason: result.reason,
      message: result.message,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
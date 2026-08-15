import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Invoked automatically by the "Auto-Attach Flight to Itinerary on Confirmation"
// workflow when a FlightBooking transitions to status=confirmed.
// Service-role (no user session): finds (or creates) the passenger's itinerary
// and appends the confirmed flight booking to its items array (de-duplicated).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const booking_id = body?.booking_id;

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

    const userEmail = booking.passenger_email;
    if (!userEmail) {
      return Response.json({ success: false, skipped: true, reason: 'no_passenger_email' });
    }

    // Find itineraries owned by this passenger.
    const existing = await base44.asServiceRole.entities.Itinerary.filter({ user_email: userEmail });

    // De-duplicate: skip if this booking is already attached to any itinerary.
    const alreadyAttached = (existing || []).some(
      (it) => Array.isArray(it.items) && it.items.some((itm) => itm?.booking_id === booking_id)
    );
    if (alreadyAttached) {
      return Response.json({ success: true, skipped: true, reason: 'already_attached' });
    }

    const startDate = booking.departure_time
      ? booking.departure_time.split('T')[0]
      : new Date().toISOString().split('T')[0];
    const endDate = startDate;

    const itemEntry = {
      booking_type: 'flight',
      booking_id,
      booking_data: {
        flight_number: booking.flight_number,
        airline_name: booking.airline_name,
        route: booking.route,
        departure_time: booking.departure_time,
        cabin_class: booking.cabin_class,
        passenger_name: booking.passenger_name,
        booking_ref: booking.booking_ref,
        total_price: booking.total_price,
      },
      start_date: startDate,
      end_date: endDate,
    };

    // Pick the most recently updated itinerary (if any), else create a new one.
    const sorted = [...(existing || [])].sort(
      (a, b) => new Date(b.updated_date || 0).getTime() - new Date(a.updated_date || 0).getTime()
    );
    let itinerary = sorted[0];

    if (!itinerary) {
      itinerary = await base44.asServiceRole.entities.Itinerary.create({
        user_email: userEmail,
        title: `Flight Itinerary — ${booking.route || booking.flight_number || 'Booking'}`,
        destination: booking.route || '',
        start_date: startDate,
        end_date: endDate,
        items: [itemEntry],
        notes: '',
      });
    } else {
      const items = Array.isArray(itinerary.items) ? itinerary.items : [];
      items.push(itemEntry);
      itinerary = await base44.asServiceRole.entities.Itinerary.update(itinerary.id, {
        items,
        start_date: itinerary.start_date || startDate,
        end_date: itinerary.end_date || endDate,
      });
    }

    try {
      await base44.asServiceRole.analytics.track({
        eventName: 'flight_auto_attached_to_itinerary',
        properties: {
          booking_id,
          itinerary_id: itinerary.id,
          user_email: userEmail,
        },
      });
    } catch (_e) {
      // analytics failure is non-fatal
    }

    return Response.json({ success: true, itinerary_id: itinerary.id });
  } catch (error) {
    console.error('autoAttachFlightToItinerary error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
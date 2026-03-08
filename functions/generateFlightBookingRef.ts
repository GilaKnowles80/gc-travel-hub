import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all flight bookings sorted by created_date ascending to count them
    const bookings = await base44.asServiceRole.entities.FlightBooking.list('created_date');

    // Count existing refs to determine next number
    const refsWithNumber = bookings
      .map(b => b.booking_ref)
      .filter(r => r && r.startsWith('FB-'))
      .map(r => parseInt(r.replace('FB-', ''), 10))
      .filter(n => !isNaN(n));

    const nextNum = refsWithNumber.length > 0 ? Math.max(...refsWithNumber) + 1 : 1;
    const booking_ref = `FB-${String(nextNum).padStart(4, '0')}`;

    return Response.json({ booking_ref });
  } catch (error) {
    console.error('generateFlightBookingRef error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
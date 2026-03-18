import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightId, numSeats, holdDurationMinutes = 15 } = await req.json();

    if (!flightId || !numSeats) {
      return Response.json({ error: 'flightId and numSeats required' }, { status: 400 });
    }

    // Create hold record in database
    const holdExpiry = new Date();
    holdExpiry.setMinutes(holdExpiry.getMinutes() + holdDurationMinutes);

    // In production, this would lock seats in the supplier system
    const reservation = {
      id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      flight_id: flightId,
      user_email: user.email,
      seats_held: numSeats,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: holdExpiry.toISOString(),
      hold_type: 'seat_hold'
    };

    // Log the hold
    await base44.asServiceRole.entities.FlightBooking.create({
      flight_id: flightId,
      passenger_name: user.full_name,
      passenger_email: user.email,
      status: 'pending',
      number_of_passengers: numSeats,
      trip_type: 'one_way'
    });

    return Response.json({ 
      success: true, 
      reservation,
      message: `${numSeats} seats reserved for ${holdDurationMinutes} minutes`
    });
  } catch (error) {
    console.error('Reserve seats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
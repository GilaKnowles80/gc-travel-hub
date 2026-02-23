import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin_terminal, destination_terminal, departure_date, passengers } = await req.json();

    if (!origin_terminal || !destination_terminal || !departure_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Search buses in database
    const buses = await base44.entities.Bus.filter({
      origin_terminal,
      destination_terminal,
      status: 'active'
    });

    // Filter by date and availability
    const departureDay = new Date(departure_date).toISOString().split('T')[0];
    const availableBuses = buses.filter(bus => {
      const busDay = bus.departure_time.split('T')[0];
      return busDay === departureDay && (bus.seats_available || 0) >= (passengers || 1);
    });

    return Response.json({ 
      success: true, 
      buses: availableBuses,
      count: availableBuses.length
    });

  } catch (error) {
    console.error('Bus search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
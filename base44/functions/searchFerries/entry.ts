import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin_port, destination_port, departure_date, passengers } = await req.json();

    if (!origin_port || !destination_port || !departure_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Search ferries in database
    const ferries = await base44.entities.Ferry.filter({
      origin_port,
      destination_port,
      status: 'active'
    });

    // Filter by date and availability
    const departureDay = new Date(departure_date).toISOString().split('T')[0];
    const availableFerries = ferries.filter(ferry => {
      const ferryDay = ferry.departure_time.split('T')[0];
      return ferryDay === departureDay && (ferry.seats_available || 0) >= (passengers || 1);
    });

    return Response.json({ 
      success: true, 
      ferries: availableFerries,
      count: availableFerries.length
    });

  } catch (error) {
    console.error('Ferry search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
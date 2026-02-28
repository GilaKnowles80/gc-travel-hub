import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Tripzynx is a tour management platform - we search our own Tour entity
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destination, category, departure_date, travelers } = await req.json();

    console.log('Tripzynx tour search:', { destination, category, departure_date, travelers });

    // Build filter for Tour entity
    const filter = { status: 'active' };
    if (destination) filter.destination = destination;
    if (category) filter.category = category;

    const tours = await base44.asServiceRole.entities.Tour.filter(filter, '-rating', 50);

    // Filter by departure date if provided
    let filtered = tours;
    if (departure_date) {
      filtered = tours.filter(tour => 
        !tour.departure_dates?.length || 
        tour.departure_dates.some(d => d >= departure_date)
      );
    }

    console.log(`Found ${filtered.length} tours for destination: ${destination || 'any'}`);

    return Response.json({
      success: true,
      supplier: 'tripzynx',
      results: filtered,
      total: filtered.length
    });

  } catch (error) {
    console.error('Tripzynx search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightIata, flightIcao, departureIata, arrivalIata } = await req.json();
    
    if (!flightIata && !flightIcao) {
      return Response.json({ error: 'Flight IATA or ICAO code required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('AVIATION_EDGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Aviation Edge API key not configured' }, { status: 500 });
    }

    // Fetch real-time flight status
    const url = new URL('https://api.aviationedge.com/v2/flightsDetail');
    url.searchParams.append('key', apiKey);
    
    if (flightIata) url.searchParams.append('flightIata', flightIata);
    if (flightIcao) url.searchParams.append('flightIcao', flightIcao);
    if (departureIata) url.searchParams.append('departureIata', departureIata);
    if (arrivalIata) url.searchParams.append('arrivalIata', arrivalIata);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Aviation Edge status API error: ${response.status} ${response.statusText}`);
      return Response.json({ error: 'Failed to fetch flight status' }, { status: 500 });
    }

    const statusData = await response.json();
    
    // Transform to app format
    const flightStatus = statusData.map((flight) => ({
      flight_number: flight.flight?.iata || 'N/A',
      airline: flight.airline?.name,
      status: flight.status,
      departure: {
        iata: flight.departure?.iata,
        scheduled: flight.departure?.scheduled,
        actual: flight.departure?.actual,
        gate: flight.departure?.gate,
        terminal: flight.departure?.terminal,
      },
      arrival: {
        iata: flight.arrival?.iata,
        scheduled: flight.arrival?.scheduled,
        actual: flight.arrival?.actual,
        gate: flight.arrival?.gate,
        terminal: flight.arrival?.terminal,
      },
      aircraft: flight.aircraft?.iataCode,
      lastUpdated: new Date().toISOString(),
    }));

    return Response.json({ 
      flightStatus, 
      source: 'Aviation Edge',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Aviation Edge status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
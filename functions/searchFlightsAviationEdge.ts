import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departureDate, returnDate, adults = 1, cabin = 'economy' } = await req.json();
    
    if (!origin || !destination || !departureDate) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const apiKey = Deno.env.get('AVIATION_EDGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Aviation Edge API key not configured' }, { status: 500 });
    }

    // Fetch flight data from Aviation Edge
    const url = new URL('https://api.aviationedge.com/v2/flights');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('departureIata', origin);
    url.searchParams.append('arrivalIata', destination);
    url.searchParams.append('status', 'active');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Aviation Edge API error: ${response.status} ${response.statusText}`);
      return Response.json({ error: 'Failed to fetch flight data' }, { status: 500 });
    }

    const flightData = await response.json();
    
    // Transform Aviation Edge data to app format
    const flights = (flightData || []).map((flight, idx) => ({
      id: `aviationedge_${idx}`,
      source: 'Aviation Edge',
      airline_name: flight.airline?.name || 'Unknown Airline',
      flight_number: flight.flight?.iata || 'N/A',
      origin: flight.departure?.iata || origin,
      destination: flight.arrival?.iata || destination,
      departure_time: flight.departure?.scheduled,
      arrival_time: flight.arrival?.scheduled,
      aircraft_type: flight.aircraft?.iataCode || 'Unknown',
      status: flight.status || 'active',
      is_direct: !flight.stopovers || flight.stopovers.length === 0,
      stops: flight.stopovers?.length || 0,
      price: 0, // Aviation Edge doesn't provide pricing
      cabin_classes: [{ class: cabin, price: 0, seats_available: 9 }],
      baggage_allowance: 'Check with airline',
      amenities: ['Real-time status tracking'],
    }));

    return Response.json({ flights, source: 'Aviation Edge' });
  } catch (error) {
    console.error('Aviation Edge search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
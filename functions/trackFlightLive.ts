import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Real-time flight tracking via Aviation Edge
// Returns live position, altitude, speed, and status

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightNumber, airline } = await req.json();

    if (!flightNumber) {
      return Response.json({ error: 'Missing flightNumber parameter' }, { status: 400 });
    }

    const apiKey = Deno.env.get('AVIATION_EDGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Aviation Edge API key not configured' }, { status: 500 });
    }

    // Query Aviation Edge for live flight tracking
    const url = `https://aviation-edge.com/v2/public/flights?key=${apiKey}${flightNumber ? `&flightNumber=${flightNumber}` : ''}${airline ? `&airlineIata=${airline}` : ''}`;

    console.log(`[FLIGHT TRACKING] Fetching live data for ${flightNumber}`);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error(`[FLIGHT TRACKING] API error: ${response.status}`);
      return Response.json({ error: 'Failed to fetch flight tracking data' }, { status: response.status });
    }

    const data = await response.json();

    // Handle array or single object response
    const flights = Array.isArray(data) ? data : [data];
    
    if (!flights || flights.length === 0) {
      return Response.json({ error: 'Flight not found' }, { status: 404 });
    }

    // Transform to app format
    const trackingData = flights.map(flight => ({
      flight: {
        number: flight.flight?.iataNumber || flight.flight?.number,
        icao: flight.flight?.icaoNumber
      },
      airline: {
        iata: flight.airline?.iataCode,
        icao: flight.airline?.icaoCode
      },
      aircraft: {
        iata: flight.aircraft?.iataCode,
        icao: flight.aircraft?.icaoCode,
        registration: flight.aircraft?.regNumber
      },
      departure: {
        airport: flight.departure?.iataCode,
        icao: flight.departure?.icaoCode
      },
      arrival: {
        airport: flight.arrival?.iataCode,
        icao: flight.arrival?.icaoCode
      },
      location: {
        latitude: flight.geography?.latitude,
        longitude: flight.geography?.longitude,
        altitude: flight.geography?.altitude,
        direction: flight.geography?.direction
      },
      speed: {
        horizontal: flight.speed?.horizontal,
        vertical: flight.speed?.vspeed,
        isGround: flight.speed?.isGround === 1
      },
      status: flight.status,
      lastUpdated: new Date(flight.system?.updated * 1000).toISOString()
    }));

    console.log(`[FLIGHT TRACKING] Found ${trackingData.length} matching flight(s)`);

    return Response.json({
      success: true,
      tracking: trackingData[0],
      source: 'aviation_edge'
    });

  } catch (error) {
    console.error('[FLIGHT TRACKING ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
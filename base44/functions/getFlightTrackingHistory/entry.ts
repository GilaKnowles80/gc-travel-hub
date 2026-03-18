import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Get historical flight tracking data with complete flight path
// Returns all position updates from departure to arrival

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightNumber, departureAirport, departureDate, aircraftReg } = await req.json();

    if (!departureDate && !flightNumber) {
      return Response.json({ error: 'Missing required parameters: flightNumber or departureDate' }, { status: 400 });
    }

    const apiKey = Deno.env.get('AVIATION_EDGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Aviation Edge API key not configured' }, { status: 500 });
    }

    // Build query parameters
    const params = new URLSearchParams({ key: apiKey });
    if (flightNumber) params.append('flightIata', flightNumber);
    if (departureAirport) params.append('depIata', departureAirport);
    if (departureDate) params.append('depDate', departureDate);
    if (aircraftReg) params.append('regNum', aircraftReg);

    const url = `https://aviation-edge.com/v2/public/flight_track_history?${params.toString()}`;

    console.log(`[FLIGHT HISTORY] Fetching tracking history for ${flightNumber || aircraftReg}`);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[FLIGHT HISTORY] API error:`, errorData);
      return Response.json({ error: 'Failed to fetch flight history', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return Response.json({ error: 'No flight history found' }, { status: 404 });
    }

    // Transform first matching flight
    const flightData = data[0];
    const positions = flightData.flightPositions || [];

    const transformed = {
      flight: {
        number: flightData.flight?.iataNumber,
        icao: flightData.flight?.icaoNumber
      },
      airline: {
        iata: flightData.airline?.iataCode,
        icao: flightData.airline?.icaoCode
      },
      aircraft: {
        icao: flightData.aircraft?.icaoCode,
        registration: flightData.aircraft?.regNumber,
        icao24: flightData.aircraft?.icao24
      },
      departure: {
        airport: flightData.departure?.iataNumber,
        icao: flightData.departure?.icaoNumber,
        scheduled: flightData.departure?.scheduledTime
      },
      arrival: {
        airport: flightData.arrival?.iataNumber,
        icao: flightData.arrival?.icaoNumber,
        scheduled: flightData.arrival?.scheduledTime
      },
      status: flightData.status,
      totalPositions: positions.length,
      path: positions.map(pos => ({
        latitude: parseFloat(pos.latitude),
        longitude: parseFloat(pos.longitude),
        altitude: parseFloat(pos.altitude),
        speed: parseFloat(pos.horizontal_speed),
        direction: parseFloat(pos.direction),
        vspeed: parseFloat(pos.vspeed),
        isGround: pos.isGround === 1,
        timestamp: new Date(pos.updated * 1000).toISOString()
      })),
      duration: positions.length > 0 
        ? new Date(positions[positions.length - 1].updated * 1000 - positions[0].updated * 1000).getTime() / (1000 * 60)
        : 0
    };

    console.log(`[FLIGHT HISTORY] Found ${positions.length} position updates`);

    return Response.json({
      success: true,
      flight: transformed,
      source: 'aviation_edge'
    });

  } catch (error) {
    console.error('[FLIGHT HISTORY ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
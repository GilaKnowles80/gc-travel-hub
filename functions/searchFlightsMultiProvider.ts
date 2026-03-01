import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Multi-provider flight search: Duffel + Aviation Edge
// Combines results from both providers to maximize airline coverage
// Priority: Duffel (premium), Aviation Edge (budget carriers like AirAsia, Cebu Pacific, Tiger)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departureDate, returnDate, adults = 1, cabinClass = 'economy' } = await req.json();

    if (!origin || !destination || !departureDate) {
      return Response.json({ error: 'Missing required parameters: origin, destination, departureDate' }, { status: 400 });
    }

    const markupPct = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '20') / 100;
    const allFlights = [];
    const flightMap = new Map(); // Deduplication by route + price

    // 1. Try Duffel (primary - premium carriers)
    console.log('[MULTI-PROVIDER] Starting Duffel search...');
    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    let duffelFlights = [];

    if (duffelApiKey) {
      try {
        const duffelResp = await fetch('http://localhost:8000/searchFlightsDuffel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, destination, departureDate, returnDate, adults, cabinClass })
        });

        if (duffelResp.ok) {
          const duffelData = await duffelResp.json();
          duffelFlights = (duffelData.offers || []).map((offer, idx) => ({
            id: `duffel_${idx}`,
            airline_name: offer.owner.name,
            flight_number: offer.slices[0]?.segments[0]?.operating_carrier_flight_number || 'N/A',
            origin: offer.slices[0]?.origin.iata_code,
            destination: offer.slices[0]?.destination.iata_code,
            departure_time: offer.slices[0]?.segments[0]?.departing_at,
            arrival_time: offer.slices[0]?.segments[offer.slices[0].segments.length - 1]?.arriving_at,
            duration_hours: (new Date(offer.slices[0]?.segments[offer.slices[0].segments.length - 1]?.arriving_at) - new Date(offer.slices[0]?.segments[0]?.departing_at)) / (1000 * 60 * 60),
            is_direct: offer.slices[0]?.segments?.length === 1,
            stops: offer.slices[0]?.segments?.length - 1 || 0,
            price: parseFloat((parseFloat(offer.total_amount) * (1 + markupPct)).toFixed(2)),
            currency: offer.total_currency,
            source: 'duffel'
          }));
          console.log(`[MULTI-PROVIDER] Got ${duffelFlights.length} flights from Duffel`);
        }
      } catch (err) {
        console.warn('[MULTI-PROVIDER] Duffel search failed:', err.message);
      }
    }

    // 2. Call Aviation Edge (budget carriers + regional airlines)
    console.log('[MULTI-PROVIDER] Starting Aviation Edge search...');
    let aviationEdgeFlights = [];

    try {
      const aeResp = await base44.functions.invoke('searchFlightsAviationEdge', {
        origin,
        destination,
        departureDate,
        adults,
        cabinClass
      });

      if (aeResp.data?.flights) {
        aviationEdgeFlights = aeResp.data.flights.map((flight, idx) => ({
          id: `ae_${idx}`,
          airline_name: flight.airline_name,
          flight_number: flight.flight_number,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          duration_hours: flight.duration_hours || 0,
          is_direct: flight.is_direct,
          stops: flight.stops || 0,
          price: parseFloat((flight.price * (1 + markupPct)).toFixed(2)),
          currency: 'USD',
          source: 'aviation_edge'
        }));
        console.log(`[MULTI-PROVIDER] Got ${aviationEdgeFlights.length} flights from Aviation Edge`);
      }
    } catch (err) {
      console.warn('[MULTI-PROVIDER] Aviation Edge search failed:', err.message);
    }

    // 3. Combine & deduplicate
    const combineFlights = [...duffelFlights, ...aviationEdgeFlights];
    combineFlights.forEach(flight => {
      const key = `${flight.airline_name}|${flight.flight_number}|${flight.departure_time}`;
      if (!flightMap.has(key)) {
        flightMap.set(key, flight);
      }
    });

    const mergedFlights = Array.from(flightMap.values())
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    console.log(`[MULTI-PROVIDER] Combined: ${mergedFlights.length} unique flights (Duffel: ${duffelFlights.length}, Aviation Edge: ${aviationEdgeFlights.length})`);

    return Response.json({
      success: true,
      offers: mergedFlights,
      search_params: { origin, destination, departureDate, returnDate, adults, cabinClass },
      provider_breakdown: {
        duffel: duffelFlights.length,
        aviation_edge: aviationEdgeFlights.length,
        total_unique: mergedFlights.length
      },
      markup_applied: `${(markupPct * 100).toFixed(0)}%`
    });

  } catch (error) {
    console.error('[MULTI-PROVIDER ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
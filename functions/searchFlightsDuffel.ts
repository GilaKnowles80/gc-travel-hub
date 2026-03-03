import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { origin, destination, departureDate, adults = 1, returnDate } = body;
    const cabin = body.cabin || body.cabinClass || 'economy';

    // Validate required fields
    if (!origin || !destination || !departureDate) {
      return Response.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    const duffelKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelKey) {
      console.error('DUFFEL_API_KEY not found in environment');
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    console.log(`Searching flights: ${origin} → ${destination} on ${departureDate}`);

    // Build Duffel API request
    const duffelPayload = {
      data: {
        slices: [
          {
            origin_airport_iata_code: origin.toUpperCase(),
            destination_airport_iata_code: destination.toUpperCase(),
            departure_date: departureDate,
          },
        ],
        passengers: Array(parseInt(adults)).fill({ type: 'adult' }),
        cabin_class: cabin.toUpperCase() === 'ECONOMY' ? 'economy' : cabin,
      },
    };

    // If return date is provided, add return slice
    if (returnDate) {
      duffelPayload.data.slices.push({
        origin_airport_iata_code: destination.toUpperCase(),
        destination_airport_iata_code: origin.toUpperCase(),
        departure_date: returnDate,
      });
    }

    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${duffelKey}`,
        'Duffel-Version': 'v2',
        'Accept': 'application/json',
      },
      body: JSON.stringify(duffelPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Duffel API error: ${response.status}`, error);
      return Response.json(
        { error: 'Failed to search flights', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawOffers = data.data?.offers || [];
    console.log(`Found ${rawOffers.length} flight offers from Duffel`);

    // Return raw offers so multi-provider can parse slices/segments,
    // AND also return a simplified format for direct use
    const offers = rawOffers.map((offer) => {
      const slice = offer.slices?.[0];
      const segments = slice?.segments || [];
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];
      return {
        id: offer.id,
        owner: offer.owner,
        slices: offer.slices,
        total_amount: offer.total_amount,
        total_currency: offer.total_currency,
        // Simplified fields
        airline_name: offer.owner?.name || 'Unknown',
        flight_number: firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || 'N/A',
        origin: slice?.origin?.iata_code || origin,
        destination: slice?.destination?.iata_code || destination,
        departure_time: firstSeg?.departing_at || slice?.segments?.[0]?.departing_at,
        arrival_time: lastSeg?.arriving_at,
        duration_hours: firstSeg && lastSeg ? Math.round((new Date(lastSeg.arriving_at) - new Date(firstSeg.departing_at)) / (1000 * 60 * 60) * 10) / 10 : null,
        is_direct: segments.length === 1,
        stops: segments.length - 1,
        price: parseFloat(offer.total_amount),
        currency: offer.total_currency || 'USD',
        cabin_class: cabin,
        source: 'duffel',
      };
    });

    return Response.json({
      success: true,
      offers,
      total: offers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Flight search error:', error.message);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});
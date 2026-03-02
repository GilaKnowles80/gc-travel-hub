import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { origin, destination, departureDate, adults = 1, cabin = 'economy', returnDate } = await req.json();

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
        'Duffel-Version': '2024-04',
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
    console.log(`Found ${data.data?.offers?.length || 0} flight offers`);

    // Transform response to standard format
    const offers = (data.data?.offers || []).map((offer) => ({
      id: offer.id,
      airline: offer.owner?.name || 'Unknown',
      departure_time: offer.slices?.[0]?.departure_at,
      arrival_time: offer.slices?.[0]?.arrival_at,
      duration: offer.slices?.[0]?.duration,
      stops: offer.slices?.[0]?.stops?.length || 0,
      total_amount: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      cabin_class: cabin,
    }));

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
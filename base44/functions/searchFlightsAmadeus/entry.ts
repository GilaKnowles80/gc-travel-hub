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

    const amadeusKey = Deno.env.get('AMADEUS_API_KEY');
    const amadeusSecret = Deno.env.get('AMADEUS_API_SECRET');
    const markup = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '15');

    if (!amadeusKey || !amadeusSecret) {
      return Response.json({ error: 'Amadeus credentials not configured' }, { status: 500 });
    }

    // Get access token from Amadeus
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${amadeusKey}&client_secret=${amadeusSecret}`
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return Response.json({ error: 'Failed to get Amadeus token' }, { status: 500 });
    }

    // Search flights on Amadeus
    const flightSearchUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&currencyCode=USD&max=50`;

    const flightResponse = await fetch(flightSearchUrl, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    const flightData = await flightResponse.json();
    const offers = flightData.data || [];

    // Transform Amadeus offers to standard format
    const transformedOffers = offers.map((offer, idx) => {
      const itinerary = offer.itineraries[0];
      const segment = itinerary.segments[0];
      const netPrice = parseFloat(offer.price.total);
      const sellingPrice = netPrice * (1 + markup / 100);

      return {
        id: `amadeus_${idx}`,
        airline_name: segment.operating.carrierCode || 'Amadeus Airlines',
        flight_number: `${segment.operating.carrierCode}${segment.operating.flightNumber}`,
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        departure_time: segment.departure.at,
        arrival_time: segment.arrival.at,
        duration_hours: itinerary.duration.replace('PT', '').replace('H', ''),
        is_direct: itinerary.segments.length === 1,
        stops: Math.max(0, itinerary.segments.length - 1),
        price: Math.round(sellingPrice),
        currency: 'USD',
        cabin_classes: [{ class: cabin, price: Math.round(sellingPrice), seats_available: 10 }],
        source: 'amadeus',
        net_price: netPrice,
        markup_percentage: markup
      };
    });

    return Response.json({ offers: transformedOffers });
  } catch (error) {
    console.error('Amadeus flight search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
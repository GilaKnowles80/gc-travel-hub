import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate = null,
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY',
      nonStop = false,
      maxPrice = null
    } = await req.json();

    // Get AMADEUS token
    const tokenResponse = await base44.functions.invoke('amadeusBearerToken', {});
    const token = tokenResponse.data.token;

    if (!token) {
      throw new Error('Failed to obtain AMADEUS token');
    }

    // Build AMADEUS search request
    const params = new URLSearchParams({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: adults.toString(),
      max: '250'
    });

    if (returnDate) {
      params.append('returnDate', returnDate);
    }
    if (children > 0) {
      params.append('children', children.toString());
    }
    if (infants > 0) {
      params.append('infants', infants.toString());
    }
    if (travelClass && travelClass !== 'ECONOMY') {
      params.append('travelClass', travelClass);
    }
    if (nonStop) {
      params.append('nonStop', 'true');
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice.toString());
    }

    const searchUrl = `https://api.amadeus.com/v2/shopping/flight-offers?${params}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.amadeus+json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'AMADEUS search failed');
    }

    // Transform AMADEUS response to app format
    const transformedFlights = (data.data || []).map((offer, idx) => ({
      id: `amadeus_${idx}`,
      amadeus_id: offer.id,
      airline_name: offer.validatingAirlineCodes[0] || 'Unknown',
      flight_number: offer.itineraries[0]?.segments[0]?.number || '',
      origin: originLocationCode,
      destination: destinationLocationCode,
      departure_time: offer.itineraries[0]?.segments[0]?.departure?.at || '',
      arrival_time: offer.itineraries[0]?.segments[0]?.arrival?.at || '',
      duration_hours: parseDuration(offer.itineraries[0]?.duration),
      is_direct: offer.itineraries[0]?.segments.length === 1,
      stops: offer.itineraries[0]?.segments.length - 1,
      cabin_classes: (offer.travelerPricings || []).map((tp, idx) => ({
        class: travelClass || 'economy',
        price: parseFloat(offer.price?.grandTotal || 0),
        seats_available: 99 // AMADEUS doesn't provide seat count
      })),
      price: parseFloat(offer.price?.grandTotal || 0),
      currency: offer.price?.currency || 'USD',
      amenities: [],
      status: 'active'
    }));

    return Response.json({
      flights: transformedFlights,
      meta: {
        count: transformedFlights.length,
        source: 'amadeus'
      }
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return Response.json({
      error: error.message,
      flights: []
    }, { status: 500 });
  }
});

function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = parseInt(match?.[1] || 0);
  const minutes = parseInt(match?.[2] || 0);
  return hours + (minutes / 60);
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination, departureDate, returnDate, adults = 1, cabinClass = 'economy' } = await req.json();

    if (!origin || !destination || !departureDate) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) {
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    // Create offer request
    const offerRequestBody = {
      data: {
        slices: [
          {
            origin,
            destination,
            departure_date: departureDate
          }
        ],
        passengers: Array(adults).fill({ type: 'adult' }),
        cabin_class: cabinClass
      }
    };

    // Add return slice if roundtrip
    if (returnDate) {
      offerRequestBody.data.slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate
      });
    }

    const offerRequestResponse = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2'
      },
      body: JSON.stringify(offerRequestBody)
    });

    if (!offerRequestResponse.ok) {
      const errorData = await offerRequestResponse.json();
      console.error('Duffel offer request error:', errorData);
      return Response.json({ error: 'Failed to search flights', details: errorData }, { status: offerRequestResponse.status });
    }

    const offerRequest = await offerRequestResponse.json();
    const offerRequestId = offerRequest.data.id;

    // Fetch offers
    const offersResponse = await fetch(`https://api.duffel.com/air/offers?offer_request_id=${offerRequestId}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Duffel-Version': 'v2'
      }
    });

    if (!offersResponse.ok) {
      const errorData = await offersResponse.json();
      console.error('Duffel offers fetch error:', errorData);
      return Response.json({ error: 'Failed to fetch flight offers', details: errorData }, { status: offersResponse.status });
    }

    const offersData = await offersResponse.json();

    return Response.json({
      success: true,
      offers: offersData.data,
      meta: offersData.meta
    });

  } catch (error) {
    console.error('Duffel search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
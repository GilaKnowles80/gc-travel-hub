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

    // Apply markup to all offers (markup % stored in secret, default 15%)
    const markupPct = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '15') / 100;

    const offersWithMarkup = (offersData.data || []).map(offer => {
      const baseAmount = parseFloat(offer.total_amount);
      const markupAmount = baseAmount * markupPct;
      const markedUpAmount = (baseAmount + markupAmount).toFixed(2);
      return {
        ...offer,
        original_amount: offer.total_amount,       // Duffel's actual price (what you pay Duffel)
        original_currency: offer.total_currency,
        total_amount: markedUpAmount,               // Price shown to customer (your price)
        markup_amount: markupAmount.toFixed(2),
        markup_percentage: markupPct * 100
      };
    });

    return Response.json({
      success: true,
      offers: offersWithMarkup,
      meta: offersData.meta
    });

  } catch (error) {
    console.error('Duffel search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
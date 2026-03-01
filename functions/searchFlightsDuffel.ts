import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Phase 2: Search & Price Engine ─────────────────────────────────────────
// Default markup: 20% (configurable via FLIGHT_MARKUP_PERCENTAGE env var)
// Supports: one-way, roundtrip
// Returns: net fares with markup applied (selling price shown to customer)

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

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) {
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    // Build offer request slices
    const slices = [{
      origin,
      destination,
      departure_date: departureDate
    }];

    // Phase 2: Add return slice for roundtrip
    if (returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate
      });
    }

    const offerRequestBody = {
      data: {
        slices,
        passengers: Array(parseInt(adults)).fill({ type: 'adult' }),
        cabin_class: cabinClass
      }
    };

    console.log(`[DUFFEL SEARCH] ${origin}→${destination} | ${departureDate} | Adults: ${adults} | Class: ${cabinClass}`);

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
      console.error('[DUFFEL] Offer request error:', JSON.stringify(errorData));
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
      console.error('[DUFFEL] Offers fetch error:', JSON.stringify(errorData));
      return Response.json({ error: 'Failed to fetch flight offers', details: errorData }, { status: offersResponse.status });
    }

    const offersData = await offersResponse.json();

    // ── Phase 2: Apply Dynamic Markup (default 20%, range 15–30%) ─────────
    const markupPct = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '20') / 100;

    const offersWithMarkup = (offersData.data || []).map(offer => {
      const baseAmount = parseFloat(offer.total_amount);
      const markupAmount = parseFloat((baseAmount * markupPct).toFixed(2));
      const sellingPrice = (baseAmount + markupAmount).toFixed(2);

      // 80/20 split preview for admin
      const supplierCost  = parseFloat((parseFloat(sellingPrice) * 0.80).toFixed(2));
      const agencyRevenue = parseFloat((parseFloat(sellingPrice) * 0.20).toFixed(2));

      return {
        ...offer,
        // Supplier net fare (what GC Travel pays Duffel)
        original_amount: offer.total_amount,
        original_currency: offer.total_currency,
        // Selling price shown to customer (with markup)
        total_amount: sellingPrice,
        total_currency: offer.total_currency,
        // Markup details
        markup_amount: markupAmount.toFixed(2),
        markup_percentage: (markupPct * 100).toFixed(0),
        // Revenue split preview
        revenue_split: {
          supplier_cost: supplierCost,
          agency_revenue: agencyRevenue,
          model: '80/20'
        },
        // Source identifier
        source: 'duffel'
      };
    });

    console.log(`[DUFFEL SEARCH] Returned ${offersWithMarkup.length} offers with ${(markupPct * 100).toFixed(0)}% markup`);

    return Response.json({
      success: true,
      offers: offersWithMarkup,
      meta: offersData.meta,
      search_params: { origin, destination, departureDate, returnDate, adults, cabinClass },
      markup_applied: `${(markupPct * 100).toFixed(0)}%`
    });

  } catch (error) {
    console.error('[DUFFEL SEARCH ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
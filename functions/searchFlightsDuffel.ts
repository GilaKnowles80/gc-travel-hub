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

    // Helper: Retry with exponential backoff
    const fetchWithRetry = async (url, options, maxAttempts = 3) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch(url, options);
          if (response.ok) return response;
          if (response.status === 429) {
            const waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            console.log(`[DUFFEL] Rate limited (429). Retry ${attempt}/${maxAttempts} after ${waitMs}ms`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
          }
          return response;
        } catch (err) {
          if (attempt < maxAttempts) {
            const waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            console.log(`[DUFFEL] Request failed. Retry ${attempt}/${maxAttempts} after ${waitMs}ms`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
          }
          throw err;
        }
      }
    };

    // Create offer request
    const offerRequestResponse = await fetchWithRetry('https://api.duffel.com/air/offer_requests', {
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

    // Poll for offers with backoff
    let offersData = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      const offersResponse = await fetchWithRetry(`https://api.duffel.com/air/offers?offer_request_id=${offerRequestId}&limit=100`, {
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

      offersData = await offersResponse.json();
      
      // Check if search is complete
      if (offersData.data && offersData.data.length > 0) {
        console.log(`[DUFFEL] Got ${offersData.data.length} offers on attempt ${attempt + 1}`);
        break;
      }

      // Wait before retrying (shorter waits, longer total timeout)
      if (attempt < 29) {
        const waitMs = Math.min(500 + (attempt * 200), 2000);
        console.log(`[DUFFEL] No offers yet. Polling (${attempt + 1}/30) after ${waitMs}ms`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }

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
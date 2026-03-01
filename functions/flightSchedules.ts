import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Real-time flight schedules via Duffel API
// Returns today's and upcoming departures for a given airport

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { origin, destination, date, adults = 1, cabin = 'economy' } = await req.json();

    if (!origin) return Response.json({ error: 'origin required' }, { status: 400 });

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });

    const searchDate = date || new Date().toISOString().slice(0, 10);
    const dest = destination || 'MNL';

    // Build slices
    const slices = [{ origin, destination: dest, departure_date: searchDate }];

    const offerReqBody = {
      data: {
        slices,
        passengers: Array(parseInt(adults)).fill({ type: 'adult' }),
        cabin_class: cabin
      }
    };

    console.log(`[SCHEDULES] ${origin}→${dest} | ${searchDate}`);

    const offerReqRes = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2'
      },
      body: JSON.stringify(offerReqBody)
    });

    if (!offerReqRes.ok) {
      const err = await offerReqRes.json();
      console.error('[SCHEDULES] Offer request error:', JSON.stringify(err));
      return Response.json({ error: 'Search failed', details: err }, { status: offerReqRes.status });
    }

    const offerReq = await offerReqRes.json();
    const offerRequestId = offerReq.data.id;

    const offersRes = await fetch(`https://api.duffel.com/air/offers?offer_request_id=${offerRequestId}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Duffel-Version': 'v2'
      }
    });

    if (!offersRes.ok) {
      const err = await offersRes.json();
      return Response.json({ error: 'Failed to fetch offers', details: err }, { status: offersRes.status });
    }

    const offersData = await offersRes.json();
    const markupPct = parseFloat(Deno.env.get('FLIGHT_MARKUP_PERCENTAGE') || '20') / 100;

    // Transform into schedule format
    const schedules = (offersData.data || []).map(offer => {
      const slice = offer.slices[0];
      const seg = slice?.segments?.[0];
      const lastSeg = slice?.segments?.[slice.segments.length - 1];
      const baseAmount = parseFloat(offer.total_amount);
      const sellingPrice = parseFloat((baseAmount * (1 + markupPct)).toFixed(2));

      return {
        offer_id: offer.id,
        airline: offer.owner?.name,
        airline_iata: offer.owner?.iata_code,
        flight_number: `${seg?.operating_carrier?.iata_code || ''}${seg?.operating_carrier_flight_number || ''}`,
        origin: slice?.origin?.iata_code,
        origin_name: slice?.origin?.name,
        destination: slice?.destination?.iata_code,
        destination_name: slice?.destination?.name,
        departure_at: seg?.departing_at,
        arrival_at: lastSeg?.arriving_at,
        duration_minutes: slice?.duration ? parseDuration(slice.duration) : null,
        stops: (slice?.segments?.length || 1) - 1,
        is_direct: (slice?.segments?.length || 1) === 1,
        cabin_class: offer.cabin_class,
        price: sellingPrice,
        original_price: baseAmount,
        currency: offer.total_currency,
        markup_pct: (markupPct * 100).toFixed(0),
        baggage: seg?.passengers?.[0]?.baggages?.[0] || null,
        aircraft: seg?.aircraft?.iata_code || null,
      };
    });

    // Sort by departure time
    schedules.sort((a, b) => new Date(a.departure_at) - new Date(b.departure_at));

    // Price tier classification (green/blue/red)
    if (schedules.length > 0) {
      const prices = schedules.map(s => s.price);
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      const range = maxP - minP;
      const low = minP + range * 0.33;
      const high = minP + range * 0.67;

      schedules.forEach(s => {
        if (s.price <= low) s.price_tier = 'cheap';       // green
        else if (s.price <= high) s.price_tier = 'regular'; // blue
        else s.price_tier = 'expensive';                    // red
      });
    }

    return Response.json({
      success: true,
      schedules,
      search: { origin, destination: dest, date: searchDate },
      total: schedules.length
    });
  } catch (error) {
    console.error('[SCHEDULES ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseDuration(iso) {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return null;
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { geocodeLocation } from '../../shared/geocode.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cityCode, location, checkInDate, checkOutDate, adults = 1, rooms = 1 } = await req.json();
    const query = cityCode || location;
    if (!query || !checkInDate || !checkOutDate) {
      return Response.json({ error: 'Missing required parameters (cityCode/location, checkInDate, checkOutDate)' }, { status: 400 });
    }

    const apiKey = secrets.get('DUFFEL_API_KEY');
    if (!apiKey) return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });

    const coords = await geocodeLocation(base44, query);
    if (!coords) return Response.json({ hotels: [], count: 0, source: 'duffel', message: 'Could not resolve location coordinates' });

    const guestCount = Math.max(1, parseInt(adults) || 1);
    const guests = Array.from({ length: guestCount }, () => ({ type: 'adult' }));

    const body = {
      data: {
        rooms: Math.max(1, parseInt(rooms) || 1),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests,
        location: {
          radius: 20,
          geographic_coordinates: { latitude: coords.latitude, longitude: coords.longitude }
        },
        accommodation: { fetch_rates: false }
      }
    };

    const res = await fetch('https://api.duffel.com/stays/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Duffel Stays search error:', errText);
      return Response.json({ hotels: [], count: 0, source: 'duffel', error: 'Duffel Stays search failed' });
    }

    const json = await res.json();
    const results = json?.data?.results || [];

    // Admin markup
    let markup = 0;
    try {
      const mr = await base44.asServiceRole.functions.invoke('getAdminMarkup');
      markup = (mr?.data?.markup || 0) / 100;
    } catch (e) { /* no markup configured */ }

    const hotels = results.map(r => {
      const acc = r.accommodation || {};
      const cheapestBase = parseFloat(r.cheapest_rate_total_amount || '0');
      const price = cheapestBase * (1 + markup);
      const room = (acc.rooms && acc.rooms[0]) || {};
      return {
        id: r.id,
        name: acc.name,
        star_rating: acc.rating,
        review_score: acc.review_score,
        review_count: acc.review_count,
        address: acc.location?.address || null,
        city_name: acc.location?.address?.city_name,
        photos: (acc.photos || []).map(p => p.url),
        description: acc.description,
        amenities: (acc.amenities || []).map(a => a.description || a.type),
        check_in_time: acc.check_in_information?.check_in_after_time,
        check_out_time: acc.check_in_information?.check_out_before_time,
        room_name: room.name,
        total_amount: price.toFixed(2),
        base_amount: cheapestBase.toFixed(2),
        currency: r.cheapest_rate_currency || 'USD',
        duffel_result_id: r.id
      };
    });

    return Response.json({ hotels, count: hotels.length, source: 'duffel' });
  } catch (error) {
    console.error('searchHotelsDuffel error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
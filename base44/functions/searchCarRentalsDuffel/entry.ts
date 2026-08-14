import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { geocodeLocation } from '../../shared/geocode.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      location, pickup_location, dropoff_location,
      pickup_date, dropoff_date,
      pickup_time = '10:00', dropoff_time = '10:00',
      driver_age = 30, residence_country_code = 'PH'
    } = await req.json();

    const loc = location || pickup_location;
    if (!loc || !pickup_date || !dropoff_date) {
      return Response.json({ error: 'Missing required parameters (location, pickup_date, dropoff_date)' }, { status: 400 });
    }

    const apiKey = secrets.get('DUFFEL_API_KEY');
    if (!apiKey) return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });

    const coords = await geocodeLocation(base44, loc);
    if (!coords) return Response.json({ cars: [], count: 0, source: 'duffel', message: 'Could not resolve location coordinates' });

    const dropoff = dropoff_location ? (await geocodeLocation(base44, dropoff_location)) || coords : coords;

    // Rental days (for per-day display)
    const days = Math.max(1, Math.ceil((new Date(dropoff_date) - new Date(pickup_date)) / (1000 * 60 * 60 * 24)));

    const body = {
      data: {
        pickup_date,
        pickup_time,
        dropoff_date,
        dropoff_time,
        pickup_location: { radius: 20, geographic_coordinates: { latitude: coords.latitude, longitude: coords.longitude } },
        dropoff_location: { radius: 20, geographic_coordinates: { latitude: dropoff.latitude, longitude: dropoff.longitude } },
        driver: { age: parseInt(driver_age) || 30, residence_country_code: residence_country_code || 'PH' }
      }
    };

    const res = await fetch('https://api.duffel.com/cars/search', {
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
      console.error('Duffel Cars search error:', errText);
      return Response.json({ cars: [], count: 0, source: 'duffel', error: 'Duffel Cars search failed' });
    }

    const json = await res.json();
    const rates = json?.data?.rates || [];

    // Admin markup
    let markup = 0;
    try {
      const mr = await base44.asServiceRole.functions.invoke('getAdminMarkup');
      markup = (mr?.data?.markup || 0) / 100;
    } catch (e) { /* no markup configured */ }

    const cars = rates.map(rate => {
      const car = rate.car || {};
      const base = parseFloat(rate.total_amount || '0');
      const total = base * (1 + markup);
      return {
        id: rate.id,
        rental_company: rate.supplier?.name || 'Duffel Cars',
        supplier_logo: rate.supplier?.logo_url,
        car_model: car.name || 'Vehicle',
        car_type: car.category || 'standard',
        transmission: car.transmission,
        fuel_type: car.fuel,
        seats: car.max_passengers,
        air_conditioning: car.air_conditioning,
        baggage: car.baggage,
        image_url: car.images?.[0]?.url,
        pickup_location_name: rate.pickup_location?.name,
        pickup_address: rate.pickup_location?.address,
        payment_type: rate.payment_type,
        total_amount: total.toFixed(2),
        base_amount: base.toFixed(2),
        price_per_day: (total / days).toFixed(2),
        rental_days: days,
        currency: rate.total_currency || 'USD',
        rate_id: rate.id,
        source: 'duffel'
      };
    });

    return Response.json({ cars, count: cars.length, rental_days: days, source: 'duffel' });
  } catch (error) {
    console.error('searchCarRentalsDuffel error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
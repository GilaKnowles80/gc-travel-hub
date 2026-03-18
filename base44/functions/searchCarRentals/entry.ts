import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { location, pickup_date, dropoff_date, car_type } = await req.json();

    if (!location || !pickup_date || !dropoff_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build filter
    const filter = {
      location,
      availability: true,
      status: 'active'
    };

    if (car_type) {
      filter.car_type = car_type;
    }

    // Search cars in database
    const cars = await base44.entities.Car.filter(filter);

    // Calculate rental days
    const days = Math.ceil((new Date(dropoff_date) - new Date(pickup_date)) / (1000 * 60 * 60 * 24));

    // Add total price for each car
    const carsWithPricing = cars.map(car => ({
      ...car,
      rental_days: days,
      total_price: car.price_per_day * days
    }));

    return Response.json({ 
      success: true, 
      cars: carsWithPricing,
      count: carsWithPricing.length,
      rental_days: days
    });

  } catch (error) {
    console.error('Car rental search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
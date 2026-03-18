import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { car_id, pickup_date, return_date, rental_days, renter_details } = await req.json();
    
    // Get car details
    const car = await base44.entities.Car.get(car_id);
    if (!car) {
      return Response.json({ error: 'Car not found' }, { status: 404 });
    }
    
    const total_price = car.price_per_day * rental_days;
    
    // Create booking record
    const booking = await base44.entities.CarRentalBooking.create({
      car_id,
      car_model: car.car_model,
      rental_company: car.rental_company,
      pickup_date,
      return_date,
      rental_days,
      renter_name: renter_details.name,
      renter_email: renter_details.email,
      renter_phone: renter_details.phone,
      license_number: renter_details.license_number,
      total_price,
      status: 'pending',
      payment_status: 'unpaid'
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'php',
          product_data: {
            name: `${car.car_model} - ${rental_days} days`,
            description: `${car.rental_company} | Pickup: ${pickup_date}`,
          },
          unit_amount: Math.round(total_price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        booking_id: booking.id,
        booking_type: 'car_rental',
        user_email: user.email
      }
    });

    // Track analytics
    await base44.analytics.track({
      eventName: 'car_rental_booking_initiated',
      properties: {
        booking_id: booking.id,
        car_model: car.car_model,
        rental_company: car.rental_company,
        rental_days,
        total_price
      }
    });

    return Response.json({
      success: true,
      booking_id: booking.id,
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Car rental booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
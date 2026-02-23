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

    const { bus_id, passenger_details, number_of_seats } = await req.json();
    
    // Get bus details
    const bus = await base44.entities.Bus.get(bus_id);
    if (!bus) {
      return Response.json({ error: 'Bus not found' }, { status: 404 });
    }
    
    // Check seat availability
    if (bus.seats_available < number_of_seats) {
      return Response.json({ error: 'Not enough seats available' }, { status: 400 });
    }
    
    const total_price = bus.price * number_of_seats;
    
    // Create booking record
    const booking = await base44.entities.BusBooking.create({
      bus_id,
      operator: bus.operator,
      bus_number: bus.bus_number,
      route: bus.route,
      origin_terminal: bus.origin_terminal,
      destination_terminal: bus.destination_terminal,
      departure_time: bus.departure_time,
      arrival_time: bus.arrival_time,
      passenger_name: passenger_details.name,
      passenger_email: passenger_details.email,
      passenger_phone: passenger_details.phone,
      number_of_seats,
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
            name: `${bus.operator} - ${bus.route}`,
            description: `Bus ${bus.bus_number} | ${number_of_seats} seat(s) | Departure: ${new Date(bus.departure_time).toLocaleString()}`,
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
        booking_type: 'bus',
        user_email: user.email
      }
    });

    // Track analytics
    await base44.analytics.track({
      eventName: 'bus_booking_initiated',
      properties: {
        booking_id: booking.id,
        operator: bus.operator,
        route: bus.route,
        seats: number_of_seats,
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
    console.error('Bus booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
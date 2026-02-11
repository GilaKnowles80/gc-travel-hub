import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingData, flightDetails } = await req.json();

    // Create the flight booking first
    const booking = await base44.entities.FlightBooking.create(bookingData);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Flight: ${flightDetails.route}`,
              description: `${flightDetails.airline} - ${flightDetails.flightNumber} | ${flightDetails.cabinClass}`,
            },
            unit_amount: Math.round(bookingData.total_price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/MyFlightBookings?payment=success`,
      cancel_url: `${req.headers.get('origin')}/Flights?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        booking_id: booking.id,
        booking_type: 'flight',
      },
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url,
      bookingId: booking.id
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
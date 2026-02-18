import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const booking = await base44.entities.TrainBooking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const train = await base44.entities.Train.get(booking.train_id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Train Ticket - ${train?.train_number || booking.train_number}`,
            description: `${train?.origin_station} to ${train?.destination_station}`,
          },
          unit_amount: Math.round(booking.total_price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/payment-success?booking_id=${booking_id}&type=train`,
      cancel_url: `${Deno.env.get('APP_URL') || req.headers.get('origin')}/payment-cancelled?booking_id=${booking_id}`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_id,
        booking_type: 'train',
        user_email: user.email
      }
    });

    await base44.entities.Payment.create({
      user_email: user.email,
      booking_type: 'train',
      booking_id,
      amount: booking.total_price,
      currency: 'USD',
      payment_method: 'stripe',
      stripe_session_id: session.id,
      status: 'pending'
    });

    console.log('Train checkout session created:', session.id);

    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Train checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
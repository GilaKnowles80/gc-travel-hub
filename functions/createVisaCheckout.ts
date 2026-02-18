import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@18.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, amount, currency = 'PHP' } = await req.json();

    if (!bookingId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appointment = await base44.entities.VisaAppointment.get(bookingId);
    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Visa Appointment - ${appointment.country}`,
            description: `${appointment.visa_type} visa application`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?booking_id=${bookingId}&type=visa`,
      cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
      metadata: {
        booking_id: bookingId,
        booking_type: 'visa',
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
      },
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Visa appointment checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.6.0';

// Creates a Stripe Checkout session for a Premium Membership subscription
// (monthly ₱499 / annual ₱4,990). On successful payment the Stripe webhook
// (handleStripeWebhook, booking_type 'premium') activates the membership.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_type } = await req.json();
    const plan = plan_type === 'annual' ? { price: 4990, months: 12 } : { price: 499, months: 1 };
    if (!plan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const payment = await base44.entities.Payment.create({
      user_email: user.email,
      booking_type: 'premium',
      booking_id: `premium-${plan_type}-${Date.now()}`,
      amount: plan.price,
      currency: 'PHP',
      payment_method: 'stripe',
      status: 'pending',
      metadata: { plan_type },
    });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json(
        { error: 'Stripe is not configured yet. Please contact support to enable premium payments.' },
        { status: 503 }
      );
    }
    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'php',
          product_data: {
            name: `GC Travel Premium — ${plan_type === 'annual' ? 'Annual' : 'Monthly'}`,
            description: '50% off service fees, 2x loyalty points, priority support & exclusive deals.',
          },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/PremiumMembership?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${req.headers.get('origin')}/PremiumMembership?cancelled=1`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id: payment.id,
        booking_id: payment.id,
        booking_type: 'premium',
        user_email: user.email,
        plan_type,
      },
    });

    await base44.entities.Payment.update(payment.id, { stripe_session_id: session.id });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('createPremiumCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.6.0';

// ─── Stripe Product Map (all booking types) ──────────────────────────────────
const PRODUCT_MAP = {
  flight:    'prod_U44Q61woWo8gJF',
  hotel:     'prod_U44QLef462oLTH',
  tour:      'prod_U44Q9o7seIGXeh',
  ferry:     'prod_U44Q29Cc123de5',
  bus:       'prod_U44QbV58DK58HD',
  car:       'prod_U5XTnDsNDROZNl',
  car_rental:'prod_U5XTnDsNDROZNl',
  train:     'prod_U5XTiDfd4ZfPwb',
  cruise:    'prod_U5XTkU7k4rhnAG',
  insurance: 'prod_U5XT24woA6F0am',
  visa:      'prod_U5XT3CN3IQAKFR',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      bookingType,
      bookingId,
      customerEmail,
      amount,
      currency = 'usd',
      description,
      successUrl,
      cancelUrl
    } = await req.json();

    if (!bookingType || !bookingId || !amount || !successUrl || !cancelUrl) {
      return Response.json(
        { error: 'Missing required fields: bookingType, bookingId, amount, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    const productId = PRODUCT_MAP[bookingType.toLowerCase()];
    if (!productId) {
      return Response.json({ error: `Unsupported booking type: ${bookingType}` }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create a Payment record for tracking
    let paymentId = null;
    try {
      const payment = await base44.entities.Payment.create({
        user_email: user.email,
        booking_type: bookingType,
        booking_id: bookingId,
        amount: amount,
        currency: currency.toUpperCase(),
        payment_method: 'stripe',
        status: 'pending',
      });
      paymentId = payment.id;
    } catch (err) {
      console.error('Payment record creation error:', err.message);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product: productId,
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: customerEmail || user.email,
      success_url: successUrl + (paymentId ? `&payment_id=${paymentId}` : ''),
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_type: bookingType,
        booking_id: bookingId,
        user_email: user.email,
        payment_id: paymentId || '',
      }
    });

    // Link session to payment record
    if (paymentId) {
      await base44.entities.Payment.update(paymentId, { stripe_session_id: session.id });
    }

    console.log(`[CHECKOUT] Created session ${session.id} for ${bookingType}:${bookingId} amount:${amount}`);

    return Response.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      paymentId
    });
  } catch (error) {
    console.error('[CHECKOUT ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
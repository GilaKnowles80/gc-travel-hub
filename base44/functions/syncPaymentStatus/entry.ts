import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Syncs payment status in real-time from Stripe
 * Updates Payment entity with current status from Stripe
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { stripe_session_id, payment_id } = await req.json();

    if (!stripe_session_id) {
      return Response.json({ error: 'Missing stripe_session_id' }, { status: 400 });
    }

    console.log(`Syncing payment status for session: ${stripe_session_id}`);

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id, {
      expand: ['payment_intent']
    });

    const paymentStatus = session.payment_status === 'paid' ? 'completed' : 'pending';
    const paymentIntent = session.payment_intent;

    console.log(`Session ${stripe_session_id} status: ${paymentStatus}`);

    // Update Payment record if payment_id provided
    if (payment_id) {
      // Verify the Stripe session belongs to this payment's booking before updating.
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
      const existing = existingPayments[0];
      const sessionBookingId = session.metadata?.booking_id || session.metadata?.bookingId;
      if (existing && sessionBookingId && String(existing.booking_id) !== String(sessionBookingId)) {
        return Response.json({ error: 'Stripe session does not match this payment record' }, { status: 403 });
      }

      await base44.asServiceRole.entities.Payment.update(payment_id, {
        status: paymentStatus,
        stripe_payment_intent: paymentIntent?.id,
        stripe_session_id: stripe_session_id,
        amount: session.amount_total / 100,
        currency: session.currency,
        customer_email: session.customer_email,
        payment_date: paymentStatus === 'completed' ? new Date().toISOString() : null
      });

      console.log(`Payment ${payment_id} updated with status: ${paymentStatus}`);
    }

    return Response.json({
      success: true,
      status: paymentStatus,
      amount: session.amount_total / 100,
      currency: session.currency
    });
  } catch (error) {
    console.error('Error syncing payment status:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
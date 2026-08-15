import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

// GC Travel Payment Flow: Customer pays 100% (75% supplier + 25% GC markup)
// Funds held → booking confirmed → auto-split executed via webhook
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const SUPPLIER_PCT = 0.75;
const GC_PCT = 0.25;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, amount, currency = 'php' } = await req.json();

    if (!bookingId || !amount) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const booking = await base44.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const supplierAmount = parseFloat((amount * SUPPLIER_PCT).toFixed(2));
    const gcAmount = parseFloat((amount * GC_PCT).toFixed(2));
    const description = `${booking.number_of_travelers} traveler(s) | ${booking.trip_type} | Departure: ${booking.departure_date || 'TBD'}`;

    console.log(`[TOUR CHECKOUT] Customer: ${user.email} | Total: ${amount} | Supplier(75%): ${supplierAmount} | GC(25%): ${gcAmount}`);

    // Hold payment in wallet escrow — funds held until booking confirmation.
    try {
      await base44.functions.invoke('processWalletEscrow', {
        action: 'hold',
        user_email: user.email,
        booking_id: bookingId,
        booking_type: 'tour',
        amount: amount,
        supplier: booking.supplier || 'direct',
      });
    } catch (holdErr) {
      console.error('Wallet escrow hold failed (non-fatal):', holdErr.message);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: `🗺️ Tour - ${booking.tour_title}`, description },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: user.email,
      success_url: `${req.headers.get('origin')}/PaymentSuccess?booking_id=${bookingId}&type=tour`,
      cancel_url: `${req.headers.get('origin')}/PaymentCancelled`,
      metadata: {
        booking_id: bookingId,
        booking_type: 'tour',
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        supplier_75pct: String(supplierAmount),
        gc_markup_25pct: String(gcAmount),
      },
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[TOUR CHECKOUT ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
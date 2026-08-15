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

    const { hotel, offer, guestDetails, bookingId, totalAmount, currency = 'php' } = await req.json();

    if (!totalAmount) return Response.json({ error: 'Missing totalAmount' }, { status: 400 });

    const amount = parseFloat(totalAmount);
    const supplierAmount = parseFloat((amount * SUPPLIER_PCT).toFixed(2));
    const gcAmount = parseFloat((amount * GC_PCT).toFixed(2));

    console.log(`[HOTEL CHECKOUT] Customer: ${user.email} | Total: ${amount} | Supplier(75%): ${supplierAmount} | GC(25%): ${gcAmount}`);

    // Hold payment in wallet escrow — funds held until booking confirmation.
    try {
      await base44.functions.invoke('processWalletEscrow', {
        action: 'hold',
        user_email: user.email,
        booking_id: bookingId,
        booking_type: 'hotel',
        amount: amount,
        supplier: 'direct',
      });
    } catch (holdErr) {
      console.error('Wallet escrow hold failed (non-fatal):', holdErr.message);
    }

    const productName = hotel?.name || 'Hotel Booking';
    const productDesc = offer
      ? `Check-in: ${offer.checkInDate || ''}, Check-out: ${offer.checkOutDate || ''} | ${offer.room?.description?.text || ''}`
      : guestDetails?.check_in_date
        ? `Check-in: ${guestDetails.check_in_date}, Check-out: ${guestDetails.check_out_date}`
        : 'Hotel reservation';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: `🏨 ${productName}`, description: productDesc },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: user.email,
      success_url: `${req.headers.get('origin')}/HotelBookingConfirmation?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId || ''}`,
      cancel_url: `${req.headers.get('origin')}/HotelSearch?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_id: bookingId || '',
        booking_type: 'hotel',
        user_email: user.email,
        supplier_75pct: String(supplierAmount),
        gc_markup_25pct: String(gcAmount),
      },
    });

    console.log(`[HOTEL CHECKOUT] Stripe session: ${session.id}`);
    return Response.json({ sessionId: session.id, url: session.url, bookingId });

  } catch (error) {
    console.error('[HOTEL CHECKOUT ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
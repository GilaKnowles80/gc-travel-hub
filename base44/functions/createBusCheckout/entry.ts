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

    const { bookingId, amount, currency = 'php', paymentMethod = 'stripe' } = await req.json();

    if (!bookingId || !amount) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const booking = await base44.entities.BusBooking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const supplierAmount = parseFloat((amount * SUPPLIER_PCT).toFixed(2));
    const gcAmount = parseFloat((amount * GC_PCT).toFixed(2));
    const description = `Bus Ticket - ${booking.bus_company || booking.supplier} | ${booking.number_of_passengers} passenger(s) | ${booking.route}`;

    console.log(`[BUS CHECKOUT] Customer: ${user.email} | Total: ${amount} | Supplier(75%): ${supplierAmount} | GC(25%): ${gcAmount}`);

    // Hold payment in wallet escrow — funds held until booking confirmation.
    try {
      await base44.functions.invoke('processWalletEscrow', {
        action: 'hold',
        user_email: user.email,
        booking_id: bookingId,
        booking_type: 'bus',
        amount: amount,
        supplier: booking.supplier || 'direct',
      });
    } catch (holdErr) {
      console.error('Wallet escrow hold failed (non-fatal):', holdErr.message);
    }

    if (paymentMethod === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: `🚌 Bus Ticket - ${booking.bus_company || booking.supplier}`, description },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: user.email,
        success_url: `${req.headers.get('origin')}/PaymentSuccess?booking_id=${bookingId}&type=bus`,
        cancel_url: `${req.headers.get('origin')}/PaymentCancelled`,
        metadata: {
          booking_id: bookingId,
          booking_type: 'bus',
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_email: user.email,
          supplier_75pct: String(supplierAmount),
          gc_markup_25pct: String(gcAmount),
        },
      });
      return Response.json({ url: session.url, sessionId: session.id });

    } else if (paymentMethod === 'paymongo') {
      const authHeader = 'Basic ' + btoa(Deno.env.get('PayMongo_API_KEY') + ':');
      const res = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({ data: { attributes: { amount: Math.round(amount * 100), description, remarks: `Booking ID: ${bookingId}` } } })
      });
      const data = await res.json();
      if (!data.data) throw new Error('PayMongo link creation failed');
      return Response.json({ url: data.data.attributes.checkout_url, bookingId });

    } else {
      return Response.json({ error: 'Invalid payment method' }, { status: 400 });
    }
  } catch (error) {
    console.error('[BUS CHECKOUT ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
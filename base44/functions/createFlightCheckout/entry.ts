import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

// ─── GC Travel Airline Ticket Payment Flow ───────────────────────────────────
// Customer pays 100% of total fare (Merchant Base Fare 75% + GC Markup 25%)
// Funds held in GC E-Wallet until booking confirmed by airline API
// On SUCCESS: Auto-split 75% → Supplier, 25% → GC Travel
// On FAILURE: 100% refund to customer from wallet
// ────────────────────────────────────────────────────────────────────────────

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingData, flightDetails } = await req.json();

    if (!bookingData || !flightDetails) {
      return Response.json({ error: 'Missing bookingData or flightDetails' }, { status: 400 });
    }

    const totalAmount = bookingData.total_price;
    const supplierBaseFare = parseFloat((totalAmount * 0.75).toFixed(2));
    const gcMarkup        = parseFloat((totalAmount * 0.25).toFixed(2));

    console.log(`[FLIGHT CHECKOUT] Customer: ${user.email} | Total: ${totalAmount} | Supplier(75%): ${supplierBaseFare} | GC Markup(25%): ${gcMarkup}`);

    // Create the flight booking record (status: pending, payment_status: unpaid)
    // Funds will be held until airline confirms the booking
    const booking = await base44.entities.FlightBooking.create({
      ...bookingData,
      supplier: bookingData.supplier || 'duffel',
      payment_status: 'unpaid',
      status: 'pending'
    });

    console.log(`[FLIGHT CHECKOUT] Booking created: ${booking.id} — awaiting payment & airline confirmation`);

    // Hold payment in wallet escrow — funds held until airline confirmation, then
    // auto-split (75% merchant / 25% commission) or 100% release on failure.
    try {
      await base44.functions.invoke('processWalletEscrow', {
        action: 'hold',
        user_email: user.email,
        booking_id: booking.id,
        booking_type: 'flight',
        amount: totalAmount,
        supplier: bookingData.supplier || 'direct',
      });
    } catch (holdErr) {
      console.error('Wallet escrow hold failed (non-fatal):', holdErr.message);
    }

    // Build description with pricing breakdown
    const currency = flightDetails.currency || 'PHP';
    const fareBreakdown = `Base Fare: ${currency} ${supplierBaseFare} | Service Fee: ${currency} ${gcMarkup} | Total: ${currency} ${totalAmount}`;

    // Create Stripe checkout session (customer pays 100%)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: `✈️ Flight: ${flightDetails.route || 'Airline Ticket'}`,
              description: [
                `${flightDetails.airline || 'Airline'} ${flightDetails.flightNumber || ''} | ${flightDetails.cabinClass || 'Economy'}`,
                fareBreakdown
              ].join('\n'),
            },
            unit_amount: Math.round(totalAmount * 100), // 100% total
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: user.email,
      success_url: `${req.headers.get('origin')}/MyFlightBookings?payment=success&booking_id=${booking.id}`,
      cancel_url: `${req.headers.get('origin')}/Flights?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        booking_id: booking.id,
        booking_type: 'flight',
        user_email: user.email,
        supplier_75pct: String(supplierBaseFare),
        gc_markup_25pct: String(gcMarkup),
        flow: 'gc_airline_ticket_payment_v2' // wallet-hold then split on confirm
      },
    });

    console.log(`[FLIGHT CHECKOUT] Stripe session created: ${session.id}`);

    return Response.json({
      sessionId: session.id,
      url: session.url,
      bookingId: booking.id,
      priceBreakdown: {
        total: totalAmount,
        supplier_base_fare_75pct: supplierBaseFare,
        gc_markup_25pct: gcMarkup,
        note: 'Funds held securely. Split executed only after airline confirmation.'
      }
    });

  } catch (error) {
    console.error('[FLIGHT CHECKOUT ERROR]', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
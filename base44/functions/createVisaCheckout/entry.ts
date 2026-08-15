import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

// ─── GC Travel Visa Processing Payment Flow ───────────────────────────────────
// GC Travel collects only 25% of the total visa cost as a SERVICE FEE.
// The remaining 75% (actual visa fee) is paid directly by the client
// at their embassy/consulate appointment date.
// ─────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const SERVICE_FEE_PCT = 0.25; // GC Travel processing fee only

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, amount, currency = 'php', paymentMethod = 'stripe' } = await req.json();

    if (!bookingId || !amount) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const appointment = await base44.entities.VisaAppointment.get(bookingId);
    if (!appointment) return Response.json({ error: 'Appointment not found' }, { status: 404 });

    // Only charge 25% — the GC service/processing fee
    const totalVisaCost = parseFloat(amount);
    const serviceFeeCharged = parseFloat((totalVisaCost * SERVICE_FEE_PCT).toFixed(2));
    const balanceDueAtEmbassy = parseFloat((totalVisaCost * 0.75).toFixed(2));

    console.log(`[VISA CHECKOUT] Customer: ${user.email} | Total Visa Cost: ${totalVisaCost} | GC Service Fee (25%): ${serviceFeeCharged} | Balance at Embassy (75%): ${balanceDueAtEmbassy}`);

    // Hold the 25% service fee in wallet escrow (commission-only — no merchant payout).
    try {
      await base44.functions.invoke('processWalletEscrow', {
        action: 'hold',
        user_email: user.email,
        booking_id: bookingId,
        booking_type: 'visa',
        amount: serviceFeeCharged,
        supplier: 'direct',
      });
    } catch (holdErr) {
      console.error('Wallet escrow hold failed (non-fatal):', holdErr.message);
    }

    const productName = `📋 Visa Processing - ${appointment.country} (${appointment.visa_type})`;
    const description = `GC Travel Service Fee (25% of total). Remaining ₱${balanceDueAtEmbassy.toLocaleString()} payable at embassy on appointment date.`;

    if (paymentMethod === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: productName, description },
            unit_amount: Math.round(serviceFeeCharged * 100), // 25% only
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: user.email,
        success_url: `${req.headers.get('origin')}/PaymentSuccess?booking_id=${bookingId}&type=visa`,
        cancel_url: `${req.headers.get('origin')}/PaymentCancelled`,
        metadata: {
          booking_id: bookingId,
          booking_type: 'visa',
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_email: user.email,
          total_visa_cost: String(totalVisaCost),
          service_fee_charged_25pct: String(serviceFeeCharged),
          balance_due_at_embassy_75pct: String(balanceDueAtEmbassy),
          payment_model: 'gc_service_fee_only',
        },
      });
      return Response.json({
        url: session.url,
        sessionId: session.id,
        chargedAmount: serviceFeeCharged,
        balanceDueAtEmbassy,
        note: 'Only the 25% GC processing fee is charged now. Balance is paid at embassy on appointment date.'
      });

    } else if (paymentMethod === 'paymongo') {
      const authHeader = 'Basic ' + btoa(Deno.env.get('PayMongo_API_KEY') + ':');
      const res = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(serviceFeeCharged * 100), // 25% only
              description,
              remarks: `Visa Processing Fee | Appointment ID: ${bookingId}`
            }
          }
        })
      });
      const data = await res.json();
      if (!data.data) throw new Error('PayMongo link creation failed');
      return Response.json({
        url: data.data.attributes.checkout_url,
        bookingId: appointment.id,
        chargedAmount: serviceFeeCharged,
        balanceDueAtEmbassy,
      });

    } else {
      return Response.json({ error: 'Invalid payment method' }, { status: 400 });
    }
  } catch (error) {
    console.error('[VISA CHECKOUT ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// ─── Phase 8: Refund Workflow ─────────────────────────────────────────────
// 1. Check fare rules
// 2. Non-refundable → deny
// 3. Refundable → cancel via API → issue Stripe refund
// 4. Reverse 20% revenue entry
// 5. Update accounting

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, bookingType, reason = 'customer_request' } = await req.json();

    if (!bookingId || !bookingType) {
      return Response.json({ error: 'Missing bookingId or bookingType' }, { status: 400 });
    }

    console.log(`[REFUND PHASE 8] Request for ${bookingType}:${bookingId} by ${user.email}`);

    // ── Step 1: Fetch booking ─────────────────────────────────────────────
    const entityMap = {
      flight: 'FlightBooking', hotel: 'HotelBooking', tour: 'Booking',
      ferry: 'FerryBooking', bus: 'BusBooking', car_rental: 'CarRentalBooking',
      cruise: 'CruiseBooking', train: 'TrainBooking', visa: 'VisaAppointment', insurance: 'InsurancePolicy'
    };

    const entityName = entityMap[bookingType];
    if (!entityName) return Response.json({ error: 'Invalid booking type' }, { status: 400 });

    const booking = await base44.asServiceRole.entities[entityName].get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    // Only the booking owner or an admin may refund/cancel it.
    const bookingOwner = booking.customer_email || booking.passenger_email || booking.guest_email || booking.user_email;
    if (bookingOwner !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: you do not own this booking' }, { status: 403 });
    }

    // ── Step 2: Check fare rules ──────────────────────────────────────────
    const nonRefundableSuppliers = ['biyaheko', 'tripzynx']; // Typically non-refundable
    const isNonRefundable = nonRefundableSuppliers.includes(booking.supplier) && bookingType === 'flight';

    if (isNonRefundable) {
      console.log('[REFUND DENIED] Non-refundable fare for supplier:', booking.supplier);
      return Response.json({
        success: false,
        refundable: false,
        reason: 'This booking has a non-refundable fare. No refund can be processed.',
        supplier: booking.supplier
      });
    }

    // ── Step 3: Find payment record ───────────────────────────────────────
    const payments = await base44.asServiceRole.entities.Payment.filter({ booking_id: bookingId });
    const payment = payments[0];

    if (!payment || !payment.stripe_session_id) {
      return Response.json({ error: 'No payment record found for this booking' }, { status: 404 });
    }

    // ── Step 4: Issue Stripe refund ───────────────────────────────────────
    let refundResult;
    try {
      // Get the payment intent from the session
      const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id);
      const paymentIntentId = session.payment_intent;

      refundResult = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          booking_id: bookingId,
          booking_type: bookingType,
          refund_reason: reason,
          base44_app_id: Deno.env.get('BASE44_APP_ID')
        }
      });

      console.log('[STRIPE REFUND] Created:', refundResult.id, 'Amount:', refundResult.amount / 100);
    } catch (stripeErr) {
      console.error('[STRIPE REFUND ERROR]', stripeErr.message);
      return Response.json({ error: 'Stripe refund failed: ' + stripeErr.message }, { status: 500 });
    }

    // ── Step 5: Update booking status ─────────────────────────────────────
    await base44.asServiceRole.entities[entityName].update(bookingId, {
      status: 'cancelled',
      payment_status: 'refunded'
    });

    // ── Step 6: Update payment record ─────────────────────────────────────
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: 'refunded',
      refund_amount: refundResult.amount / 100,
      refund_date: new Date().toISOString(),
      refund_id: refundResult.id
    });

    // ── Step 7: Reverse revenue split (Phase 8 accounting) ───────────────
    const splits = await base44.asServiceRole.entities.PaymentSplit.filter({ booking_id: bookingId });
    if (splits[0]) {
      await base44.asServiceRole.entities.PaymentSplit.update(splits[0].id, {
        status: 'refunded',
        net_profit: 0,
        agency_amount: 0,
        notes: `Refunded on ${new Date().toISOString()} – Reason: ${reason}`
      });
      console.log('[PHASE 8] Revenue split reversed for booking:', bookingId);
    }

    // ── Step 8: Reverse supplier payment ─────────────────────────────────
    const supplierPayments = await base44.asServiceRole.entities.SupplierPayment.filter({ booking_id: bookingId });
    if (supplierPayments[0]) {
      await base44.asServiceRole.entities.SupplierPayment.update(supplierPayments[0].id, {
        payment_status: 'cancelled',
        notes: 'Cancelled due to customer refund'
      });
    }

    // ── Step 9: Notify customer ───────────────────────────────────────────
    const customerEmail = booking.customer_email || booking.passenger_email || booking.guest_email;
    if (customerEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'GC Travel & Tours',
        to: customerEmail,
        subject: 'Refund Processed – GC Travel & Tours',
        body: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#d97706">🔁 Refund Processed</h2>
            <p>Your refund has been successfully processed.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Booking ID</td><td style="padding:8px">${bookingId}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Refund Amount</td><td style="padding:8px">₱${refundResult.amount / 100}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Refund ID</td><td style="padding:8px">${refundResult.id}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Processing Time</td><td style="padding:8px">5–10 business days</td></tr>
            </table>
            <p style="color:#64748b;font-size:12px">GC Travel and Tours Agency</p>
          </div>
        `
      });
    }

    // ── Step 10: Audit log ────────────────────────────────────────────────
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'refund_processed',
      entity_type: bookingType,
      entity_id: bookingId,
      details: JSON.stringify({
        refund_id: refundResult.id,
        refund_amount: refundResult.amount / 100,
        reason,
        processed_by: user.email
      }),
      user_email: user.email,
      timestamp: new Date().toISOString()
    }).catch(console.error);

    console.log(`[PHASE 8 COMPLETE] Refund processed: ${refundResult.id}`);

    return Response.json({
      success: true,
      refundable: true,
      refund_id: refundResult.id,
      refund_amount: refundResult.amount / 100,
      booking_status: 'cancelled',
      revenue_reversed: true,
      message: 'Refund processed successfully. Revenue split reversed. Allow 5–10 business days for funds to appear.'
    });

  } catch (error) {
    console.error('[REFUND ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
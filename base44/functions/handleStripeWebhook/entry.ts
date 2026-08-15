import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// ─── Revenue Split Constants ───────────────────────────────────────────────
// GC Travel Airline Ticket Payment Flow:
// Customer pays 100% → GC E-Wallet (holding)
// On CONFIRMED booking: 75% → Merchant/Supplier, 25% → GC Travel
// On FAILED booking:    100% → Refund to customer
const GC_MARKUP_PCT  = 0.25;  // 25% to GC Travel (service, taxes, fees, profit)
const SUPPLIER_PCT   = 0.75;  // 75% to Merchant/Airline supplier
const STRIPE_FEE_PCT = 0.029; // 2.9% Stripe processing fee

async function logRevenueSplit(base44, { bookingId, bookingType, totalAmount, currency, userEmail, sessionId }) {
  const supplierCost  = parseFloat((totalAmount * SUPPLIER_PCT).toFixed(2));
  const agencyRevenue = parseFloat((totalAmount * GC_MARKUP_PCT).toFixed(2));
  const stripeFee     = parseFloat((totalAmount * STRIPE_FEE_PCT).toFixed(2));
  const netProfit     = parseFloat((agencyRevenue - stripeFee).toFixed(2));

  try {
    await base44.asServiceRole.entities.PaymentSplit.create({
      booking_id: bookingId,
      booking_type: bookingType,
      gross_amount: totalAmount,
      supplier_amount: supplierCost,
      agency_amount: agencyRevenue,
      stripe_fee: stripeFee,
      net_profit: netProfit,
      currency: currency || 'PHP',
      user_email: userEmail,
      stripe_session_id: sessionId,
      split_date: new Date().toISOString(),
      status: 'settled'
    });

    console.log(`[75/25 SPLIT] Gross: ${totalAmount} | Supplier(75%): ${supplierCost} | GC Revenue(25%): ${agencyRevenue} | Net after Stripe fee: ${netProfit}`);
  } catch (err) {
    console.error('Revenue split log error:', err.message);
  }
}

async function createSupplierPaymentRecord(base44, { bookingId, bookingType, totalAmount, supplier }) {
  const supplierAmount = parseFloat((totalAmount * SUPPLIER_PCT).toFixed(2));
  const markupRetained = parseFloat((totalAmount * GC_MARKUP_PCT).toFixed(2));

  try {
    const existing = await base44.asServiceRole.entities.SupplierPayment.filter({ booking_id: bookingId });
    if (existing.length > 0) return;

    await base44.asServiceRole.entities.SupplierPayment.create({
      booking_id: bookingId,
      booking_type: bookingType,
      supplier: supplier || 'direct',
      supplier_amount: supplierAmount,
      customer_paid_amount: totalAmount,
      markup_retained: markupRetained,
      payment_status: 'pending',
      payment_method: 'manual',
      notes: `Auto-created via Stripe webhook. Awaiting supplier settlement.`
    });

    console.log(`[SUPPLIER PAYMENT] Created pending payment: ${supplierAmount} to ${supplier}`);
  } catch (err) {
    console.error('Supplier payment creation error:', err.message);
  }
}

async function sendBookingEmail(base44, { to, bookingId, bookingType, totalAmount, currency }) {
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'GC Travel & Tours',
      to,
      subject: `Booking Confirmed – GC Travel & Tours`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
          <h2 style="color:#d97706">✅ Booking Confirmed!</h2>
          <p>Thank you for booking with <strong>GC Travel and Tours Agency</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Booking ID</td><td style="padding:8px">${bookingId}</td></tr>
            <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Type</td><td style="padding:8px">${bookingType}</td></tr>
            <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Amount Paid</td><td style="padding:8px">${currency?.toUpperCase()} ${totalAmount}</td></tr>
            <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Status</td><td style="padding:8px;color:green">Confirmed</td></tr>
          </table>
          <p>We will send your e-ticket / confirmation documents shortly.</p>
          <p style="color:#64748b;font-size:12px">GC Travel and Tours Agency | info@gctravelandtours.com | +63 915 440 1150</p>
        </div>
      `
    });
  } catch (err) {
    console.error('Confirmation email error:', err.message);
  }
}

async function updateBookingStatus(base44, bookingId, bookingType, session) {
  const entityMap = {
    flight: 'FlightBooking',
    hotel: 'HotelBooking',
    tour: 'Booking',
    ferry: 'FerryBooking',
    cruise: 'CruiseBooking',
    train: 'TrainBooking',
    car: 'CarRentalBooking',
    car_rental: 'CarRentalBooking',
    bus: 'BusBooking',
    visa: 'VisaAppointment',
    insurance: 'InsurancePolicy',
    bulk: 'BulkBooking',
    package: 'PackageBooking',
  };

  const entity = entityMap[bookingType];
  if (!entity) { console.warn('Unknown bookingType:', bookingType); return null; }

  const statusFields = bookingType === 'insurance'
    ? { payment_status: 'paid', status: 'active' }
    : { payment_status: 'paid', status: 'confirmed' };

  try {
    await base44.asServiceRole.entities[entity].update(bookingId, statusFields);
    const booking = await base44.asServiceRole.entities[entity].get(bookingId);
    console.log(`[BOOKING] ${bookingType}:${bookingId} → confirmed`);
    return booking;
  } catch (err) {
    console.error(`Update booking error [${bookingType}:${bookingId}]:`, err.message);
    return null;
  }
}

// ─── Main Webhook Handler ──────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('[WEBHOOK] Event:', event.type, event.id);

    // ── Phase 5: checkout.session.completed ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { payment_id, booking_id, booking_type, user_email, package_id } = session.metadata || {};
      const totalAmount = session.amount_total / 100;
      const currency = session.currency;

      // 1. Update payment record
      if (payment_id) {
        try {
          await base44.asServiceRole.entities.Payment.update(payment_id, {
            status: 'completed',
            stripe_payment_intent: session.payment_intent,
            payment_date: new Date().toISOString(),
          });
        } catch (err) { console.error('Payment update error:', err.message); }
      }

      // 2. Update booking status
      if (booking_id && booking_type && booking_type !== 'premium') {
        const isFlight = booking_type === 'flight';

        // Flights: mark payment received but keep status 'pending'. The real
        // Duffel airline order is created next by bookFlightDuffel, which sets
        // the final status (confirmed → escrow 75/25 split, cancelled → escrow
        // 100% refund). Other types confirm here; their escrow settle fires on
        // this status change.
        let booking;
        if (isFlight) {
          await base44.asServiceRole.entities.FlightBooking.update(booking_id, { payment_status: 'paid' });
          booking = await base44.asServiceRole.entities.FlightBooking.get(booking_id);
        } else {
          booking = await updateBookingStatus(base44, booking_id, booking_type, session);
          // Revenue split + supplier payment for non-flight types.
          await logRevenueSplit(base44, {
            bookingId: booking_id,
            bookingType: booking_type,
            totalAmount,
            currency,
            userEmail: user_email || session.customer_email,
            sessionId: session.id
          });
          const supplier = booking?.supplier || 'direct';
          await createSupplierPaymentRecord(base44, {
            bookingId: booking_id,
            bookingType: booking_type,
            totalAmount,
            supplier
          });
        }

        // 5. Award loyalty points (1 point per peso/dollar)
        try {
          await base44.asServiceRole.functions.invoke('awardLoyaltyPoints', {
            userEmail: user_email || session.customer_email,
            bookingId: booking_id,
            bookingType: booking_type,
            amount: totalAmount
          });
        } catch (err) { console.error('Loyalty points error:', err.message); }

        // 5b. Credit wallet with 5% cashback
        try {
          await base44.asServiceRole.functions.invoke('creditWalletOnBooking', {
            user_email: user_email || session.customer_email,
            booking_id: booking_id,
            booking_type: booking_type,
            payment_amount: totalAmount,
            payment_method: 'stripe'
          });
        } catch (err) { console.error('Wallet credit error:', err.message); }

        // 6. Affiliate commission tracking
        try {
          await base44.asServiceRole.functions.invoke('calculateAffiliateCommission', {
            bookingId: booking_id,
            bookingType: booking_type,
            bookingAmount: totalAmount,
            customerEmail: user_email || session.customer_email
          });
        } catch (err) { console.error('Affiliate commission error:', err.message); }

        // 7. Auto-create the real Duffel airline order (real-time, 24/7,
        //    Expedia-style instant ticketing). bookFlightDuffel confirms on
        //    success or cancels + flags refund on failure; both settle escrow.
        if (isFlight && booking?.offer_id) {
          try {
            await base44.asServiceRole.functions.invoke('bookFlightDuffel', { bookingId: booking_id });
          } catch (err) { console.error('Duffel booking error:', err.message); }
        }
      }

      // Activate premium membership on successful payment
      if (booking_type === 'premium' && user_email) {
        try {
          const planType = session.metadata?.plan_type || 'monthly';
          const planPrice = planType === 'annual' ? 4990 : 499;
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + (planType === 'annual' ? 12 : 1));
          await base44.asServiceRole.entities.PremiumMembership.create({
            user_email: user_email,
            plan_type: planType,
            plan_price: planPrice,
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
            status: 'active',
            stripe_subscription_id: session.id,
          });
          await base44.asServiceRole.entities.Notification.create({
            user_email,
            title: '👑 Premium Membership Activated',
            message: `Your ${planType} premium membership is now active! Enjoy 50% off service fees, 2x loyalty points, priority support and exclusive deals.`,
            type: 'payment_confirmed',
            link: '/PremiumMembership',
          });
          console.log(`[PREMIUM] Activated ${planType} for ${user_email}`);
        } catch (err) { console.error('Premium activation error:', err.message); }
      }

      // Handle package bookings
      if (package_id) {
        try {
          await base44.asServiceRole.entities.PackageBooking.update(package_id, { status: 'paid' });
          await logRevenueSplit(base44, {
            bookingId: package_id, bookingType: 'package',
            totalAmount, currency, userEmail: user_email, sessionId: session.id
          });
        } catch (err) { console.error('Package update error:', err.message); }
      }

      // 8. Send confirmation email (Phase 5)
      const customerEmail = session.customer_email;
      if (customerEmail) {
        await sendBookingEmail(base44, {
          to: customerEmail,
          bookingId: booking_id || package_id || 'N/A',
          bookingType: booking_type || 'package',
          totalAmount,
          currency
        });
      }

      // 9. Create notification
      if (user_email) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_email,
            title: '✅ Booking Confirmed & Paid',
            message: `Your ${booking_type || 'package'} booking has been confirmed. Amount: ${currency?.toUpperCase()} ${totalAmount}`,
            type: 'payment_confirmed',
            booking_id: booking_id || package_id,
            link: `/MyBookings`
          });
        } catch (err) { console.error('Notification error:', err.message); }
      }

      console.log(`[PHASE 5 COMPLETE] 75/25 Split — GC Revenue(25%): ${(totalAmount * GC_MARKUP_PCT).toFixed(2)} | Supplier(75%): ${(totalAmount * SUPPLIER_PCT).toFixed(2)} | Total: ${totalAmount}`);
    }

    // ── Phase 9: payment_intent.payment_failed ────────────────────────────
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const { booking_id, booking_type, user_email } = pi.metadata || {};
      console.error('[PAYMENT FAILED]', pi.id, pi.last_payment_error?.message);

      // Per GC Airline Flow: payment gateway failure (card declined etc.)
      // Cancel the flight booking so the wallet escrow settle workflow releases
      // the held funds (100% refund) back to the user's withdrawable balance.
      if (booking_id && booking_type === 'flight') {
        try {
          await base44.asServiceRole.entities.FlightBooking.update(booking_id, { status: 'cancelled' });
        } catch (err) { console.error('Flight cancel on payment failure error:', err.message); }
      }
      if (user_email) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_email,
            title: '❌ Payment Failed — No Charges Made',
            message: `Your payment could not be processed. No funds were deducted. Please try again with a different payment method or contact our support at +639154401150.`,
            type: 'payment_failed',
            booking_id,
            link: '/MyBookings'
          });
        } catch (err) { console.error('Notify error:', err.message); }
      }

      // Log audit
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'payment_gateway_failed',
          entity_type: booking_type || 'booking',
          entity_id: booking_id || pi.id,
          details: JSON.stringify({
            pi_id: pi.id,
            reason: pi.last_payment_error?.message,
            funds_status: 'not_charged'
          }),
          user_email: user_email || 'unknown',
          timestamp: new Date().toISOString()
        });
      } catch (err) { console.error('Audit log error:', err.message); }
    }

    // ── Phase 8: charge.refunded ──────────────────────────────────────────
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const refundAmount = charge.amount_refunded / 100;
      console.log('[REFUND] Processed:', charge.id, 'Amount:', refundAmount);

      try {
        // Find payment by stripe session and reverse the split
        const payments = await base44.asServiceRole.entities.Payment.filter({
          stripe_session_id: charge.payment_intent
        });
        if (payments[0]) {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, {
            status: 'refunded',
            refund_amount: refundAmount,
            refund_date: new Date().toISOString()
          });

          // Reverse revenue split record
          const splits = await base44.asServiceRole.entities.PaymentSplit.filter({
            booking_id: payments[0].booking_id
          });
          if (splits[0]) {
            await base44.asServiceRole.entities.PaymentSplit.update(splits[0].id, {
              status: 'refunded',
              net_profit: 0
            });
          }

          console.log('[PHASE 8] Refund accounting reversed for booking:', payments[0].booking_id);
        }
      } catch (err) { console.error('Refund reversal error:', err.message); }
    }

    // ── Phase 9: charge.dispute.created ─────────────────────────────────
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object;
      console.error('[CHARGEBACK] Dispute opened:', dispute.id, 'Amount:', dispute.amount / 100);

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'chargeback_opened',
          entity_type: 'payment',
          entity_id: dispute.charge,
          details: JSON.stringify({
            dispute_id: dispute.id,
            amount: dispute.amount / 100,
            reason: dispute.reason,
            status: dispute.status,
            due_by: new Date(dispute.evidence_details?.due_by * 1000).toISOString()
          }),
          user_email: 'system@gctravelandtours.com',
          timestamp: new Date().toISOString()
        });
      } catch (err) { console.error('Chargeback log error:', err.message); }
    }

    // ── Phase 9: charge.dispute.closed ──────────────────────────────────
    if (event.type === 'charge.dispute.closed') {
      const dispute = event.data.object;
      const outcome = dispute.status === 'won' ? 'WIN – Funds Returned' : 'LOSE – Funds Lost';
      console.log('[CHARGEBACK CLOSED]', outcome, dispute.id);

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'chargeback_resolved',
          entity_type: 'payment',
          entity_id: dispute.charge,
          details: JSON.stringify({ dispute_id: dispute.id, outcome, status: dispute.status }),
          user_email: 'system@gctravelandtours.com',
          timestamp: new Date().toISOString()
        });
      } catch (err) { console.error('Chargeback resolve log error:', err.message); }
    }

    // ── Phase 6: payout.paid (profit withdrawal) ─────────────────────────
    if (event.type === 'payout.paid') {
      const payout = event.data.object;
      console.log('[PAYOUT] Paid:', payout.id, 'Amount:', payout.amount / 100, payout.currency);

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'stripe_payout_paid',
          entity_type: 'payout',
          entity_id: payout.id,
          details: JSON.stringify({
            amount: payout.amount / 100,
            currency: payout.currency,
            arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
            description: payout.description
          }),
          user_email: 'admin@gctravelandtours.com',
          timestamp: new Date().toISOString()
        });
      } catch (err) { console.error('Payout log error:', err.message); }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('[WEBHOOK ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});
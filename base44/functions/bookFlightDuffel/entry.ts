import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─── GC Travel Airline Payment Flow ─────────────────────────────────────────
// 1. Customer pays 100% → GC E-Wallet (temporary holding)
// 2. System sends booking to airline API (Duffel)
// 3. CONFIRMED → Auto split: 75% Supplier, 25% GC Travel
// 4. FAILED    → 100% refund held in wallet for customer to rebook or withdraw
// ────────────────────────────────────────────────────────────────────────────

const SUPPLIER_PCT   = 0.75;
const GC_MARKUP_PCT  = 0.25;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId, passengers, walletTransactionId, totalAmount } = await req.json();

    if (!offerId || !passengers || passengers.length === 0) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) {
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    // Format passengers for Duffel
    const formattedPassengers = passengers.map(p => ({
      id: p.id || crypto.randomUUID(),
      given_name: p.first_name || p.given_name,
      family_name: p.last_name || p.family_name,
      born_on: p.date_of_birth || p.born_on,
      email: p.email,
      phone_number: p.phone || p.phone_number,
      gender: p.gender?.toLowerCase() === 'male' ? 'm' : 'f',
      title: p.gender?.toLowerCase() === 'male' ? 'mr' : 'ms'
    }));

    console.log(`[DUFFEL BOOKING] Sending booking request for offer: ${offerId} | Customer: ${user.email}`);

    // Send booking request to Duffel (airline API)
    const orderBody = {
      data: {
        selected_offers: [offerId],
        passengers: formattedPassengers,
        type: 'instant',
        payments: [{
          type: 'balance',
          amount: '0.00',
          currency: 'USD'
        }]
      }
    };

    const orderResponse = await fetch('https://api.duffel.com/air/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2'
      },
      body: JSON.stringify(orderBody)
    });

    // ─── BOOKING FAILED ───────────────────────────────────────────────────
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('[DUFFEL BOOKING FAILED]', errorData);

      // Funds remain in GC E-Wallet — notify customer
      const failureReason = errorData?.errors?.[0]?.message || 'Airline booking failed';

      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: user.email,
          title: '❌ Flight Booking Failed — Funds Safe',
          message: `Your flight booking could not be confirmed (${failureReason}). Your payment of ₱${totalAmount || 'the full amount'} remains safely in your GC E-Wallet. You can rebook or request a full withdrawal.`,
          type: 'booking_failed',
          link: '/Wallet'
        });
      } catch (notifErr) {
        console.error('[NOTIFY] Failed to send booking failure notification:', notifErr.message);
      }

      // Log audit trail
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'flight_booking_failed',
          entity_type: 'FlightBooking',
          entity_id: walletTransactionId || 'unknown',
          details: JSON.stringify({
            offer_id: offerId,
            user_email: user.email,
            wallet_transaction_id: walletTransactionId,
            failure_reason: failureReason,
            funds_status: '100% held in GC E-Wallet — available for rebook or refund'
          }),
          user_email: user.email,
          timestamp: new Date().toISOString()
        });
      } catch (auditErr) {
        console.error('[AUDIT] Failed to log booking failure:', auditErr.message);
      }

      return Response.json({
        success: false,
        error: 'Flight booking failed',
        reason: failureReason,
        funds_status: 'held_in_wallet',
        message: 'Your payment is safely held in your GC E-Wallet. You may rebook or request a full refund.',
        details: errorData
      }, { status: 200 }); // 200 so frontend can read the message
    }

    // ─── BOOKING SUCCESS ──────────────────────────────────────────────────
    const order = await orderResponse.json();
    const confirmedAmount = parseFloat(order.data.total_amount);
    const supplierAmount  = parseFloat((confirmedAmount * SUPPLIER_PCT).toFixed(2));
    const gcMarkupAmount  = parseFloat((confirmedAmount * GC_MARKUP_PCT).toFixed(2));

    console.log(`[DUFFEL SUCCESS] Order: ${order.data.id} | Total: ${confirmedAmount} | Supplier(75%): ${supplierAmount} | GC(25%): ${gcMarkupAmount}`);

    // Create flight booking record (confirmed)
    const flightBooking = await base44.asServiceRole.entities.FlightBooking.create({
      user_email: user.email,
      flight_number: order.data.booking_reference,
      passenger_name: `${passengers[0].first_name || passengers[0].given_name} ${passengers[0].last_name || passengers[0].family_name}`,
      passenger_email: passengers[0].email,
      passenger_phone: passengers[0].phone || passengers[0].phone_number,
      passport_number: passengers[0].passport_number,
      date_of_birth: passengers[0].date_of_birth || passengers[0].born_on,
      cabin_class: order.data.slices[0].segments[0].passengers[0].cabin_class,
      number_of_passengers: passengers.length,
      total_price: confirmedAmount,
      status: 'confirmed',
      payment_status: 'paid',
      supplier: 'duffel',
      supplier_reference: order.data.id,
      route: `${order.data.slices[0].origin.city_name} - ${order.data.slices[0].destination.city_name}`,
      trip_type: order.data.slices.length > 1 ? 'roundtrip' : 'one_way'
    });

    // Auto-split: log 75/25 revenue split (triggered ONLY on confirmed booking)
    try {
      await base44.asServiceRole.entities.PaymentSplit.create({
        booking_id: flightBooking.id,
        booking_type: 'flight',
        gross_amount: confirmedAmount,
        supplier_amount: supplierAmount,
        agency_amount: gcMarkupAmount,
        currency: order.data.total_currency || 'USD',
        user_email: user.email,
        split_date: new Date().toISOString(),
        status: 'settled',
        notes: `Auto-split on confirmed Duffel booking ${order.data.id}. 75% (${supplierAmount}) to airline supplier, 25% (${gcMarkupAmount}) to GC Travel.`
      });

      console.log(`[AUTO SPLIT] ✅ Booking confirmed. 75% supplier: ${supplierAmount} | 25% GC Travel: ${gcMarkupAmount}`);
    } catch (splitErr) {
      console.error('[SPLIT] Revenue split log error:', splitErr.message);
    }

    // Create pending supplier payment record (75% to airline)
    try {
      const existing = await base44.asServiceRole.entities.SupplierPayment.filter({ booking_id: flightBooking.id });
      if (existing.length === 0) {
        await base44.asServiceRole.entities.SupplierPayment.create({
          booking_id: flightBooking.id,
          booking_type: 'flight',
          supplier: 'duffel',
          supplier_amount: supplierAmount,
          customer_paid_amount: confirmedAmount,
          markup_retained: gcMarkupAmount,
          payment_status: 'pending',
          payment_method: 'manual',
          notes: `Duffel flight confirmed. 75% (${supplierAmount}) to be settled with airline supplier. 25% (${gcMarkupAmount}) retained by GC Travel.`
        });
        console.log(`[SUPPLIER PAYMENT] Pending record created: ${supplierAmount} to Duffel/airline`);
      }
    } catch (supErr) {
      console.error('[SUPPLIER] Record creation error:', supErr.message);
    }

    // Audit trail for successful split
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'flight_booking_split_executed',
        entity_type: 'FlightBooking',
        entity_id: flightBooking.id,
        details: JSON.stringify({
          duffel_order_id: order.data.id,
          booking_reference: order.data.booking_reference,
          total_amount: confirmedAmount,
          supplier_75pct: supplierAmount,
          gc_travel_25pct: gcMarkupAmount,
          wallet_transaction_id: walletTransactionId,
          split_trigger: 'booking_confirmed'
        }),
        user_email: user.email,
        timestamp: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error('[AUDIT] Split audit log error:', auditErr.message);
    }

    // Send success notification to customer
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        title: '✅ Flight Confirmed — E-Ticket Issued',
        message: `Your flight (${order.data.booking_reference}) has been confirmed and your e-ticket is on the way! Route: ${order.data.slices[0].origin.city_name} → ${order.data.slices[0].destination.city_name}`,
        type: 'payment_confirmed',
        booking_id: flightBooking.id,
        link: '/MyFlightBookings'
      });
    } catch (notifErr) {
      console.error('[NOTIFY] Success notification error:', notifErr.message);
    }

    return Response.json({
      success: true,
      booking: flightBooking,
      order: order.data,
      split: {
        total: confirmedAmount,
        supplier_75pct: supplierAmount,
        gc_travel_25pct: gcMarkupAmount,
        status: 'auto_split_complete'
      }
    });

  } catch (error) {
    console.error('[DUFFEL BOOKING ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
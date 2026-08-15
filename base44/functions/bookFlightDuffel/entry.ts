import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─── GC Travel Airline Booking Flow (real) ──────────────────────────────────
// Triggered by the PayMongo webhook AFTER a flight payment is confirmed.
// Creates the real Duffel airline order, then:
//   SUCCESS  → booking confirmed + airline reference + 75/25 revenue split
//   FAILURE  → booking cancelled + payment marked refunded + customer notified
// ────────────────────────────────────────────────────────────────────────────

const SUPPLIER_PCT = 0.75;
const GC_MARKUP_PCT = 0.25;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { bookingId } = await req.json();
    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Load the booking record (service role — called from the webhook with no user session)
    const bookings = await base44.asServiceRole.entities.FlightBooking.filter({ id: bookingId });
    const booking = bookings?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    // Idempotency / guard: only book once payment is actually confirmed
    if (booking.status === 'confirmed') {
      return Response.json({ success: true, alreadyConfirmed: true, booking_id: bookingId });
    }
    if (booking.payment_status !== 'paid') {
      return Response.json({ error: 'Booking is not paid yet — cannot create airline order' }, { status: 400 });
    }

    const offerId = booking.offer_id;
    if (!offerId) {
      return Response.json({ error: 'No Duffel offer linked to this booking' }, { status: 400 });
    }

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) {
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    // Build passengers from the booking record (primary passenger details per seat)
    const fullName = (booking.passenger_name || 'Passenger Passenger').trim();
    const nameParts = fullName.split(/\s+/);
    const basePax = {
      given_name: nameParts[0] || 'Passenger',
      family_name: nameParts.slice(1).join(' ') || 'Passenger',
      born_on: booking.date_of_birth || '1990-01-01',
      email: booking.passenger_email,
      phone_number: booking.passenger_phone,
      gender: 'm',
      title: 'mr'
    };
    const paxCount = Math.max(1, booking.number_of_passengers || 1);
    const formattedPassengers = Array.from({ length: paxCount }, () => ({
      id: crypto.randomUUID(),
      ...basePax
    }));

    const supplierFare = String(booking.supplier_fare ?? +(booking.total_price * SUPPLIER_PCT).toFixed(2));
    const supplierCurrency = booking.supplier_currency || 'USD';

    console.log(`[DUFFEL BOOKING] booking=${bookingId} offer=${offerId} pax=${paxCount} fare=${supplierFare} ${supplierCurrency}`);

    const orderBody = {
      data: {
        selected_offers: [offerId],
        passengers: formattedPassengers,
        type: 'instant',
        payments: [{ type: 'balance', amount: supplierFare, currency: supplierCurrency }]
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
      const errorData = await orderResponse.json().catch(() => ({}));
      const failureReason = errorData?.errors?.[0]?.message || 'Airline booking failed';
      console.error('[DUFFEL BOOKING FAILED]', JSON.stringify(errorData));

      // Customer already paid via PayMongo → mark for refund
      await base44.asServiceRole.entities.FlightBooking.update(bookingId, {
        status: 'cancelled',
        payment_status: 'refunded'
      });

      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: booking.passenger_email,
          title: '❌ Flight Booking Failed — Refund Processing',
          message: `Your flight booking could not be confirmed (${failureReason}). A full refund will be processed to your original payment method within 3-7 business days. We apologize for the inconvenience.`,
          type: 'booking_failed',
          link: '/MyFlightBookings'
        });
      } catch (e) { console.error('[NOTIFY]', e.message); }

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: 'flight_booking_failed',
          entity_type: 'FlightBooking',
          entity_id: bookingId,
          details: JSON.stringify({ offer_id: offerId, failure_reason: failureReason, refund: 'pending' }),
          user_email: booking.passenger_email,
          timestamp: new Date().toISOString()
        });
      } catch (e) { console.error('[AUDIT]', e.message); }

      return Response.json({ success: false, error: failureReason, refund: 'processing' }, { status: 200 });
    }

    // ─── BOOKING SUCCESS ──────────────────────────────────────────────────
    const order = await orderResponse.json();
    const confirmedAmount = parseFloat(order.data.total_amount);
    const supplierAmount = parseFloat((confirmedAmount * SUPPLIER_PCT).toFixed(2));
    const gcMarkupAmount = parseFloat((confirmedAmount * GC_MARKUP_PCT).toFixed(2));
    const airlineRef = order.data.booking_reference;

    console.log(`[DUFFEL SUCCESS] Order: ${order.data.id} | Airline Ref: ${airlineRef} | Total: ${confirmedAmount}`);

    // Extract schedule + airline details from the Duffel order so the Google
    // Calendar automation can build an accurate event on confirmation.
    const firstSlice = order.data.slices?.[0];
    const departureTime = firstSlice?.segments?.[0]?.departing_at || null;
    const airlineName = order.data.owner?.name || null;

    // Update the existing booking with the airline confirmation
    await base44.asServiceRole.entities.FlightBooking.update(bookingId, {
      status: 'confirmed',
      payment_status: 'paid',
      supplier: 'duffel',
      supplier_reference: order.data.id,
      departure_time: departureTime,
      airline_name: airlineName
    });

    // Revenue split + supplier payment are handled by the wallet escrow settle
    // workflow (triggered by the status → confirmed change above): 75% airline
    // / 25% GC on success, 100% refund on failure. No inline split here to
    // avoid duplicate records.

    // Audit trail
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'flight_booking_confirmed',
        entity_type: 'FlightBooking',
        entity_id: bookingId,
        details: JSON.stringify({
          duffel_order_id: order.data.id,
          airline_reference: airlineRef,
          total_amount: confirmedAmount,
          supplier_75pct: supplierAmount,
          gc_25pct: gcMarkupAmount
        }),
        user_email: booking.passenger_email,
        timestamp: new Date().toISOString()
      });
    } catch (e) { console.error('[AUDIT]', e.message); }

    // Sales activity + commission
    try {
      await base44.asServiceRole.entities.SalesActivity.create({
        lead_id: bookingId,
        sales_person: booking.passenger_email,
        activity_type: 'status_change',
        subject: `Flight Booking Confirmed — ${booking.route}`,
        description: `Booking ${booking.booking_ref || bookingId.slice(-8)} for ${booking.passenger_name}. ${paxCount} pax. Total: ${booking.total_price}`,
        outcome: 'positive'
      });
    } catch (e) { console.error('[SALES]', e.message); }

    try {
      await base44.asServiceRole.entities.SalesCommission.create({
        sales_person: booking.passenger_email,
        booking_id: bookingId,
        booking_type: 'flight',
        booking_value: booking.total_price,
        commission_rate: 25,
        commission_amount: gcMarkupAmount,
        status: 'pending',
        notes: `Duffel order ${order.data.id} | ${booking.passenger_name} | Ref: ${booking.booking_ref || bookingId.slice(-8)}`
      });
    } catch (e) { console.error('[COMMISSION]', e.message); }

    // Confirmation notification
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.passenger_email,
        title: '✅ Flight Confirmed — E-Ticket Issued',
        message: `Your flight has been confirmed! Airline reference: ${airlineRef}. Route: ${booking.route}. Your e-ticket details have been sent to your email.`,
        type: 'payment_confirmed',
        booking_id: bookingId,
        link: '/MyFlightBookings'
      });
    } catch (e) { console.error('[NOTIFY]', e.message); }

    // Confirmation email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: booking.passenger_email,
        subject: `Flight Confirmed — ${booking.booking_ref || airlineRef}`,
        body: `Hello ${booking.passenger_name},\n\nYour flight has been confirmed!\n\nAirline Reference: ${airlineRef}\nDuffel Order: ${order.data.id}\nRoute: ${booking.route}\nFlight: ${booking.flight_number}\nCabin: ${booking.cabin_class}\nPassengers: ${paxCount}\n\nThank you for booking with GC Travel & Tours. Please arrive at the airport at least 3 hours before your international flight.`
      });
    } catch (e) { console.error('[EMAIL]', e.message); }

    return Response.json({
      success: true,
      booking_id: bookingId,
      duffel_order_id: order.data.id,
      airline_reference: airlineRef,
      split: { total: confirmedAmount, supplier_75pct: supplierAmount, gc_25pct: gcMarkupAmount }
    });

  } catch (error) {
    console.error('[DUFFEL BOOKING ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
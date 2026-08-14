import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Duffel Order Webhook Receiver ───────────────────────────────────────────
// Verifies authenticity using the Duffel_Webhook_Secret signing secret, then
// processes async order lifecycle events (airline-initiated changes/cancellations)
// that occur AFTER the initial order was created synchronously by bookFlightDuffel.
// ──────────────────────────────────────────────────────────────────────────────

// Signature format:  t=<timestamp>,v1=<hex-lowercase-hmac>
// signed payload:    `${timestamp}.${rawBody}`
// digest:            HMAC-SHA256(secret, signedPayload) → hex lowercase
async function verifyDuffelSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = {};
  signatureHeader.split(',').forEach((p) => {
    const idx = p.indexOf('=');
    if (idx > -1) parts[p.slice(0, idx).trim()] = p.slice(idx + 1).trim();
  });
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;

  // Reject stale requests (>5 min) to prevent replay attacks
  const ageMs = Date.now() - (parseInt(t, 10) * 1000);
  if (isNaN(ageMs) || ageMs > 5 * 60 * 1000) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${rawBody}`));
  const hex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('X-Duffel-Signature') || '';

    const webhookSecret = Deno.env.get('Duffel_Webhook_Secret');
    if (!webhookSecret) {
      console.error('[DUFFEL WEBHOOK] Duffel_Webhook_Secret not configured');
      return Response.json({ error: 'Webhook signing secret not configured' }, { status: 500 });
    }

    const valid = await verifyDuffelSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      console.warn('[DUFFEL WEBHOOK] signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.type;
    console.log(`[DUFFEL WEBHOOK] type=${eventType} id=${event?.id}`);

    // Duffel test ping — just acknowledge
    if (eventType === 'ping.triggered') {
      return Response.json({ received: true, type: eventType });
    }

    // Order lifecycle events carry data.object = the order
    const order = event?.data?.object;
    if (!order || !order.id) {
      return Response.json({ received: true, ignored: 'no order object' });
    }

    const base44 = createClientFromRequest(req);

    // Find the booking linked to this Duffel order (stored by bookFlightDuffel)
    const matches = await base44.asServiceRole.entities.FlightBooking.filter({
      supplier_reference: order.id,
    });
    const booking = matches?.[0];
    if (!booking) {
      console.log(`[DUFFEL WEBHOOK] No booking linked to order ${order.id}`);
      return Response.json({ received: true, ignored: 'no linked booking' });
    }

    // Airline-initiated change / cancellation
    if (
      eventType === 'order.airline_initiated_change_detected' ||
      eventType === 'order.updated'
    ) {
      const isCancelled =
        order.status === 'cancelled' ||
        (Array.isArray(order.refunds) &&
          order.refunds.some((r) => r?.status === 'succeeded'));

      if (isCancelled && booking.status !== 'cancelled') {
        await base44.asServiceRole.entities.FlightBooking.update(booking.id, {
          status: 'cancelled',
          payment_status: 'refunded',
        });

        try {
          await base44.asServiceRole.entities.Notification.create({
            user_email: booking.passenger_email,
            title: '⚠️ Flight Changed by Airline',
            message: `Your flight booking (ref ${booking.booking_ref || booking.id.slice(-8)}) was changed or cancelled by the airline. Our team will contact you with rebooking or refund options shortly.`,
            type: 'booking_failed',
            link: '/MyFlightBookings',
          });
        } catch (e) {
          console.error('[DUFFEL WEBHOOK] notify:', e.message);
        }

        try {
          await base44.asServiceRole.entities.AuditLog.create({
            action: 'flight_airline_cancelled',
            entity_type: 'FlightBooking',
            entity_id: booking.id,
            details: JSON.stringify({
              duffel_order_id: order.id,
              event_type: eventType,
              order_status: order.status,
            }),
            user_email: booking.passenger_email,
            timestamp: new Date().toISOString(),
          });
        } catch (e) {
          console.error('[DUFFEL WEBHOOK] audit:', e.message);
        }
      }
    }

    return Response.json({ received: true, type: eventType, booking_id: booking.id });
  } catch (error) {
    console.error('[DUFFEL WEBHOOK ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
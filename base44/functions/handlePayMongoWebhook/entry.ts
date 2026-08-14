import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signatureHeader = req.headers.get('paymongo-signature');
    const payload = await req.text();

    // Verify webhook signature using PayMongo_Webhook_Details (signing secret)
    const webhookSecret = resolveWebhookSecret(Deno.env.get('PayMongo_Webhook_Details'));
    if (!webhookSecret) {
      console.error('PayMongo webhook: PayMongo_Webhook_Details signing secret not set');
      return Response.json({ error: 'Webhook signing secret not configured' }, { status: 500 });
    }

    const isValid = await verifyPayMongoSignature(payload, signatureHeader, webhookSecret);
    if (!isValid) {
      console.warn('PayMongo webhook: signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    console.log('PayMongo webhook event:', event.data.attributes.type);

    // Handle payment.paid event
    if (event.data.attributes.type === 'payment.paid') {
      const paymentIntent = event.data.attributes.data;
      const metadata = paymentIntent.attributes.metadata;
      
      if (!metadata || !metadata.booking_id || !metadata.booking_type) {
        console.log('Missing metadata in payment intent');
        return Response.json({ received: true });
      }

      const { booking_id, booking_type } = metadata;
      console.log(`Processing payment for ${booking_type} booking ${booking_id}`);

      // Update booking based on type
      switch (booking_type) {
        case 'flight':
          // Mark payment received; status stays 'pending' until the airline (Duffel) confirms the order
          await base44.asServiceRole.entities.FlightBooking.update(booking_id, {
            payment_status: 'paid'
          });
          // Create the real airline order now that payment is confirmed
          try {
            await base44.asServiceRole.functions.invoke('bookFlightDuffel', { bookingId: booking_id });
          } catch (err) {
            console.error('[DUFFEL] Airline booking failed after payment for', booking_id, err.message);
          }
          break;
        
        case 'hotel':
          await base44.asServiceRole.entities.HotelBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'ferry':
          await base44.asServiceRole.entities.FerryBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'cruise':
          await base44.asServiceRole.entities.CruiseBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'train':
          await base44.asServiceRole.entities.TrainBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'tour':
          await base44.asServiceRole.entities.Booking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'car':
          await base44.asServiceRole.entities.CarRentalBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'bus':
          await base44.asServiceRole.entities.BusBooking.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'visa':
          await base44.asServiceRole.entities.VisaAppointment.update(booking_id, {
            payment_status: 'paid',
            status: 'confirmed'
          });
          break;
        
        case 'insurance':
          await base44.asServiceRole.entities.InsurancePolicy.update(booking_id, {
            payment_status: 'paid',
            status: 'active'
          });
          break;
        
        default:
          console.log(`Unknown booking type: ${booking_type}`);
      }

      // Send confirmation notification
      const booking = await base44.asServiceRole.entities[getEntityName(booking_type)].get(booking_id);
      if (booking) {
        const userEmail = booking.passenger_email || booking.guest_email || booking.renter_email || booking.applicant_email || booking.user_email;
        
        // For flights, bookFlightDuffel sends the real confirmation email — skip the generic one
        if (booking_type !== 'flight') {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: 'Payment Confirmed - GC Travel & Tours',
            body: `Your payment has been confirmed for booking ${booking_id}. You will receive your booking details shortly.`
          });
        }

        // Credit wallet with 5% cashback
        try {
          await base44.asServiceRole.functions.invoke('creditWalletOnBooking', {
            user_email: userEmail,
            booking_id: booking_id,
            booking_type: booking_type,
            payment_amount: paymentIntent.attributes.amount / 100,
            payment_method: 'paymongo'
          });
        } catch (err) { console.error('Wallet credit error:', err.message); }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('PayMongo webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getEntityName(bookingType) {
  const mapping = {
    flight: 'FlightBooking',
    hotel: 'HotelBooking',
    ferry: 'FerryBooking',
    cruise: 'CruiseBooking',
    train: 'TrainBooking',
    tour: 'Booking',
    car: 'CarRentalBooking',
    bus: 'BusBooking',
    visa: 'VisaAppointment',
    insurance: 'InsurancePolicy'
  };
  return mapping[bookingType] || 'Booking';
}

function resolveWebhookSecret(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (typeof obj === 'string') return obj;
    return obj.secret || obj.signing_secret || obj.webhook_secret || obj.webhookSecret || null;
  } catch {
    return raw;
  }
}

async function verifyPayMongoSignature(rawPayload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  let timestamp, signature;
  for (const part of signatureHeader.split(',')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx);
    const value = part.slice(idx + 1);
    if (key === 't') timestamp = value;
    if (key === 'v1') signature = value;
  }
  if (!timestamp || !signature) return false;

  // Reject replayed webhooks older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${rawPayload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}
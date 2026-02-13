import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  let event;
  
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata.booking_id;
      const bookingType = session.metadata.booking_type;
      const bookingData = session.metadata.booking_data;

      if (bookingType === 'flight' && bookingId) {
        await base44.asServiceRole.entities.FlightBooking.update(bookingId, {
          payment_status: 'paid',
          status: 'confirmed'
        });
        
        console.log(`Flight booking ${bookingId} marked as paid`);
      }

      // Handle hotel booking via Amadeus
      if (bookingData) {
        try {
          const data = JSON.parse(bookingData);
          
          if (data.hotel && data.offer) {
            const bookingResult = await base44.asServiceRole.functions.invoke('bookHotel', {
              hotelOffer: {
                ...data.offer,
                hotel: data.hotel
              },
              guestDetails: data.guestDetails
            });
            console.log('Hotel booking completed via webhook:', bookingResult.data);
          } else if (data.flightOffer) {
            const bookingResult = await base44.asServiceRole.functions.invoke('bookFlight', {
              flightOffer: data.flightOffer,
              passengerDetails: data.passengerDetails
            });
            console.log('Flight booking completed via webhook:', bookingResult.data);
          }
        } catch (err) {
          console.error('Error processing booking:', err);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
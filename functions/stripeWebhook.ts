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
        
        // Get booking details to send confirmation email
        const bookings = await base44.asServiceRole.entities.FlightBooking.filter({ id: bookingId });
        const booking = bookings[0];
        
        if (booking) {
          // Send confirmation email with ticket link
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: booking.passenger_email,
            subject: `Flight Booking Confirmed - ${booking.flight_number}`,
            body: `
              <h2>Booking Confirmed!</h2>
              <p>Dear ${booking.passenger_name},</p>
              <p>Your flight booking has been confirmed and payment received.</p>
              <p><strong>Booking Reference:</strong> ${bookingId.substring(0, 8).toUpperCase()}</p>
              <p><strong>Flight:</strong> ${booking.flight_number}</p>
              <p><strong>Route:</strong> ${booking.route}</p>
              <p><a href="${Deno.env.get('APP_URL') || 'https://your-app-url'}/FlightTicket?id=${bookingId}" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:16px 0;">View Your E-Ticket</a></p>
              <p>Thank you for choosing GC Travel & Tours!</p>
            `
          });
        }
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
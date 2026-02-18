import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, paymentMethod } = await req.json();

    // Get the train booking
    const booking = await base44.entities.TrainBooking.get(bookingId);
    
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get train details
    const train = await base44.entities.Train.get(booking.train_id);

    if (paymentMethod === 'stripe') {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Train: ${train.origin_station} → ${train.destination_station}`,
                description: `${train.operator} - ${train.train_number} | ${booking.class_type}`,
              },
              unit_amount: Math.round(booking.total_price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/TrainBookingConfirmation?id=${bookingId}&payment=success`,
        cancel_url: `${req.headers.get('origin')}/TrainSearch?payment=cancelled`,
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          booking_id: bookingId,
          booking_type: 'train',
        },
      });

      return Response.json({ 
        sessionId: session.id,
        url: session.url,
        bookingId: booking.id
      });
    } else if (paymentMethod === 'paymongo') {
      // PayMongo integration
      const paymongoApiKey = Deno.env.get('PayMongo_API_KEY');
      const authHeader = 'Basic ' + btoa(paymongoApiKey + ':');

      const paymentResponse = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(booking.total_price * 100),
              description: `Train: ${train.origin_station} → ${train.destination_station} - ${train.train_number}`,
              remarks: `Booking ID: ${bookingId}`
            }
          }
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.data) {
        return Response.json({
          url: paymentData.data.attributes.checkout_url,
          bookingId: booking.id
        });
      } else {
        throw new Error('PayMongo payment link creation failed');
      }
    } else {
      return Response.json({ error: 'Invalid payment method' }, { status: 400 });
    }
  } catch (error) {
    console.error('Train checkout error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
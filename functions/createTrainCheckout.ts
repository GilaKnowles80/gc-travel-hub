import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@18.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, paymentMethod = 'stripe' } = await req.json();

    const booking = await base44.entities.TrainBooking.get(bookingId);
    
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const train = await base44.entities.Train.get(booking.train_id);
    const description = `Train: ${train.origin_station} → ${train.destination_station} - ${train.train_number} | ${booking.class_type}`;

    if (paymentMethod === 'stripe') {
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
              description: description,
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
    } else if (paymentMethod === 'paypal') {
      const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const paypalSecret = Deno.env.get('PAYPAL_SECRET');
      const auth = btoa(`${paypalClientId}:${paypalSecret}`);

      const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const { access_token } = await tokenResponse.json();

      const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: booking.total_price.toFixed(2)
            },
            description: description
          }],
          application_context: {
            return_url: `${req.headers.get('origin')}/TrainBookingConfirmation?id=${bookingId}&payment=success`,
            cancel_url: `${req.headers.get('origin')}/TrainSearch?payment=cancelled`
          }
        })
      });

      const orderData = await orderResponse.json();
      const approvalUrl = orderData.links.find(link => link.rel === 'approve').href;

      return Response.json({ url: approvalUrl, orderId: orderData.id, bookingId: booking.id });
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
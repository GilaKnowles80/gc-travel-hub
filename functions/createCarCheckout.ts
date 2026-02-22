import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@18.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, amount, currency = 'USD', paymentMethod = 'stripe' } = await req.json();

    if (!bookingId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await base44.entities.CarRentalBooking.get(bookingId);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const description = `Car Rental - ${booking.car_model} | ${booking.rental_days} day(s) rental`;

    if (paymentMethod === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Car Rental - ${booking.car_model}`,
              description: `${booking.rental_days} day(s) rental`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/payment-success?booking_id=${bookingId}&type=car`,
        cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
        metadata: {
          booking_id: bookingId,
          booking_type: 'car',
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          user_email: user.email,
        },
      });

      return Response.json({ url: session.url, sessionId: session.id });
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
              amount: Math.round(amount * 100),
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
              currency_code: currency,
              value: amount.toFixed(2)
            },
            description: description
          }],
          application_context: {
            return_url: `${req.headers.get('origin')}/payment-success?booking_id=${bookingId}&type=car`,
            cancel_url: `${req.headers.get('origin')}/payment-cancelled`
          }
        })
      });

      const orderData = await orderResponse.json();
      const approvalUrl = orderData.links.find(link => link.rel === 'approve').href;

      return Response.json({ url: approvalUrl, orderId: orderData.id });
    } else {
      return Response.json({ error: 'Invalid payment method' }, { status: 400 });
    }
  } catch (error) {
    console.error('Car rental checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
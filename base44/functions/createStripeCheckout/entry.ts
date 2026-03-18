import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingType, bookingId, amount, currency = 'USD', metadata = {} } = await req.json();

    if (!bookingType || !bookingId || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get booking details based on type
    let booking;
    let description = '';
    
    switch (bookingType) {
      case 'flight':
        booking = await base44.entities.FlightBooking.get(bookingId);
        description = `Flight Booking - ${booking.route}`;
        break;
      case 'hotel':
        booking = await base44.entities.HotelBooking.get(bookingId);
        description = `Hotel Booking - ${booking.hotel_name}`;
        break;
      case 'tour':
        booking = await base44.entities.Booking.get(bookingId);
        description = `Tour Booking - ${booking.tour_title}`;
        break;
      case 'bulk':
        booking = await base44.entities.BulkBooking.get(bookingId);
        description = `Bulk Booking - ${booking.item_name}`;
        break;
      default:
        description = `${bookingType} Booking`;
    }

    // Create payment record
    const payment = await base44.entities.Payment.create({
      user_email: user.email,
      booking_type: bookingType,
      booking_id: bookingId,
      amount: amount,
      currency: currency,
      payment_method: 'stripe',
      status: 'pending',
      metadata: metadata
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: description,
            description: `Booking ID: ${bookingId}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancelled?payment_id=${payment.id}`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id: payment.id,
        booking_id: bookingId,
        booking_type: bookingType,
        user_email: user.email
      }
    });

    // Update payment with session ID
    await base44.entities.Payment.update(payment.id, {
      stripe_session_id: session.id
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url,
      paymentId: payment.id
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
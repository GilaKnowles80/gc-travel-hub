import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { package_id } = await req.json();

    // Get package details
    const packageBooking = await base44.entities.PackageBooking.get(package_id);

    if (!packageBooking || packageBooking.user_email !== user.email) {
      return Response.json({ error: 'Package not found' }, { status: 404 });
    }

    // Build line items
    const lineItems = [];

    // Add flights
    packageBooking.flights?.forEach(flight => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `✈️ Flight: ${flight.origin} → ${flight.destination}`,
            description: `${flight.airline} ${flight.flight_number} • ${flight.cabin_class} • ${flight.passengers} passenger(s)`,
          },
          unit_amount: Math.round(flight.price * 100),
        },
        quantity: flight.passengers,
      });
    });

    // Add hotels
    packageBooking.hotels?.forEach(hotel => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `🏨 Hotel: ${hotel.hotel_name}`,
            description: `${hotel.location} • ${hotel.nights} night(s) • ${hotel.rooms} room(s)`,
          },
          unit_amount: Math.round(hotel.price * 100),
        },
        quantity: hotel.nights * hotel.rooms,
      });
    });

    // Add tours
    packageBooking.tours?.forEach(tour => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `🗺️ Tour: ${tour.tour_name}`,
            description: `${tour.destination} • ${tour.duration} days • ${tour.participants} participant(s)`,
          },
          unit_amount: Math.round(tour.price * 100),
        },
        quantity: tour.participants,
      });
    });

    // Add discount if applicable
    const discounts = packageBooking.discount_percentage > 0 ? [{
      coupon: await stripe.coupons.create({
        percent_off: packageBooking.discount_percentage,
        duration: 'once',
        name: `Package Discount ${packageBooking.discount_percentage}%`,
      }).then(c => c.id)
    }] : [];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts: discounts,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/PackageBookingSuccess?session_id={CHECKOUT_SESSION_ID}&package_id=${package_id}`,
      cancel_url: `${req.headers.get('origin')}/PaymentCancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        package_id: package_id,
        user_email: user.email,
        booking_type: 'package'
      },
    });

    // Update package status
    await base44.entities.PackageBooking.update(package_id, {
      status: 'confirmed'
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Package checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
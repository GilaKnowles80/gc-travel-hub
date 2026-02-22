import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId, passengers } = await req.json();

    if (!offerId || !passengers || passengers.length === 0) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const duffelApiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!duffelApiKey) {
      return Response.json({ error: 'Duffel API key not configured' }, { status: 500 });
    }

    // Format passengers for Duffel
    const formattedPassengers = passengers.map(p => ({
      id: p.id || crypto.randomUUID(),
      given_name: p.first_name || p.given_name,
      family_name: p.last_name || p.family_name,
      born_on: p.date_of_birth || p.born_on,
      email: p.email,
      phone_number: p.phone || p.phone_number,
      gender: p.gender?.toLowerCase() === 'male' ? 'm' : 'f',
      title: p.gender?.toLowerCase() === 'male' ? 'mr' : 'ms'
    }));

    // Create order
    const orderBody = {
      data: {
        selected_offers: [offerId],
        passengers: formattedPassengers,
        type: 'instant',
        payments: [{
          type: 'balance',
          amount: '0.00',
          currency: 'USD'
        }]
      }
    };

    const orderResponse = await fetch('https://api.duffel.com/air/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v1'
      },
      body: JSON.stringify(orderBody)
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Duffel booking error:', errorData);
      return Response.json({ 
        error: 'Failed to book flight', 
        details: errorData 
      }, { status: orderResponse.status });
    }

    const order = await orderResponse.json();

    // Create flight booking record in database
    const flightBooking = await base44.asServiceRole.entities.FlightBooking.create({
      user_email: user.email,
      flight_number: order.data.booking_reference,
      passenger_name: `${passengers[0].first_name || passengers[0].given_name} ${passengers[0].last_name || passengers[0].family_name}`,
      passenger_email: passengers[0].email,
      passenger_phone: passengers[0].phone || passengers[0].phone_number,
      passport_number: passengers[0].passport_number,
      date_of_birth: passengers[0].date_of_birth || passengers[0].born_on,
      cabin_class: order.data.slices[0].segments[0].passengers[0].cabin_class,
      number_of_passengers: passengers.length,
      total_price: parseFloat(order.data.total_amount),
      status: 'confirmed',
      payment_status: 'paid',
      supplier: 'duffel',
      supplier_reference: order.data.id,
      route: `${order.data.slices[0].origin.city_name} - ${order.data.slices[0].destination.city_name}`,
      trip_type: order.data.slices.length > 1 ? 'roundtrip' : 'one_way'
    });

    return Response.json({
      success: true,
      booking: flightBooking,
      order: order.data
    });

  } catch (error) {
    console.error('Duffel booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
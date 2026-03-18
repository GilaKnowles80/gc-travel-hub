import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Tripzynx is a tour management platform - bookings are stored in our own entity
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tour_id, travelers_list, departure_date, addons, contact_name, contact_email, contact_phone, special_requests } = await req.json();

    if (!tour_id || !contact_name || !contact_email) {
      return Response.json({ error: 'tour_id, contact_name, and contact_email are required' }, { status: 400 });
    }

    console.log('Tripzynx booking request:', { tour_id, departure_date, contact_name });

    // Fetch tour details
    const tours = await base44.asServiceRole.entities.Tour.filter({ id: tour_id });
    if (!tours.length) {
      return Response.json({ error: 'Tour not found' }, { status: 404 });
    }
    const tour = tours[0];

    const travelers_count = travelers_list?.length || 1;
    const total_price = tour.price_per_person * travelers_count;

    // Create a booking record
    const booking = await base44.asServiceRole.entities.Booking.create({
      booking_type: 'tour',
      tour_id,
      tour_name: tour.title,
      destination: tour.destination,
      contact_name,
      contact_email,
      contact_phone: contact_phone || '',
      travelers_count,
      travelers_list: travelers_list || [],
      departure_date,
      total_price,
      addons: addons || [],
      special_requests: special_requests || '',
      status: 'pending',
      payment_status: 'unpaid',
      supplier: 'tripzynx'
    });

    const booking_reference = `TZX-${Date.now().toString(36).toUpperCase()}`;

    console.log('Tripzynx booking created:', booking.id, booking_reference);

    return Response.json({
      success: true,
      supplier: 'tripzynx',
      booking_id: booking.id,
      reference: booking_reference,
      tour_name: tour.title,
      destination: tour.destination,
      departure_date,
      travelers_count,
      total_price,
      status: 'pending'
    });

  } catch (error) {
    console.error('Tripzynx booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data) {
      return Response.json({ success: true, skipped: true });
    }

    // Only record paid/confirmed bookings
    const isPaidOrConfirmed = 
      (data.payment_status === 'paid' || data.status === 'confirmed') ||
      (data.payment_status === 'partial' && data.status === 'confirmed');

    if (!isPaidOrConfirmed) {
      return Response.json({ success: true, skipped: true });
    }

    const bookingType = event.entity_name;
    const bookingRef = data.booking_ref || `${bookingType}-${data.id}`;
    const userEmail = data.created_by || 'system@gctravelandtours.com';

    // Create SalesActivity record
    const activityDescription = (() => {
      if (bookingType === 'FlightBooking') {
        return `Flight booking confirmed: ${data.flight_number} (${data.route}) - ${data.passenger_name} - ₱${data.total_price || 0}`;
      } else if (bookingType === 'HotelBooking') {
        return `Hotel booking confirmed: ${data.hotel_name} - ${data.guest_name} (${data.number_of_rooms} room(s)) - ₱${data.total_price || 0}`;
      } else if (bookingType === 'Booking') {
        return `Tour booking confirmed: ${data.tour_title} - ${data.customer_name} (${data.number_of_travelers} travelers) - ₱${data.total_price || 0}`;
      } else if (bookingType === 'BusBooking') {
        return `Bus booking confirmed: ${data.route} - ${data.passenger_name} - ₱${data.total_price || 0}`;
      } else if (bookingType === 'FerryBooking') {
        return `Ferry booking confirmed: ${data.route} - ${data.passenger_name} - ₱${data.total_price || 0}`;
      } else if (bookingType === 'CarRentalBooking') {
        return `Car rental confirmed: ${data.car_type} - ${data.driver_name} - ₱${data.total_price || 0}`;
      }
      return `Booking confirmed: ${bookingRef}`;
    })();

    await base44.asServiceRole.entities.SalesActivity.create({
      lead_id: userEmail,
      sales_person: userEmail,
      activity_type: 'status_change',
      subject: `${bookingType} - ${bookingRef}`,
      description: activityDescription,
      outcome: 'positive'
    });

    // Create AuditLog record
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: userEmail,
      action: event.type === 'create' ? 'create' : 'update',
      entity_type: bookingType,
      entity_id: data.id,
      changes: event.type === 'create' ? null : { status: data.status, payment_status: data.payment_status },
      severity: 'medium',
      status: 'success'
    });

    console.log(`✓ Recorded ${bookingType} ${data.id} to SalesActivity and AuditLog`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error recording booking:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
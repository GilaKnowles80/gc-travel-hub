import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;
    const bookingType = event.entity_name;
    const bookingId = event.entity_id;

    // Only record confirmed/paid bookings
    if (data?.status !== 'confirmed' && data?.payment_status !== 'paid') {
      return Response.json({ skipped: true, reason: 'Not confirmed or paid' });
    }

    // Get customer email for the booking
    let customerEmail = data?.customer_email || data?.user_email || data?.passenger_email || data?.guest_email || '';
    
    // Map booking types to readable names
    const typeMap = {
      'FlightBooking': 'Flight',
      'HotelBooking': 'Hotel',
      'Booking': 'Tour',
      'BusBooking': 'Bus',
      'FerryBooking': 'Ferry',
      'CarRentalBooking': 'Car Rental',
      'CruiseBooking': 'Cruise',
      'TrainBooking': 'Train'
    };

    const bookingTypeLabel = typeMap[bookingType] || bookingType;
    const refNumber = data?.booking_ref || bookingId;
    const amount = data?.total_price || 0;

    // Record to SalesActivity
    await base44.asServiceRole.entities.SalesActivity.create({
      activity_type: 'booking_created',
      booking_type: bookingTypeLabel,
      booking_id: bookingId,
      booking_ref: refNumber,
      customer_email: customerEmail,
      customer_name: data?.customer_name || data?.passenger_name || data?.guest_name || 'Unknown',
      amount_value: amount,
      status: 'completed',
      notes: `${bookingTypeLabel} booking confirmed - Ref: ${refNumber}`,
      metadata: {
        supplier: data?.supplier,
        trip_type: data?.trip_type,
        original_data: data
      }
    });

    // Record to AuditLog
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'booking_recorded',
      entity_type: bookingType,
      entity_id: bookingId,
      user_email: customerEmail,
      details: {
        booking_ref: refNumber,
        booking_type: bookingTypeLabel,
        amount: amount,
        status: data?.status,
        payment_status: data?.payment_status
      },
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      message: `Booking ${refNumber} recorded to SalesActivity and AuditLog` 
    });

  } catch (error) {
    console.error('Error recording booking activity:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
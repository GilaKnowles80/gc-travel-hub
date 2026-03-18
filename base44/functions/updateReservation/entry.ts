import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingType, bookingId, updates } = await req.json();

    if (!bookingType || !bookingId || !updates) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let booking;
    let entity;
    let emailField;

    // Determine entity type
    switch (bookingType) {
      case 'flight':
        entity = base44.entities.FlightBooking;
        emailField = 'passenger_email';
        break;
      case 'hotel':
        entity = base44.entities.HotelBooking;
        emailField = 'guest_email';
        break;
      case 'tour':
        entity = base44.entities.Booking;
        emailField = 'user_email';
        break;
      default:
        return Response.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    // Get booking
    booking = await entity.get(bookingId);
    
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check authorization
    if (user.role !== 'admin' && booking[emailField] !== user.email) {
      return Response.json({ error: 'Unauthorized to modify this booking' }, { status: 403 });
    }

    // Update booking
    const updatedBooking = await entity.update(bookingId, updates);

    // Send notification if email or important details changed
    if (updates.status || updates.payment_status) {
      const subject = updates.status 
        ? `Booking Status Updated: ${updates.status}`
        : `Payment Status Updated: ${updates.payment_status}`;

      await base44.integrations.Core.SendEmail({
        to: booking[emailField],
        subject,
        body: `Your booking has been updated. Please check your bookings page for details.`
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Reservation updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Update reservation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
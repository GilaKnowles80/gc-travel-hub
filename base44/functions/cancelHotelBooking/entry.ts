import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, reason } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking
    const booking = await base44.entities.HotelBooking.get(bookingId);
    
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check ownership (unless admin)
    if (user.role !== 'admin' && booking.guest_email !== user.email) {
      return Response.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 });
    }

    if (booking.status === 'cancelled') {
      return Response.json({ error: 'Booking already cancelled' }, { status: 400 });
    }

    // Update booking status
    await base44.entities.HotelBooking.update(bookingId, {
      status: 'cancelled',
      special_requests: booking.special_requests 
        ? `${booking.special_requests}\n\nCancellation reason: ${reason || 'User requested'}`
        : `Cancellation reason: ${reason || 'User requested'}`
    });

    // Find payment and process refund
    const payments = await base44.entities.Payment.filter({ booking_id: bookingId });
    
    if (payments.length > 0) {
      const payment = payments[0];
      
      if (payment.status === 'completed' && payment.payment_method === 'stripe') {
        // Calculate refund (you can add cancellation fee logic here)
        const refundAmount = payment.amount;
        
        await base44.entities.Payment.update(payment.id, {
          status: 'refunded',
          refund_amount: refundAmount,
          refund_reason: reason || 'Booking cancelled by user'
        });
      }
    }

    // Send cancellation notification
    await base44.integrations.Core.SendEmail({
      to: booking.guest_email,
      subject: 'Hotel Booking Cancelled',
      body: `Your hotel booking at ${booking.hotel_name} has been cancelled. If you paid, a refund will be processed within 5-7 business days.`
    });

    return Response.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking: { ...booking, status: 'cancelled' }
    });

  } catch (error) {
    console.error('Cancel hotel booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
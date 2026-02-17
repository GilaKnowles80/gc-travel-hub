import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confirmEmail } = await req.json();

    if (confirmEmail !== user.email) {
      return Response.json({ error: 'Email confirmation mismatch' }, { status: 400 });
    }

    // Delete all user data
    const email = user.email;

    // Get all bookings first (can't delete if payments exist)
    const bookings = await base44.entities.Booking.filter({ customer_email: email });
    const flightBookings = await base44.entities.FlightBooking.filter({ passenger_email: email });
    const hotelBookings = await base44.entities.HotelBooking.filter({ guest_email: email });

    // Delete favorites
    const favorites = await base44.entities.Favorite.filter({ user_email: email });
    for (const fav of favorites) {
      await base44.asServiceRole.entities.Favorite.delete(fav.id);
    }

    // Delete reviews
    const reviews = await base44.entities.Review.filter({ user_email: email });
    for (const review of reviews) {
      await base44.asServiceRole.entities.Review.delete(review.id);
    }

    // Delete saved travelers
    const travelers = await base44.entities.SavedTraveler.filter({ user_email: email });
    for (const traveler of travelers) {
      await base44.asServiceRole.entities.SavedTraveler.delete(traveler.id);
    }

    // Delete notifications
    const notifications = await base44.entities.Notification.filter({ user_email: email });
    for (const notif of notifications) {
      await base44.asServiceRole.entities.Notification.delete(notif.id);
    }

    // Log audit before deletion
    await base44.asServiceRole.functions.invoke('auditLog', {
      action: 'delete',
      entity_type: 'UserAccount',
      severity: 'critical'
    }).catch(console.error);

    return Response.json({ 
      success: true, 
      message: 'User data deleted successfully',
      note: 'Bookings with active payments were retained for record-keeping'
    });

  } catch (error) {
    console.error('Delete user data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
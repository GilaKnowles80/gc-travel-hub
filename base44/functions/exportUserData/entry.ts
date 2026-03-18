import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather all user data
    const userData = {
      profile: user,
      bookings: await base44.entities.Booking.filter({ customer_email: user.email }),
      flightBookings: await base44.entities.FlightBooking.filter({ passenger_email: user.email }),
      hotelBookings: await base44.entities.HotelBooking.filter({ guest_email: user.email }),
      payments: await base44.entities.Payment.filter({ user_email: user.email }),
      favorites: await base44.entities.Favorite.filter({ user_email: user.email }),
      reviews: await base44.entities.Review.filter({ user_email: user.email }),
      savedTravelers: await base44.entities.SavedTraveler.filter({ user_email: user.email }),
      notifications: await base44.entities.Notification.filter({ user_email: user.email })
    };

    // Log audit
    await base44.functions.invoke('auditLog', {
      action: 'export',
      entity_type: 'UserData',
      severity: 'medium'
    }).catch(console.error);

    return Response.json(userData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${user.email}.json"`
      }
    });

  } catch (error) {
    console.error('Export user data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
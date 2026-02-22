import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data || !event) {
      return Response.json({ error: 'Missing event data' }, { status: 400 });
    }

    const { entity_name, entity_id } = event;
    const booking = data;

    // Build detailed notification content
    let subject = '';
    let details = '';
    let amount = 0;

    switch (entity_name) {
      case 'FlightBooking':
        subject = `New Flight Booking: ${booking.route}`;
        details = `
          <strong>Flight Booking</strong><br>
          Route: ${booking.route}<br>
          Passenger: ${booking.passenger_name}<br>
          Email: ${booking.passenger_email}<br>
          Phone: ${booking.passenger_phone || 'N/A'}<br>
          Cabin Class: ${booking.cabin_class}<br>
          Passengers: ${booking.number_of_passengers}<br>
          Status: ${booking.status}<br>
          Payment Status: ${booking.payment_status}<br>
          Total: $${booking.total_price?.toFixed(2) || '0.00'}
        `;
        amount = booking.total_price || 0;
        break;

      case 'HotelBooking':
        subject = `New Hotel Booking: ${booking.hotel_name}`;
        details = `
          <strong>Hotel Booking</strong><br>
          Hotel: ${booking.hotel_name}<br>
          Guest: ${booking.guest_name}<br>
          Email: ${booking.guest_email}<br>
          Phone: ${booking.guest_phone || 'N/A'}<br>
          Room Type: ${booking.room_type}<br>
          Check-in: ${booking.check_in_date}<br>
          Check-out: ${booking.check_out_date}<br>
          Rooms: ${booking.number_of_rooms}<br>
          Guests: ${booking.number_of_guests}<br>
          Status: ${booking.status}<br>
          Payment Status: ${booking.payment_status}<br>
          Total: $${booking.total_price?.toFixed(2) || '0.00'}
        `;
        amount = booking.total_price || 0;
        break;

      case 'TourBooking':
        subject = `New Tour Booking: ${booking.tour_name || 'Tour'}`;
        details = `
          <strong>Tour Booking</strong><br>
          Tour: ${booking.tour_name || 'N/A'}<br>
          Guest: ${booking.guest_name}<br>
          Email: ${booking.guest_email}<br>
          Phone: ${booking.guest_phone || 'N/A'}<br>
          Participants: ${booking.number_of_participants}<br>
          Tour Date: ${booking.tour_date || 'N/A'}<br>
          Status: ${booking.status}<br>
          Payment Status: ${booking.payment_status}<br>
          Total: $${booking.total_price?.toFixed(2) || '0.00'}
        `;
        amount = booking.total_price || 0;
        break;

      case 'PackageBooking':
        subject = `New Package Booking: ${booking.package_name}`;
        const flightCount = booking.flights?.length || 0;
        const hotelCount = booking.hotels?.length || 0;
        const tourCount = booking.tours?.length || 0;
        details = `
          <strong>Package Booking</strong><br>
          Package: ${booking.package_name}<br>
          Customer: ${booking.user_email}<br>
          Flights: ${flightCount}<br>
          Hotels: ${hotelCount}<br>
          Tours: ${tourCount}<br>
          Status: ${booking.status}<br>
          Total Price: $${booking.total_price?.toFixed(2) || '0.00'}<br>
          Discount: ${booking.discount_percentage || 0}%<br>
          Final Price: $${booking.final_price?.toFixed(2) || '0.00'}
        `;
        amount = booking.final_price || booking.total_price || 0;
        break;

      default:
        return Response.json({ error: 'Unknown booking type' }, { status: 400 });
    }

    // Get all admin users
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    if (admins.length === 0) {
      console.log('No admin users found to notify');
      return Response.json({ success: true, message: 'No admins to notify' });
    }

    // Send email and in-app notification to each admin
    const notifications = [];

    for (const admin of admins) {
      // Send email
      notifications.push(
        base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `💰 ${subject}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">New Sale Alert! 🎉</h2>
              ${details}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Booking ID: ${entity_id}<br>
                Date: ${new Date().toLocaleString()}
              </p>
              <a href="https://app.base44.com" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                View in Dashboard
              </a>
            </div>
          `
        })
      );

      // Create in-app notification
      notifications.push(
        base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          title: subject,
          message: `New booking for $${amount.toFixed(2)}`,
          type: 'sale',
          reference_id: entity_id,
          reference_type: entity_name,
          is_read: false
        })
      );
    }

    await Promise.all(notifications);

    console.log(`Notified ${admins.length} admin(s) about ${entity_name} sale`);

    return Response.json({
      success: true,
      notified: admins.length,
      amount: amount.toFixed(2)
    });

  } catch (error) {
    console.error('Sales notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
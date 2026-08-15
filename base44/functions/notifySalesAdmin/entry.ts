import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { event, data } = await req.json();

    if (!data || !event) {
      return Response.json({ error: 'Missing event data' }, { status: 400 });
    }

    const { entity_name, entity_id } = event;
    const booking = data;
    const esc = escapeHtml;

    // Build detailed notification content
    let subject = '';
    let details = '';
    let amount = 0;

    switch (entity_name) {
      case 'FlightBooking':
        subject = `New Flight Booking: ${esc(booking.route)}`;
        details = `
          <strong>Flight Booking</strong><br>
          Route: ${esc(booking.route)}<br>
          Passenger: ${esc(booking.passenger_name)}<br>
          Email: ${esc(booking.passenger_email)}<br>
          Phone: ${esc(booking.passenger_phone || 'N/A')}<br>
          Cabin Class: ${esc(booking.cabin_class)}<br>
          Passengers: ${esc(booking.number_of_passengers)}<br>
          Status: ${esc(booking.status)}<br>
          Payment Status: ${esc(booking.payment_status)}<br>
          Total: $${esc(booking.total_price?.toFixed(2) || '0.00')}
        `;
        amount = booking.total_price || 0;
        break;

      case 'HotelBooking':
        subject = `New Hotel Booking: ${esc(booking.hotel_name)}`;
        details = `
          <strong>Hotel Booking</strong><br>
          Hotel: ${esc(booking.hotel_name)}<br>
          Guest: ${esc(booking.guest_name)}<br>
          Email: ${esc(booking.guest_email)}<br>
          Phone: ${esc(booking.guest_phone || 'N/A')}<br>
          Room Type: ${esc(booking.room_type)}<br>
          Check-in: ${esc(booking.check_in_date)}<br>
          Check-out: ${esc(booking.check_out_date)}<br>
          Rooms: ${esc(booking.number_of_rooms)}<br>
          Guests: ${esc(booking.number_of_guests)}<br>
          Status: ${esc(booking.status)}<br>
          Payment Status: ${esc(booking.payment_status)}<br>
          Total: $${esc(booking.total_price?.toFixed(2) || '0.00')}
        `;
        amount = booking.total_price || 0;
        break;

      case 'Booking':
        subject = `New Tour Booking: ${esc(booking.tour_title || 'Tour')}`;
        details = `
          <strong>Tour Booking</strong><br>
          Tour: ${esc(booking.tour_title || 'N/A')}<br>
          Customer: ${esc(booking.customer_name)}<br>
          Email: ${esc(booking.customer_email)}<br>
          Phone: ${esc(booking.customer_phone || 'N/A')}<br>
          Travelers: ${esc(booking.number_of_travelers)}<br>
          Departure Date: ${esc(booking.departure_date || 'N/A')}<br>
          Status: ${esc(booking.status)}<br>
          Payment Status: ${esc(booking.payment_status)}<br>
          Total: $${esc(booking.total_price?.toFixed(2) || '0.00')}
        `;
        amount = booking.total_price || 0;
        break;

      case 'PackageBooking':
        subject = `New Package Booking: ${esc(booking.package_name)}`;
        const flightCount = booking.flights?.length || 0;
        const hotelCount = booking.hotels?.length || 0;
        const tourCount = booking.tours?.length || 0;
        details = `
          <strong>Package Booking</strong><br>
          Package: ${esc(booking.package_name)}<br>
          Customer: ${esc(booking.user_email)}<br>
          Flights: ${esc(flightCount)}<br>
          Hotels: ${esc(hotelCount)}<br>
          Tours: ${esc(tourCount)}<br>
          Status: ${esc(booking.status)}<br>
          Total Price: $${esc(booking.total_price?.toFixed(2) || '0.00')}<br>
          Discount: ${esc(booking.discount_percentage || 0)}%<br>
          Final Price: $${esc(booking.final_price?.toFixed(2) || '0.00')}
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
                Booking ID: ${esc(entity_id)}<br>
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
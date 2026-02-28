import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Base64 } from 'npm:js-base64@3.7.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingType, bookingId, customerEmail, customerName } = body;

    if (!bookingType || !bookingId || !customerEmail) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch booking details
    const entityMap = {
      flight: 'FlightBooking',
      hotel: 'HotelBooking',
      tour: 'Booking',
      ferry: 'FerryBooking',
      bus: 'BusBooking'
    };

    const entityName = entityMap[bookingType];
    if (!entityName) {
      return Response.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    const booking = await base44.asServiceRole.entities[entityName].get(bookingId);

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate email content
    const bookingDetails = {
      flight: () => `
        <h3>Flight Booking Details</h3>
        <p><strong>Flight Number:</strong> ${booking.flight_number || 'N/A'}</p>
        <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
        <p><strong>Cabin Class:</strong> ${booking.cabin_class || 'N/A'}</p>
        <p><strong>Passengers:</strong> ${booking.number_of_passengers || 1}</p>
      `,
      hotel: () => `
        <h3>Hotel Booking Details</h3>
        <p><strong>Hotel:</strong> ${booking.hotel_name || 'N/A'}</p>
        <p><strong>Room Type:</strong> ${booking.room_type || 'N/A'}</p>
        <p><strong>Check-in:</strong> ${booking.check_in_date || 'N/A'}</p>
        <p><strong>Check-out:</strong> ${booking.check_out_date || 'N/A'}</p>
        <p><strong>Rooms:</strong> ${booking.number_of_rooms || 1}</p>
      `,
      tour: () => `
        <h3>Tour Booking Details</h3>
        <p><strong>Tour:</strong> ${booking.tour_title || 'N/A'}</p>
        <p><strong>Travelers:</strong> ${booking.number_of_travelers || 1}</p>
        <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
        <p><strong>Trip Type:</strong> ${booking.trip_type || 'roundtrip'}</p>
      `,
      ferry: () => `
        <h3>Ferry Booking Details</h3>
        <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
        <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
        <p><strong>Accommodation:</strong> ${booking.accommodation_type || 'N/A'}</p>
        <p><strong>Passengers:</strong> ${booking.number_of_passengers || 1}</p>
      `,
      bus: () => `
        <h3>Bus Booking Details</h3>
        <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
        <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
        <p><strong>Seat Type:</strong> ${booking.seat_type || 'regular'}</p>
        <p><strong>Passengers:</strong> ${booking.number_of_passengers || 1}</p>
      `
    };

    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a56db;">Booking Confirmation</h1>
            
            <p>Dear ${customerName || 'Valued Customer'},</p>
            
            <p>Thank you for booking with <strong>GC Travel & Tours</strong>! Your booking has been confirmed.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Booking Type:</strong> ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</p>
              <p><strong>Total Amount:</strong> $${booking.total_price || 0}</p>
              <p><strong>Payment Status:</strong> ${booking.payment_status === 'paid' ? '✓ Paid' : 'Pending Payment'}</p>
            </div>
            
            ${bookingDetails[bookingType]?.() || ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong> or call <strong>+63 915 440 1150</strong>
              </p>
              <p style="color: #6b7280; font-size: 12px;">
                Safe travels!<br/>
                <strong>GC Travel & Tours Agency</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Create RFC 2822 email
    const message = [
      `From: GC Travel & Tours <noreply@gctravelandtours.com>`,
      `To: ${customerEmail}`,
      `Subject: Booking Confirmation - Reference ${bookingId}`,
      `MIME-Version: 1.0`,
      `Content-type: text/html; charset=UTF-8`,
      ``,
      htmlBody
    ].join('\r\n');

    const encodedMessage = Base64.btoa(message);

    // Send email via Gmail API
    const sendResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedMessage
        })
      }
    );

    if (!sendResponse.ok) {
      const error = await sendResponse.json();
      throw new Error(`Gmail API error: ${error.error?.message || 'Unknown'}`);
    }

    console.log('Booking confirmation email sent to:', customerEmail);

    return Response.json({
      success: true,
      message: 'Booking confirmation email sent',
      email: customerEmail
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
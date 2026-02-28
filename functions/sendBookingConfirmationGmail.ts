import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingType, bookingId, customerEmail, customerName } = body;

    if (!bookingType || !bookingId || !customerEmail || !customerName) {
      return Response.json(
        { error: 'Missing required fields: bookingType, bookingId, customerEmail, customerName' },
        { status: 400 }
      );
    }

    // Fetch booking details based on type
    let booking, emailContent;
    
    switch (bookingType.toLowerCase()) {
      case 'flight':
        booking = await base44.asServiceRole.entities.FlightBooking.filter({ id: bookingId });
        if (booking.length === 0) throw new Error('Flight booking not found');
        emailContent = generateFlightConfirmation(booking[0], customerName);
        break;
      case 'hotel':
        booking = await base44.asServiceRole.entities.HotelBooking.filter({ id: bookingId });
        if (booking.length === 0) throw new Error('Hotel booking not found');
        emailContent = generateHotelConfirmation(booking[0], customerName);
        break;
      case 'tour':
        booking = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
        if (booking.length === 0) throw new Error('Tour booking not found');
        emailContent = generateTourConfirmation(booking[0], customerName);
        break;
      case 'ferry':
        booking = await base44.asServiceRole.entities.FerryBooking.filter({ id: bookingId });
        if (booking.length === 0) throw new Error('Ferry booking not found');
        emailContent = generateFerryConfirmation(booking[0], customerName);
        break;
      case 'bus':
        booking = await base44.asServiceRole.entities.BusBooking.filter({ id: bookingId });
        if (booking.length === 0) throw new Error('Bus booking not found');
        emailContent = generateBusConfirmation(booking[0], customerName);
        break;
      default:
        return Response.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Create email message
    const message = createEmailMessage(customerEmail, emailContent);

    // Send via Gmail API
    const sendResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: message
      })
    });

    if (!sendResponse.ok) {
      const error = await sendResponse.json();
      console.error('Gmail API error:', error);
      throw new Error(`Failed to send email: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await sendResponse.json();

    return Response.json({
      success: true,
      messageId: result.id,
      recipient: customerEmail
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateFlightConfirmation(booking, customerName) {
  return {
    subject: `Flight Booking Confirmation - ${booking.flight_number || 'Your Booking'}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Flight Booking Confirmed</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for booking with GC Travel & Tours! Your flight booking has been confirmed.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
              <p><strong>Flight Number:</strong> ${booking.flight_number || 'N/A'}</p>
              <p><strong>Cabin Class:</strong> ${booking.cabin_class || 'N/A'}</p>
              <p><strong>Passengers:</strong> ${booking.number_of_passengers || 1}</p>
              <p><strong>Total Price:</strong> $${booking.total_price?.toFixed(2) || '0.00'}</p>
              <p><strong>Status:</strong> ${booking.status?.toUpperCase() || 'PENDING'}</p>
            </div>

            <p><strong>Booking Reference:</strong> ${booking.id}</p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p>If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong></p>
              <p style="color: #6b7280; font-size: 12px;">GC Travel & Tours Agency<br>Imus City, Cavite, Philippines</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

function generateHotelConfirmation(booking, customerName) {
  return {
    subject: `Hotel Booking Confirmation - ${booking.hotel_name || 'Your Booking'}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Hotel Booking Confirmed</h2>
            <p>Dear ${customerName},</p>
            <p>Your hotel reservation has been confirmed. We look forward to hosting you!</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Reservation Details</h3>
              <p><strong>Hotel:</strong> ${booking.hotel_name || 'N/A'}</p>
              <p><strong>Room Type:</strong> ${booking.room_type || 'N/A'}</p>
              <p><strong>Check-in:</strong> ${booking.check_in_date || 'N/A'}</p>
              <p><strong>Check-out:</strong> ${booking.check_out_date || 'N/A'}</p>
              <p><strong>Number of Rooms:</strong> ${booking.number_of_rooms || 1}</p>
              <p><strong>Total Price:</strong> $${booking.total_price?.toFixed(2) || '0.00'}</p>
              <p><strong>Status:</strong> ${booking.status?.toUpperCase() || 'PENDING'}</p>
            </div>

            <p><strong>Booking Reference:</strong> ${booking.id}</p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p>If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong></p>
              <p style="color: #6b7280; font-size: 12px;">GC Travel & Tours Agency<br>Imus City, Cavite, Philippines</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

function generateTourConfirmation(booking, customerName) {
  return {
    subject: `Tour Booking Confirmation - ${booking.tour_title || 'Your Tour'}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Tour Booking Confirmed</h2>
            <p>Dear ${customerName},</p>
            <p>Your tour has been booked! Get ready for an unforgettable experience.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Tour Details</h3>
              <p><strong>Tour:</strong> ${booking.tour_title || 'N/A'}</p>
              <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
              <p><strong>Number of Travelers:</strong> ${booking.number_of_travelers || 1}</p>
              <p><strong>Total Price:</strong> $${booking.total_price?.toFixed(2) || '0.00'}</p>
              <p><strong>Status:</strong> ${booking.status?.toUpperCase() || 'PENDING'}</p>
            </div>

            <p><strong>Booking Reference:</strong> ${booking.id}</p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p>If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong></p>
              <p style="color: #6b7280; font-size: 12px;">GC Travel & Tours Agency<br>Imus City, Cavite, Philippines</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

function generateFerryConfirmation(booking, customerName) {
  return {
    subject: `Ferry Booking Confirmation - ${booking.route || 'Your Booking'}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Ferry Booking Confirmed</h2>
            <p>Dear ${customerName},</p>
            <p>Your ferry booking has been confirmed.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
              <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
              <p><strong>Departure Time:</strong> ${booking.departure_time || 'N/A'}</p>
              <p><strong>Number of Passengers:</strong> ${booking.number_of_passengers || 1}</p>
              <p><strong>Total Price:</strong> $${booking.total_price?.toFixed(2) || '0.00'}</p>
              <p><strong>Status:</strong> ${booking.status?.toUpperCase() || 'PENDING'}</p>
            </div>

            <p><strong>Booking Reference:</strong> ${booking.id}</p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p>If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong></p>
              <p style="color: #6b7280; font-size: 12px;">GC Travel & Tours Agency<br>Imus City, Cavite, Philippines</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

function generateBusConfirmation(booking, customerName) {
  return {
    subject: `Bus Booking Confirmation - ${booking.route || 'Your Booking'}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Bus Booking Confirmed</h2>
            <p>Dear ${customerName},</p>
            <p>Your bus booking has been confirmed.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
              <p><strong>Departure Date:</strong> ${booking.departure_date || 'N/A'}</p>
              <p><strong>Departure Time:</strong> ${booking.departure_time || 'N/A'}</p>
              <p><strong>Seat Type:</strong> ${booking.seat_type || 'N/A'}</p>
              <p><strong>Number of Passengers:</strong> ${booking.number_of_passengers || 1}</p>
              <p><strong>Total Price:</strong> $${booking.total_price?.toFixed(2) || '0.00'}</p>
              <p><strong>Status:</strong> ${booking.status?.toUpperCase() || 'PENDING'}</p>
            </div>

            <p><strong>Booking Reference:</strong> ${booking.id}</p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
              <p>If you have any questions, please contact us at <strong>info@gctravelandtours.com</strong></p>
              <p style="color: #6b7280; font-size: 12px;">GC Travel & Tours Agency<br>Imus City, Cavite, Philippines</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

function createEmailMessage(to, content) {
  const email = `From: GC Travel & Tours <noreply@gctravelandtours.com>\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${content.subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset="UTF-8"\r\n` +
    `\r\n` +
    `${content.html}`;

  return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      pnr,
      customer_email,
      customer_name,
      product_type,
      item_name,
      total_price,
      booking_date,
      status,
      // Optional flight-specific details
      origin,
      destination,
      departure_date,
      return_date,
      airline,
      flight_number,
      cabin_class,
      passengers,
      // Optional hotel details
      hotel_name,
      check_in,
      check_out,
      room_type,
      // Optional tour details
      tour_name,
      tour_duration,
      // Extra
      special_requests,
    } = await req.json();

    const productNames = {
      flight: 'Flight Booking',
      hotel: 'Hotel Reservation',
      tour: 'Tour Package',
      bus: 'Bus Ticket',
      ferry: 'Ferry Booking',
      cruise: 'Cruise Package',
      visa: 'Visa Application',
      car_rental: 'Car Rental',
      train: 'Train Ticket',
    };

    const productIcons = {
      flight: '✈️',
      hotel: '🏨',
      tour: '🗺️',
      bus: '🚌',
      ferry: '⛴️',
      cruise: '🛳️',
      visa: '📋',
      car_rental: '🚗',
      train: '🚂',
    };

    const productName = productNames[product_type] || 'Booking';
    const productIcon = productIcons[product_type] || '📦';
    const statusText = status === 'confirmed' ? 'CONFIRMED' : 'PENDING';
    const bookingDateFormatted = new Date(booking_date || Date.now()).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalFormatted = `₱${Number(total_price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    // Build itinerary rows based on product type
    let itineraryRows = '';

    if (product_type === 'flight') {
      itineraryRows = `
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Route</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${origin || '—'} → ${destination || '—'}</td></tr>
        ${airline ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Airline</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${airline}${flight_number ? ' · ' + flight_number : ''}</td></tr>` : ''}
        ${departure_date ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Departure</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${new Date(departure_date).toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'long',day:'numeric'})}</td></tr>` : ''}
        ${return_date ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Return</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${new Date(return_date).toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'long',day:'numeric'})}</td></tr>` : ''}
        ${cabin_class ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Cabin Class</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${cabin_class.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td></tr>` : ''}
        ${passengers ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Passengers</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${passengers}</td></tr>` : ''}
      `;
    } else if (product_type === 'hotel') {
      itineraryRows = `
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Hotel</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${hotel_name || item_name}</td></tr>
        ${room_type ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Room Type</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${room_type}</td></tr>` : ''}
        ${check_in ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Check-In</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${new Date(check_in).toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'long',day:'numeric'})}</td></tr>` : ''}
        ${check_out ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Check-Out</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${new Date(check_out).toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'long',day:'numeric'})}</td></tr>` : ''}
      `;
    } else if (product_type === 'tour') {
      itineraryRows = `
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Tour Package</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${tour_name || item_name}</td></tr>
        ${tour_duration ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Duration</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${tour_duration}</td></tr>` : ''}
        ${departure_date ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Departure</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${new Date(departure_date).toLocaleDateString('en-PH', {weekday:'short',year:'numeric',month:'long',day:'numeric'})}</td></tr>` : ''}
      `;
    } else {
      itineraryRows = `
        <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Service</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${item_name}</td></tr>
      `;
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${productName} Confirmation — GC Travel & Tours</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:36px;">${productIcon}</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">${productName} ${status === 'confirmed' ? 'Confirmed!' : 'Received'}</h1>
              <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Booking reference confirmation for ${customer_name}</p>
            </td>
          </tr>

          <!-- STATUS BADGE -->
          <tr>
            <td style="background:#fff;padding:24px 40px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <span style="display:inline-block;padding:8px 24px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:1px;background:${status === 'confirmed' ? '#d1fae5' : '#fef3c7'};color:${status === 'confirmed' ? '#065f46' : '#92400e'};">
                ● ${statusText}
              </span>
            </td>
          </tr>

          <!-- PNR BOX -->
          <tr>
            <td style="background:#fff;padding:0 40px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="background:#fffbeb;border:2px dashed #f59e0b;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#92400e;text-transform:uppercase;">Your Booking Reference</p>
                <p style="margin:0;font-family:monospace;font-size:28px;font-weight:800;color:#d97706;letter-spacing:4px;">${pnr}</p>
                <p style="margin:6px 0 0;font-size:12px;color:#b45309;">Please save this reference number for check-in and inquiries.</p>
              </div>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="background:#fff;padding:0 40px 20px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
                Dear <strong>${customer_name}</strong>,<br/>
                Thank you for booking with <strong>GC Travel & Tours</strong>! Your ${productName.toLowerCase()} has been
                ${status === 'confirmed' ? '<span style="color:#059669;font-weight:700;">confirmed</span>' : '<span style="color:#d97706;font-weight:700;">received and is pending confirmation</span>'}.
                Below is your complete itinerary and booking summary.
              </p>
            </td>
          </tr>

          <!-- ITINERARY TABLE -->
          <tr>
            <td style="background:#fff;padding:0 40px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111827;border-bottom:2px solid #f59e0b;padding-bottom:8px;">📋 Itinerary Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;width:40%;">Passenger / Guest</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${customer_name}</td></tr>
                <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Email</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${customer_email}</td></tr>
                ${itineraryRows}
                <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Booking Date</td><td style="padding:10px 16px;font-weight:600;font-size:13px;">${bookingDateFormatted}</td></tr>
                ${special_requests ? `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Special Requests</td><td style="padding:10px 16px;font-size:13px;font-style:italic;color:#374151;">${special_requests}</td></tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- PAYMENT SUMMARY -->
          <tr>
            <td style="background:#fff;padding:0 40px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111827;border-bottom:2px solid #f59e0b;padding-bottom:8px;">💳 Payment Summary</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Airline Base Fare</td><td style="padding:10px 16px;font-size:13px;text-align:right;">${Math.round(Number(total_price || 0) * 0.75).toLocaleString('en-PH', {style:'currency',currency:'PHP'})}</td></tr>
                <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;">Service, Taxes & Fees</td><td style="padding:10px 16px;font-size:13px;text-align:right;">${Math.round(Number(total_price || 0) * 0.25).toLocaleString('en-PH', {style:'currency',currency:'PHP'})}</td></tr>
                <tr style="background:#fffbeb;"><td style="padding:14px 16px;font-weight:700;font-size:15px;color:#111827;">Total Amount Paid</td><td style="padding:14px 16px;font-weight:800;font-size:15px;color:#d97706;text-align:right;">${totalFormatted}</td></tr>
              </table>
            </td>
          </tr>

          <!-- NEXT STEPS -->
          <tr>
            <td style="background:#fff;padding:0 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h2 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111827;border-bottom:2px solid #f59e0b;padding-bottom:8px;">🚀 What's Next?</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#374151;line-height:1.6;">
                    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;">
                      ✅ &nbsp; Keep your reference number <strong>${pnr}</strong> handy for check-in and support.
                    </div>
                    <div style="margin-bottom:10px;">
                      📧 &nbsp; You will receive updates to this email. Please check your spam folder if you don't see them.
                    </div>
                    <div style="margin-bottom:10px;">
                      🖥️ &nbsp; Manage your booking anytime at <a href="https://gctravelandtours.com/MyBookings" style="color:#d97706;text-decoration:none;font-weight:600;">My Bookings</a>.
                    </div>
                    <div>
                      📞 &nbsp; Our team is available 24/7 — reach us at <strong>+63 915 440 1150</strong> or <a href="mailto:info@gctravelandtours.com" style="color:#d97706;text-decoration:none;">info@gctravelandtours.com</a>.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTACT BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Questions? We're here to help.</p>
              <p style="margin:0;font-size:13px;color:#cbd5e1;">
                📧 info@gctravelandtours.com &nbsp;|&nbsp; 📱 +63 915 440 1150
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#475569;">© ${new Date().getFullYear()} GC Travel and Tours Agency. All rights reserved.</p>
              <p style="margin:0;font-size:10px;color:#334155;line-height:1.8;">
                Powered by AI · Base44 · Duffel · Sabre · Amadeus · Biyaheko · Tripzynx · Wanderlinx · Stripe
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#334155;">This is an automated booking confirmation. Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    // Send email
    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `${productIcon} ${productName} ${statusText} — Ref: ${pnr} | GC Travel & Tours`,
      body: emailHtml,
    });

    return Response.json({ 
      success: true, 
      message: 'Booking confirmation itinerary sent',
      pnr 
    });
  } catch (error) {
    console.error('Booking Confirmation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
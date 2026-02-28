import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    const productName = productNames[product_type] || 'Booking';
    const statusText = status === 'confirmed' ? 'CONFIRMED' : 'PENDING';
    const statusColor = status === 'confirmed' ? 'green' : 'orange';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { text-align: right; }
        .status-badge { padding: 8px 16px; border-radius: 4px; font-weight: bold; display: inline-block; margin: 10px 0; }
        .status-confirmed { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        .pnr { font-family: monospace; font-size: 18px; font-weight: bold; color: #d97706; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ ${productName} ${statusText}</h1>
        </div>
        <div class="content">
            <p>Dear ${customer_name},</p>
            
            <p>Thank you for choosing GC Travel and Tours! Your ${productName.toLowerCase()} has been ${status === 'confirmed' ? 'confirmed' : 'received and is pending confirmation'}.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">YOUR REFERENCE NUMBER</p>
                <p class="pnr">${pnr}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Save this for your records</p>
            </div>
            
            <h3>Booking Details</h3>
            <div class="detail-row">
                <span class="detail-label">Product</span>
                <span class="detail-value">${item_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value">₱${total_price.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Booking Date</span>
                <span class="detail-value">${new Date(booking_date).toLocaleDateString('en-PH')}</span>
            </div>
            
            <div class="status-badge status-${status}">
                Status: ${statusText}
            </div>
            
            <h3>What's Next?</h3>
            <ul>
                <li>Check your email for further details and itinerary</li>
                <li>You can manage your booking anytime in your account</li>
                <li>Our team will contact you if we need any additional information</li>
            </ul>
            
            <p style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                If you have any questions, contact us at:<br>
                📧 info@gctravelandtours.com<br>
                📱 +63 915 440 1150<br>
                🌐 www.gctravelandtours.com
            </p>
        </div>
        <div class="footer">
            <p>GC Travel and Tours Agency | © ${new Date().getFullYear()}</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email
    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `${productName} ${statusText} - PNR: ${pnr}`,
      body: emailHtml,
    });

    // TODO: Add SMS integration when available
    // await base44.integrations.SMS.SendSMS({
    //   to: customer_phone,
    //   message: `Your ${productName} is ${status}. PNR: ${pnr}. Check email for details.`,
    // });

    return Response.json({ 
      success: true, 
      message: 'Confirmation email sent',
      pnr 
    });
  } catch (error) {
    console.error('Booking Confirmation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
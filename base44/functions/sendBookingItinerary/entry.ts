import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, email, passengerName, flightDetails } = await req.json();

    if (!email || !bookingId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Format the itinerary HTML
    const itineraryHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(to right, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">GC Travel & Tours</h1>
          <p style="margin: 5px 0 0 0;">Your Flight Booking Confirmation</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Booking Confirmation</h2>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 10px 0;"><strong>Dear ${passengerName},</strong></p>
            <p style="margin: 0; color: #666;">Your flight booking has been confirmed. Below are your booking details:</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Flight Details</h3>
            <table style="width: 100%; font-size: 14px; line-height: 1.8;">
              <tr>
                <td style="width: 40%; color: #666;">Flight Number:</td>
                <td style="font-weight: bold;">${flightDetails.flightNumber}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="color: #666;">Route:</td>
                <td style="font-weight: bold;">${flightDetails.route}</td>
              </tr>
              <tr>
                <td style="color: #666;">Departure:</td>
                <td style="font-weight: bold;">${new Date(flightDetails.departureTime).toLocaleString()}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="color: #666;">Cabin Class:</td>
                <td style="font-weight: bold;">${flightDetails.cabinClass}</td>
              </tr>
              <tr>
                <td style="color: #666;">Booking Reference:</td>
                <td style="font-weight: bold; color: #f59e0b;">${bookingId}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #7c2d12;">
              <strong>Important:</strong> Please arrive at the airport 3 hours before departure for international flights. Keep this confirmation handy.
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">Questions? Contact us at info@gctraveltours.com or +63 915 440 1150</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} GC Travel & Tours. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Send email via Core integration
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Flight Booking Confirmation - ${flightDetails.flightNumber}`,
      body: itineraryHtml,
      from_name: 'GC Travel & Tours'
    });

    return Response.json({ 
      success: true,
      message: 'Itinerary sent successfully'
    });
  } catch (error) {
    console.error('Error sending itinerary:', error);
    return Response.json({ 
      error: error.message || 'Failed to send itinerary' 
    }, { status: 500 });
  }
});
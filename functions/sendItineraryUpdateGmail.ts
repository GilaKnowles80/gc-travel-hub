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
    const { itineraryId, customerEmail, customerName, itineraryTitle, destination, startDate, endDate, itemCount } = body;

    if (!itineraryId || !customerEmail) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a56db;">Your Travel Itinerary is Ready</h1>
            
            <p>Dear ${customerName || 'Valued Customer'},</p>
            
            <p>Your detailed travel itinerary for your upcoming trip is ready! We've organized all the details of your bookings in one convenient place.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #b45309; margin-top: 0;">${itineraryTitle || 'Your Travel Plans'}</h3>
              ${destination ? `<p><strong>Destination:</strong> ${destination}</p>` : ''}
              ${startDate ? `<p><strong>Travel Dates:</strong> ${startDate}${endDate ? ` to ${endDate}` : ''}</p>` : ''}
              ${itemCount ? `<p><strong>Bookings Included:</strong> ${itemCount} items</p>` : ''}
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-top: 0;">What's Included</h3>
              <ul style="color: #166534;">
                <li>Flight bookings with schedules and confirmation numbers</li>
                <li>Hotel accommodations with check-in details</li>
                <li>Tour and activity bookings</li>
                <li>Transportation arrangements</li>
                <li>Essential travel information</li>
              </ul>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Tips for Your Trip</h3>
              <ul style="color: #1e40af;">
                <li>Keep confirmation numbers handy during check-in</li>
                <li>Download the itinerary for offline access</li>
                <li>Arrive at airports 3 hours before international flights</li>
                <li>Check visa requirements for your destination</li>
                <li>Travel insurance is recommended</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <h3 style="margin-top: 0;">Need Changes?</h3>
              <p>If you need to modify any of your bookings or have special requests, contact us immediately:</p>
              <p style="color: #1a56db; font-weight: bold;">
                📧 info@gctravelandtours.com<br/>
                📞 +63 915 440 1150<br/>
                🕐 Available 24/7
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                <strong>GC Travel & Tours Agency</strong><br/>
                Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite<br/>
                Safe travels and have an amazing adventure!
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
      `Subject: Your Travel Itinerary - ${itineraryTitle || destination || 'Ready for Download'}`,
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

    console.log('Itinerary update email sent to:', customerEmail);

    return Response.json({
      success: true,
      message: 'Itinerary update email sent',
      email: customerEmail
    });
  } catch (error) {
    console.error('Error sending itinerary update:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
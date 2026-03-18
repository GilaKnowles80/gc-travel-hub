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
    const { bookingType, bookingId, customerEmail, customerName, transactionId, amount } = body;

    if (!bookingType || !bookingId || !customerEmail || !amount) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a56db;">Payment Receipt</h1>
            
            <p>Dear ${customerName || 'Valued Customer'},</p>
            
            <p>Thank you for your payment! Here is your receipt for the booking with <strong>GC Travel & Tours</strong>.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #16a34a; margin-top: 0;">✓ Payment Confirmed</h3>
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
              <p><strong>Booking Type:</strong> ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Payment Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong>$${amount.toFixed(2)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 18px; font-weight: bold;">Total Paid</td>
                  <td style="padding: 10px 0; font-size: 18px; font-weight: bold; text-align: right; color: #22c55e;">
                    $${amount.toFixed(2)}
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
              <ul style="color: #1e40af;">
                <li>You will receive detailed booking information shortly</li>
                <li>Keep your booking reference for check-in</li>
                <li>Contact us if you need to make changes to your booking</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                Questions? Contact us at <strong>info@gctravelandtours.com</strong> or call <strong>+63 915 440 1150</strong>
              </p>
              <p style="color: #6b7280; font-size: 12px;">
                <strong>GC Travel & Tours Agency</strong><br/>
                Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite
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
      `Subject: Payment Receipt - Booking ${bookingId}`,
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

    console.log('Payment receipt email sent to:', customerEmail);

    return Response.json({
      success: true,
      message: 'Payment receipt email sent',
      email: customerEmail
    });
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
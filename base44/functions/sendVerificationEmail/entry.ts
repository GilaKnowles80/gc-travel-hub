import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, type, bookingId, verificationCode } = await req.json();

    if (!email || !type || !verificationCode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = type === 'booking' 
      ? 'Verify Your Booking - GC Travel & Tours'
      : 'Verify Your Email - GC Travel & Tours';

    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Email Verification Required</h2>
        <p>Thank you for choosing GC Travel & Tours Agency!</p>
        <p>Your verification code is:</p>
        <div style="background: #fff7ed; border: 2px solid #f97316; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #f97316; margin: 0; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          GC Travel & Tours Agency<br>
          Imus City, Cavite, Philippines<br>
          +63 915 440 1150
        </p>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'GC Travel & Tours - Security',
      to: email,
      subject,
      body
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send verification email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
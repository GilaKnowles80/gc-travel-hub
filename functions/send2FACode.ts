import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expires in 10 minutes
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Store code
    await base44.asServiceRole.entities.TwoFactorCode.create({
      user_email: email,
      code,
      expires_at,
      ip_address
    });

    // Send email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Your 2FA Verification Code - GC Travel & Tours',
      body: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });

    return Response.json({ success: true, message: 'Code sent to email' });

  } catch (error) {
    console.error('2FA send error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
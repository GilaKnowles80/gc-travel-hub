import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Email and code required' }, { status: 400 });
    }

    // Find code
    const codes = await base44.asServiceRole.entities.TwoFactorCode.filter({
      user_email: email,
      code: code,
      verified: false
    }, '-created_date', 1);

    if (codes.length === 0) {
      return Response.json({ valid: false, error: 'Invalid or expired code' });
    }

    const record = codes[0];

    // Check expiration
    if (new Date(record.expires_at) < new Date()) {
      return Response.json({ valid: false, error: 'Code expired' });
    }

    // Mark as verified
    await base44.asServiceRole.entities.TwoFactorCode.update(record.id, { verified: true });

    // Log audit
    await base44.asServiceRole.functions.invoke('auditLog', {
      action: 'login',
      entity_type: 'User',
      severity: 'medium'
    }).catch(console.error);

    return Response.json({ valid: true, message: 'Code verified' });

  } catch (error) {
    console.error('2FA verify error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, entity_type, entity_id, changes, severity = 'low' } = await req.json();

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get IP and User Agent from request
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user?.email || 'system',
      action,
      entity_type,
      entity_id,
      changes,
      ip_address,
      user_agent,
      severity,
      status: 'success'
    });

    // Send critical alerts
    if (severity === 'critical') {
      await base44.integrations.Core.SendEmail({
        to: 'admin@gctravelandtours.com',
        subject: '🚨 Critical Security Alert',
        body: `Critical action detected:\nUser: ${user?.email}\nAction: ${action}\nEntity: ${entity_type}\nIP: ${ip_address}`
      }).catch(console.error);
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Audit log error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
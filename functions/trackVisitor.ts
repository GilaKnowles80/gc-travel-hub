import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { page = '/', referrer = '', user_email = null } = body;

    const cookies = req.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/visitor_session=([^;]+)/);
    let sessionId = sessionMatch ? sessionMatch[1] : crypto.randomUUID();

    const now = new Date().toISOString();
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Parse device type from user agent
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(user_agent);
    const device_type = isMobile ? 'mobile' : 'desktop';

    try {
      const existingSessions = await base44.asServiceRole.entities.UserSession.filter({ session_id: sessionId });

      if (existingSessions.length > 0) {
        await base44.asServiceRole.entities.UserSession.update(existingSessions[0].id, {
          last_active: now,
          current_page: page,
          user_email: user_email || existingSessions[0].user_email || null,
        });
      } else {
        await base44.asServiceRole.entities.UserSession.create({
          session_id: sessionId,
          last_active: now,
          current_page: page,
          user_email: user_email || null,
          ip_address,
          device_type,
          referrer,
        });

        // Auto-audit new visitor session as a low-severity log
        await base44.asServiceRole.entities.AuditLog.create({
          user_email: user_email || 'anonymous',
          action: 'create',
          entity_type: 'PageVisit',
          entity_id: page,
          changes: { page, device_type, referrer: referrer || null },
          ip_address,
          user_agent: user_agent.slice(0, 200),
          severity: 'low',
          status: 'success',
        }).catch(() => {}); // non-blocking
      }
    } catch (dbError) {
      console.error('DB error:', dbError.message);
    }

    return Response.json(
      { success: true, sessionId },
      {
        status: 200,
        headers: {
          'Set-Cookie': `visitor_session=${sessionId}; Path=/; Max-Age=86400; SameSite=Lax`
        }
      }
    );
  } catch (error) {
    console.error('trackVisitor error:', error.message);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});
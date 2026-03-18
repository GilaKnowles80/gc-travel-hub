import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ valid: false, error: 'Not authenticated' });
    }

    // Check for active session
    const sessions = await base44.entities.UserSession.filter({
      user_email: user.email,
      is_active: true
    }, '-last_activity', 1);

    if (sessions.length === 0) {
      return Response.json({ valid: false, error: 'No active session' });
    }

    const session = sessions[0];

    // Check if expired (30 min inactivity)
    const lastActivity = new Date(session.last_activity);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    if (lastActivity < thirtyMinutesAgo) {
      await base44.entities.UserSession.update(session.id, { is_active: false });
      return Response.json({ valid: false, error: 'Session expired due to inactivity' });
    }

    // Update last activity
    await base44.entities.UserSession.update(session.id, {
      last_activity: new Date().toISOString()
    });

    return Response.json({ valid: true, session });

  } catch (error) {
    console.error('Session check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
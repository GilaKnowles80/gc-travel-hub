import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Consider visitors active if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Get all active sessions
    const allSessions = await base44.asServiceRole.entities.UserSession.list('-last_active', 1000);
    
    // Filter sessions active in the last 5 minutes
    const activeSessions = allSessions.filter(session => 
      session.last_active && session.last_active >= fiveMinutesAgo
    );
    
    return Response.json({ 
      count: activeSessions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting live visitors:', error);
    return Response.json({ error: error.message, count: 0 }, { status: 500 });
  }
});
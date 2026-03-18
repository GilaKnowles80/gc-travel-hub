import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Consider visitors active if they were active in the last 5 minutes (300 seconds)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    try {
      // Get all active sessions with a time filter
      const allSessions = await base44.asServiceRole.entities.UserSession.list('-last_active', 1000);
      
      if (!Array.isArray(allSessions)) {
        return Response.json({ count: 0, timestamp: new Date().toISOString() });
      }
      
      // Filter sessions active in the last 5 minutes
      const activeSessions = allSessions.filter(session => {
        if (!session.last_active) return false;
        const sessionTime = new Date(session.last_active).getTime();
        const cutoffTime = new Date(fiveMinutesAgo).getTime();
        return sessionTime >= cutoffTime;
      });
      
      return Response.json({ 
        count: Math.max(0, activeSessions.length),
        timestamp: new Date().toISOString(),
        debug: { fiveMinutesAgo, totalSessions: allSessions.length }
      });
    } catch (dbError) {
      console.error('Database error fetching sessions:', dbError);
      return Response.json({ count: 0, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Error getting live visitors:', error);
    return Response.json({ error: error.message, count: 0, timestamp: new Date().toISOString() }, { status: 500 });
  }
});
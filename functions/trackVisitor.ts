import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { page } = body;
    
    // Get or create session ID from cookie or generate new one
    const cookies = req.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/visitor_session=([^;]+)/);
    let sessionId = sessionMatch ? sessionMatch[1] : crypto.randomUUID();
    
    const now = new Date().toISOString();
    
    try {
      // Try to find existing session
      const existingSessions = await base44.asServiceRole.entities.UserSession.filter({ 
        session_id: sessionId 
      });
      
      if (existingSessions.length > 0) {
        // Update existing session
        await base44.asServiceRole.entities.UserSession.update(existingSessions[0].id, {
          last_active: now,
          current_page: page || '/'
        });
      } else {
        // Create new session
        await base44.asServiceRole.entities.UserSession.create({
          session_id: sessionId,
          last_active: now,
          current_page: page || '/',
          user_email: null
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails
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
    console.error('Error tracking visitor:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});
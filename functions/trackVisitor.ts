import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { page } = await req.json();
    
    // Get or create session ID from cookie or generate new one
    const cookies = req.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/visitor_session=([^;]+)/);
    let sessionId = sessionMatch ? sessionMatch[1] : crypto.randomUUID();
    
    // Update or create user session with current timestamp
    const existingSessions = await base44.asServiceRole.entities.UserSession.filter({ 
      session_id: sessionId 
    });
    
    const now = new Date().toISOString();
    
    if (existingSessions.length > 0) {
      // Update existing session
      await base44.asServiceRole.entities.UserSession.update(existingSessions[0].id, {
        last_active: now,
        current_page: page
      });
    } else {
      // Create new session
      await base44.asServiceRole.entities.UserSession.create({
        session_id: sessionId,
        last_active: now,
        current_page: page,
        user_email: null
      });
    }
    
    return new Response(
      JSON.stringify({ success: true, sessionId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `visitor_session=${sessionId}; Path=/; Max-Age=86400; SameSite=Lax`
        }
      }
    );
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
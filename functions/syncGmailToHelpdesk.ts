import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can sync emails
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Fetch unread emails from Gmail
    const searchResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Gmail API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const messageIds = searchData.messages?.map(m => m.id) || [];

    if (messageIds.length === 0) {
      return Response.json({ synced: 0, message: 'No new emails' });
    }

    // Fetch full message details for each email
    const emails = await Promise.all(
      messageIds.slice(0, 50).map(async (messageId) => {
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const msgData = await msgResponse.json();
        
        // Extract headers
        const headers = msgData.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
        
        return {
          id: messageId,
          from: getHeader('From'),
          subject: getHeader('Subject'),
          date: getHeader('Date'),
          body: msgData.payload?.parts?.[0]?.body?.data 
            ? Buffer.from(msgData.payload.parts[0].body.data, 'base64').toString('utf-8')
            : msgData.payload?.body?.data
            ? Buffer.from(msgData.payload.body.data, 'base64').toString('utf-8')
            : ''
        };
      })
    );

    // Create helpdesk tickets from emails
    let synced = 0;
    for (const email of emails) {
      // Parse sender email and name
      const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
      const senderName = fromMatch?.[1]?.trim() || fromMatch?.[3]?.trim() || 'Unknown';
      const senderEmail = fromMatch?.[2] || email.from;

      // Check if ticket already exists
      const existing = await base44.asServiceRole.entities.HelpdeskTicket.filter(
        { email: senderEmail, subject: email.subject.substring(0, 100) }
      );

      if (existing.length === 0) {
        // Create new ticket
        await base44.asServiceRole.entities.HelpdeskTicket.create({
          name: senderName,
          email: senderEmail,
          subject: email.subject,
          message: email.body || '(No message body)',
          category: 'general',
          status: 'open',
          priority: 'medium',
          source: 'email'
        });
        synced++;
      }
    }

    return Response.json({ synced, total: messageIds.length });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
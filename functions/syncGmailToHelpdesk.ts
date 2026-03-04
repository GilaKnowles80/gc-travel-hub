import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Syncs unread emails from all 3 GC Travel inboxes to HelpdeskTickets
// info@ → general | sales@ → sales inquiries | helpdesk@ → support

const INBOX_CATEGORY_MAP = {
  'info':     'general',
  'sales':    'flights',
  'helpdesk': 'complaint',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Fetch unread emails from any of the 3 inboxes
    const query = 'is:unread (to:info@gctravelandtours.com OR to:sales@gctravelandtours.com OR to:helpdesk@gctravelandtours.com)';
    const searchResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) throw new Error(`Gmail API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    const messageIds = searchData.messages?.map(m => m.id) || [];

    if (messageIds.length === 0) return Response.json({ synced: 0, message: 'No new emails' });

    const emails = await Promise.all(
      messageIds.map(async (messageId) => {
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const msg = await msgResponse.json();
        const headers = msg.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        // Decode body
        let body = '';
        const parts = msg.payload?.parts || [];
        const textPart = parts.find(p => p.mimeType === 'text/plain') || msg.payload;
        if (textPart?.body?.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        // Determine which inbox it was sent to
        const toHeader = getHeader('To').toLowerCase();
        let inboxPrefix = 'info';
        if (toHeader.includes('sales@')) inboxPrefix = 'sales';
        else if (toHeader.includes('helpdesk@')) inboxPrefix = 'helpdesk';

        return {
          id: messageId,
          from: getHeader('From'),
          subject: getHeader('Subject') || '(No Subject)',
          date: getHeader('Date'),
          body: body || '(No message body)',
          inbox: inboxPrefix,
        };
      })
    );

    let synced = 0;
    for (const email of emails) {
      const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/) || [null, email.from, email.from];
      const senderName = fromMatch[1]?.trim() || 'Unknown';
      const senderEmail = fromMatch[2]?.trim() || email.from;

      // Deduplicate — skip if ticket already exists for this email+subject
      const existing = await base44.asServiceRole.entities.HelpdeskTicket.filter({
        email: senderEmail,
        subject: email.subject.substring(0, 100),
      });

      if (existing.length === 0) {
        const category = INBOX_CATEGORY_MAP[email.inbox] || 'general';
        await base44.asServiceRole.entities.HelpdeskTicket.create({
          name: senderName,
          email: senderEmail,
          subject: email.subject,
          message: email.body,
          category,
          status: 'open',
          priority: 'medium',
          source: 'email',
          received_inbox: `${email.inbox}@gctravelandtours.com`,
        });
        synced++;
      }
    }

    console.log(`[GMAIL SYNC] Synced ${synced} new emails from GC Travel inboxes`);
    return Response.json({ synced, total: messageIds.length });

  } catch (error) {
    console.error('[GMAIL SYNC ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
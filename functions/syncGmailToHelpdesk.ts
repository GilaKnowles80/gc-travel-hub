import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const INBOX_CATEGORY_MAP = {
  'info':     'general',
  'sales':    'flights',
  'helpdesk': 'complaint',
  'support':  'general',
  'bookings': 'booking',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Fetch only 15 unread emails per run to avoid timeout
    const query = 'is:unread (to:info@gctravelandtours.com OR to:sales@gctravelandtours.com OR to:helpdesk@gctravelandtours.com OR to:support@gctravelandtours.com OR to:bookings@gctravelandtours.com)';
    const searchResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=15`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) throw new Error(`Gmail search error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    const messageIds = searchData.messages?.map(m => m.id) || [];

    if (messageIds.length === 0) {
      console.log('[GMAIL SYNC] No new emails');
      return Response.json({ synced: 0, message: 'No new emails' });
    }

    // Fetch email details sequentially to avoid overwhelming the API
    const emails = [];
    for (const messageId of messageIds) {
      const msgResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!msgResponse.ok) continue;

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

      const toHeader = getHeader('To').toLowerCase();
      let inboxPrefix = 'info';
      if (toHeader.includes('sales@')) inboxPrefix = 'sales';
      else if (toHeader.includes('helpdesk@')) inboxPrefix = 'helpdesk';
      else if (toHeader.includes('support@')) inboxPrefix = 'support';
      else if (toHeader.includes('bookings@')) inboxPrefix = 'bookings';

      emails.push({
        id: messageId,
        from: getHeader('From'),
        subject: getHeader('Subject') || '(No Subject)',
        body: body || '(No message body)',
        inbox: inboxPrefix,
      });
    }

    // Pre-fetch existing tickets in one query to avoid N+1 DB calls
    const existingTickets = await base44.asServiceRole.entities.HelpdeskTicket.list('-created_date', 200);
    const existingKeys = new Set(
      existingTickets.map(t => `${t.email}||${(t.subject || '').substring(0, 100)}`)
    );

    let synced = 0;
    for (const email of emails) {
      const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/) || [null, email.from, email.from];
      const senderName = fromMatch[1]?.trim() || 'Unknown';
      const senderEmail = fromMatch[2]?.trim() || email.from;
      const dedupeKey = `${senderEmail}||${email.subject.substring(0, 100)}`;

      if (!existingKeys.has(dedupeKey)) {
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
        existingKeys.add(dedupeKey); // prevent duplicates within same batch
        synced++;
      }
    }

    console.log(`[GMAIL SYNC] Synced ${synced} new emails (checked ${emails.length})`);
    return Response.json({ synced, total: emails.length });

  } catch (error) {
    console.error('[GMAIL SYNC ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
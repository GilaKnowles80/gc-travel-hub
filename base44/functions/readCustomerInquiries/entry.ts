import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { maxResults = 20, unreadOnly = true } = body;

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Build query
    let query = 'from:*@*';
    if (unreadOnly) {
      query += ' is:unread';
    }

    // List messages
    const messagesResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!messagesResponse.ok) {
      throw new Error(`Failed to fetch messages: ${messagesResponse.statusText}`);
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    // Fetch full details for each message
    const inquiries = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detailResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );

          if (!detailResponse.ok) {
            return null;
          }

          const msgDetail = await detailResponse.json();
          const headers = msgDetail.payload.headers;

          const getHeader = (name) => {
            const header = headers.find(h => h.name === name);
            return header ? header.value : '';
          };

          // Extract email body
          let body = '';
          if (msgDetail.payload.parts) {
            const textPart = msgDetail.payload.parts.find(p => p.mimeType === 'text/plain');
            if (textPart && textPart.body.data) {
              body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
          } else if (msgDetail.payload.body.data) {
            body = atob(msgDetail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }

          return {
            id: msg.id,
            from: getHeader('From'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            snippet: msgDetail.snippet,
            body: body.substring(0, 500), // Limit to first 500 chars
            isUnread: msgDetail.labelIds?.includes('UNREAD') || false
          };
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          return null;
        }
      })
    );

    return Response.json({
      success: true,
      count: inquiries.filter(i => i !== null).length,
      inquiries: inquiries.filter(i => i !== null)
    });
  } catch (error) {
    console.error('Error reading inquiries:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
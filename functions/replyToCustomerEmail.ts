import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Admin replies to customer emails directly from the internal inbox
// This function sends the reply from the appropriate GC Travel mailbox

const INBOX_BY_CATEGORY = {
  general:          'info@gctravelandtours.com',
  tour:             'info@gctravelandtours.com',
  hotel:            'info@gctravelandtours.com',
  travel_insurance: 'info@gctravelandtours.com',
  flights:          'sales@gctravelandtours.com',
  bus:              'sales@gctravelandtours.com',
  ferry:            'sales@gctravelandtours.com',
  car_rental:       'sales@gctravelandtours.com',
  cruise:           'sales@gctravelandtours.com',
  train:            'sales@gctravelandtours.com',
  visa:             'helpdesk@gctravelandtours.com',
  refund:           'helpdesk@gctravelandtours.com',
  dispute:          'helpdesk@gctravelandtours.com',
  complaint:        'helpdesk@gctravelandtours.com',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { ticket_id, reply_message, admin_name } = await req.json();

    if (!ticket_id || !reply_message) {
      return Response.json({ error: 'Missing ticket_id or reply_message' }, { status: 400 });
    }

    const ticket = await base44.asServiceRole.entities.HelpdeskTicket.read(ticket_id);
    if (!ticket) return Response.json({ error: 'Ticket not found' }, { status: 404 });

    const fromInbox = INBOX_BY_CATEGORY[ticket.category] || 'info@gctravelandtours.com';
    const responderName = admin_name || user.full_name || 'GC Travel Support Team';

    const replyBody = `
Dear ${ticket.name},

${reply_message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ticket Reference : ${ticket.id}
Subject          : ${ticket.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For further assistance, please reply to this email or contact us at:
📞 +63 915 440 1150
📧 ${fromInbox}

Best regards,
${responderName}
GC Travel and Tours Agency
Imus City, Cavite, Philippines
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: ticket.email,
      subject: `Re: [Ticket #${ticket.id}] ${ticket.subject}`,
      body: replyBody,
      from_name: `GC Travel & Tours — ${fromInbox.split('@')[0].charAt(0).toUpperCase() + fromInbox.split('@')[0].slice(1)}`,
    });

    // Log the reply in the ticket
    await base44.asServiceRole.entities.HelpdeskTicket.update(ticket_id, {
      status: 'in_progress',
      last_reply: reply_message,
      last_replied_by: user.email,
      last_replied_at: new Date().toISOString(),
    });

    console.log(`[REPLY SENT] Ticket ${ticket.id} → Customer: ${ticket.email} | From: ${fromInbox}`);
    return Response.json({ success: true, sent_from: fromInbox, sent_to: ticket.email });

  } catch (error) {
    console.error('[REPLY EMAIL ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
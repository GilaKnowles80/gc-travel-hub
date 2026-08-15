import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─── GC Travel Internal Email Routing ────────────────────────────────────────
// info@gctravelandtours.com     → General, Tours, Hotels, Insurance
// sales@gctravelandtours.com    → Flights, Bus, Ferry, Car, Cruise, Train
// helpdesk@gctravelandtours.com → Visa, Refund, Dispute, Complaint, Support
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ROUTING = {
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
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticket_id } = await req.json();

    if (!ticket_id) return Response.json({ error: 'Missing ticket_id' }, { status: 400 });

    const ticket = await base44.asServiceRole.entities.HelpdeskTicket.read(ticket_id);
    if (!ticket) return Response.json({ error: 'Ticket not found' }, { status: 404 });

    // Only the ticket owner or an admin may trigger its email routing.
    if (ticket.email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: you do not own this ticket' }, { status: 403 });
    }

    const internalEmail = CATEGORY_ROUTING[ticket.category] || 'info@gctravelandtours.com';
    const ticketRef = `[Ticket #${ticket.id}]`;

    // Internal notification email
    const internalBody = `
New Customer Inquiry — GC Travel & Tours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket ID   : ${ticket.id}
Category    : ${ticket.category?.toUpperCase()}
Priority    : ${ticket.priority?.toUpperCase() || 'MEDIUM'}
Status      : ${ticket.status?.toUpperCase() || 'OPEN'}
Received at : ${internalEmail}
${ticket.booking_reference ? `Booking Ref : ${ticket.booking_reference}` : ''}

━━━━━━━━━━━━ CUSTOMER DETAILS ━━━━━━━━━━━━

Name    : ${ticket.name}
Email   : ${ticket.email}
Phone   : ${ticket.phone || 'N/A'}

━━━━━━━━━━━━ MESSAGE ━━━━━━━━━━━━

Subject: ${ticket.subject}

${ticket.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 Reply directly to the customer at: ${ticket.email}
Or manage this ticket in the Admin Panel.
    `.trim();

    // Auto-reply to customer
    const customerBody = `
Dear ${ticket.name},

Thank you for reaching out to GC Travel and Tours Agency!

We have successfully received your inquiry and created a support ticket for you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ticket Reference : ${ticket.id}
Category         : ${ticket.category?.charAt(0).toUpperCase() + ticket.category?.slice(1) || 'General'}
Subject          : ${ticket.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our team will review your inquiry and respond within 24 hours during business hours (Mon–Sat, 8AM–6PM).

If you need to follow up, please reply to this email and include your ticket reference: ${ticket.id}

For urgent matters, you may also contact us at:
📞 +63 915 440 1150
📧 ${internalEmail}

Best regards,
GC Travel and Tours Agency
Imus City, Cavite, Philippines
    `.trim();

    await Promise.all([
      base44.integrations.Core.SendEmail({
        to: internalEmail,
        subject: `${ticketRef} ${ticket.subject}`,
        body: internalBody,
        from_name: `${ticket.name} via GC Travel Support`,
      }),
      base44.integrations.Core.SendEmail({
        to: ticket.email,
        subject: `${ticketRef} We received your inquiry — GC Travel & Tours`,
        body: customerBody,
        from_name: 'GC Travel and Tours Support',
      }),
    ]);

    await base44.asServiceRole.entities.HelpdeskTicket.update(ticket_id, {
      response_email_sent: true,
    });

    console.log(`[HELPDESK EMAIL] Ticket ${ticket.id} routed to ${internalEmail}`);
    return Response.json({ success: true, routed_to: internalEmail, ticket_id });

  } catch (error) {
    console.error('[HELPDESK EMAIL ERROR]', { message: error.message, timestamp: new Date().toISOString() });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
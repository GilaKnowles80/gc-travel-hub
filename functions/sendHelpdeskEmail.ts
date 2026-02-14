import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CATEGORY_EMAILS = {
  general: "info@gctravelandtours.com",
  tour: "tour@gctravelandtours.com",
  flights: "flights@gctravelandtours.com",
  visa: "visa@gctravelandtours.com",
  bus: "bus@gctravelandtours.com",
  car_rental: "car@gctravelandtours.com",
  ferry: "ferry@gctravelandtours.com",
  hotel: "hotel@gctravelandtours.com",
  travel_insurance: "insurance@gctravelandtours.com",
  refund: "refund@gctravelandtours.com",
  dispute: "dispute@gctravelandtours.com",
  complaint: "complaint@gctravelandtours.com"
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ticket_id } = await req.json();

    if (!ticket_id) {
      return Response.json({ error: "Missing ticket_id" }, { status: 400 });
    }

    // Fetch the ticket
    const ticket = await base44.asServiceRole.entities.HelpdeskTicket.read(ticket_id);

    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    const departmentEmail = CATEGORY_EMAILS[ticket.category] || CATEGORY_EMAILS.general;

    // Email to department
    const departmentEmailBody = `
New Support Ticket Submitted

Ticket ID: ${ticket.id}
Category: ${ticket.category}
Priority: ${ticket.priority}
Status: ${ticket.status}

From:
Name: ${ticket.name}
Email: ${ticket.email}
Phone: ${ticket.phone || "N/A"}

${ticket.booking_reference ? `Booking Reference: ${ticket.booking_reference}` : ""}

Subject: ${ticket.subject}

Message:
${ticket.message}

---
Please respond to: ${ticket.email}
Visit Admin Panel to manage this ticket.
    `;

    // Email to customer
    const customerEmailBody = `
Hello ${ticket.name},

Thank you for contacting GC Travel and Tours Agency. We have received your inquiry and assigned it ticket number ${ticket.id}.

Category: ${ticket.category}
Subject: ${ticket.subject}

We appreciate your patience and will respond within 24 hours during business hours.

If you need to provide additional information about your inquiry, please reply to this email with your ticket number: ${ticket.id}

Best regards,
GC Travel and Tours Agency
+63 915 440 1150
info@gctravelandtours.com
    `;

    // Send emails in parallel
    await Promise.all([
      base44.integrations.Core.SendEmail({
        to: departmentEmail,
        subject: `[Support Ticket #${ticket.id}] ${ticket.subject}`,
        body: departmentEmailBody,
        from_name: "GC Travel and Tours Support"
      }),
      base44.integrations.Core.SendEmail({
        to: ticket.email,
        subject: `[Ticket #${ticket.id}] We received your inquiry`,
        body: customerEmailBody,
        from_name: "GC Travel and Tours Support"
      })
    ]);

    // Update ticket to mark email sent
    await base44.asServiceRole.entities.HelpdeskTicket.update(ticket_id, {
      response_email_sent: true
    });

    return Response.json({
      success: true,
      message: "Emails sent successfully",
      department_email: departmentEmail,
      ticket_id: ticket_id
    });
  } catch (error) {
    console.error("Error sending helpdesk emails:", error);
    return Response.json({
      error: error.message || "Failed to send emails"
    }, { status: 500 });
  }
});
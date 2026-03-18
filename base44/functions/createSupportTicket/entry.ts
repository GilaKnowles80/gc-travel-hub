import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      customerEmail,
      customerName,
      subject,
      description,
      bookingId,
      bookingType = 'general',
      category = 'other',
      priority = 'medium'
    } = body;

    if (!customerEmail || !customerName || !subject || !description) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create support ticket
    const ticket = await base44.asServiceRole.entities.SupportTicket.create({
      customer_email: customerEmail,
      customer_name: customerName,
      subject,
      description,
      booking_id: bookingId || null,
      booking_type: bookingType,
      category,
      priority,
      status: 'open',
      messages: [
        {
          sender: 'customer',
          sender_name: customerName,
          message: description,
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Send confirmation email
    try {
      await base44.integrations.Core.SendEmail({
        to: customerEmail,
        subject: `Support Ticket Created - ${ticket.id}`,
        body: `Dear ${customerName},\n\nThank you for contacting GC Travel & Tours support.\n\nYour ticket has been created with reference: ${ticket.id}\n\nWe will respond to your inquiry shortly.\n\nBest regards,\nGC Travel & Tours Support Team`
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    console.log('Support ticket created:', ticket.id);

    return Response.json({
      success: true,
      ticketId: ticket.id,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
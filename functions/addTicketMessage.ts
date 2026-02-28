import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, message, senderType = 'customer' } = body;

    if (!ticketId || !message) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get ticket
    const ticket = await base44.asServiceRole.entities.SupportTicket.get(ticketId);

    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add message
    const newMessage = {
      sender: senderType,
      sender_name: senderType === 'customer' ? ticket.customer_name : user.full_name,
      message: message,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(ticket.messages || []), newMessage];

    // Update ticket
    await base44.asServiceRole.entities.SupportTicket.update(ticketId, {
      messages: updatedMessages,
      status: senderType === 'support' ? 'in_progress' : ticket.status
    });

    // Send notification email
    try {
      const recipientEmail = senderType === 'customer' ? ticket.customer_name : ticket.customer_email;
      await base44.integrations.Core.SendEmail({
        to: senderType === 'support' ? ticket.customer_email : ticket.assigned_to || 'support@gctravelandtours.com',
        subject: `New Message on Ticket ${ticketId}`,
        body: `There is a new message on support ticket ${ticketId}.\n\n"${message}"\n\nPlease log in to view the full conversation.`
      });
    } catch (emailError) {
      console.error('Error sending message notification:', emailError);
    }

    console.log('Message added to ticket:', ticketId);

    return Response.json({
      success: true,
      message: 'Message added successfully'
    });
  } catch (error) {
    console.error('Error adding ticket message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
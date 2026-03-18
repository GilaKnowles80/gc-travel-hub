import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get('ticketId');

    // Log incoming call
    if (ticketId) {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.HelpdeskTicket.update(ticketId, {
        last_inbound_call: new Date().toISOString(),
      });
    }

    // TwiML response for voice greeting
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">Thank you for calling GC Travel and Tours. Your call is important to us. Please hold while we connect you with a support specialist.</Say>
  <Queue name="support_queue" reservationId="${ticketId}">
    <Say>You are in the queue.</Say>
  </Queue>
</Response>`;

    return new Response(twiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Twilio voice response error:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, we are unable to process your call at this time. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorTwiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
});
// TwiML webhook - Twilio calls this when a browser client places a call
// This routes the call to the admin's browser (identity: "gc_admin")
Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const callerName = params.get('CallerName') || 'Customer';
    const from = params.get('From') || 'Unknown';

    // Route call to the admin browser client
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">Please hold, connecting you to a GC Travel support agent.</Say>
  <Dial>
    <Client>gc_admin</Client>
  </Dial>
  <Say voice="woman">Sorry, the agent is unavailable. Please try again later or send us a message.</Say>
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('twilioIncomingCall error:', error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please try again later.</Say>
  <Hangup/>
</Response>`;
    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});
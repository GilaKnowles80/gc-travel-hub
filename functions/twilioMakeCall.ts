import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { customerPhone, ticketId, message } = await req.json();

    if (!customerPhone || !ticketId) {
      return Response.json({ error: 'customerPhone and ticketId are required' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    
    const callResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: customerPhone,
        From: fromNumber,
        Url: `https://your-app-domain.com/api/twilio-voice-response?ticketId=${ticketId}`,
        Record: 'true',
        RecordingStatusCallback: `https://your-app-domain.com/api/twilio-recording?ticketId=${ticketId}`,
      }).toString(),
    });

    if (!callResponse.ok) {
      const error = await callResponse.text();
      console.error('Twilio call failed:', error);
      return Response.json({ error: 'Failed to initiate call', details: error }, { status: 500 });
    }

    const callData = await callResponse.json();

    // Log the call to helpdesk
    await base44.asServiceRole.entities.HelpdeskTicket.update(ticketId, {
      last_call_sid: callData.sid,
      last_call_time: new Date().toISOString(),
    });

    return Response.json({ success: true, callSid: callData.sid });
  } catch (error) {
    console.error('Twilio make call error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
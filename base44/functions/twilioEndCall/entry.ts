import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { callSid } = await req.json();

    if (!callSid) {
      return Response.json({ error: 'callSid is required' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const auth = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ Status: 'completed' }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio end call failed:', error);
      return Response.json({ error: 'Failed to end call' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Twilio end call error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
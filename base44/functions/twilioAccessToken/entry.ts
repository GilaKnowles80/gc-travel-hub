import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const { identity } = await req.json().catch(() => ({}));
    const clientIdentity = identity || 'customer_' + Date.now();

    // Use environment variables for access token generation
    const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID') || accountSid;
    const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET') || authToken;
    const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID') || 'default';

    // Create Twilio Access Token (JWT)
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    const payload = {
      iss: apiKeySid,
      sub: accountSid,
      aud: 'https://api.twilio.com',
      exp,
      nbf: now,
      grants: {
        voice: {
          incoming: { allow: true },
          outgoing: { application_sid: twimlAppSid }
        }
      },
      identity: clientIdentity,
      jti: `${apiKeySid}-${now}`
    };

    // Simple JWT encoding
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const signingInput = `${header}.${body}`;
    
    const keyData = new TextEncoder().encode(apiKeySecret);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const token = `${signingInput}.${signature}`;

    return Response.json({ token, identity: clientIdentity });
  } catch (error) {
    console.error('twilioAccessToken error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
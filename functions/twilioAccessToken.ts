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

    // We need a TwiML App SID and API Key for browser calls
    // Using Twilio's REST API to create an access token
    const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID');
    const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET');
    const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID');

    if (!apiKeySid || !apiKeySecret || !twimlAppSid) {
      return Response.json({ 
        error: 'Missing TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, or TWILIO_TWIML_APP_SID secrets. Please set them up first.',
        setup_required: true
      }, { status: 500 });
    }

    // Create Twilio Access Token manually (JWT)
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    
    const grant = {
      voice: {
        incoming: { allow: true },
        outgoing: { application_sid: twimlAppSid }
      }
    };

    const payload = {
      jti: `${apiKeySid}-${now}`,
      iss: apiKeySid,
      sub: accountSid,
      nbf: now,
      exp: now + 3600,
      grants: grant,
      identity: clientIdentity
    };

    // Encode JWT
    const encode = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const signingInput = `${encode(header)}.${encode(payload)}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const token = `${signingInput}.${sigB64}`;

    return Response.json({ token, identity: clientIdentity });
  } catch (error) {
    console.error('twilioAccessToken error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
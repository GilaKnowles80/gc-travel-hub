import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Cache token and expiry
let cachedToken = null;
let tokenExpiry = null;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && now < tokenExpiry - 60000) {
      return Response.json({ token: cachedToken });
    }

    const clientId = Deno.env.get('AMADEUS_API_KEY');
    const clientSecret = Deno.env.get('AMADEUS_API_SECRET');

    if (!clientId || !clientSecret) {
      return Response.json(
        { error: 'AMADEUS credentials not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to get AMADEUS token');
    }

    cachedToken = data.access_token;
    tokenExpiry = now + (data.expires_in * 1000);

    return Response.json({ token: cachedToken });
  } catch (error) {
    console.error('Token fetch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
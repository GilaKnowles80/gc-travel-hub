import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search_type, origin, destination, date, passengers } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].biyaheko_terminal_id) {
      return Response.json({ error: 'Biyaheko credentials not configured' }, { status: 400 });
    }

    const { biyaheko_terminal_id, biyaheko_user_id, biyaheko_password } = credentials[0];

    // Biyaheko API endpoint (placeholder - replace with actual API)
    const apiUrl = 'https://api.biyaheko.ph/search';

    const payload = {
      terminal_id: biyaheko_terminal_id,
      user_id: biyaheko_user_id,
      password: biyaheko_password,
      search_type,
      origin,
      destination,
      date,
      passengers
    };

    console.log('Biyaheko search request:', { search_type, origin, destination, date });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Biyaheko API error:', error);
      return Response.json({ error: 'Biyaheko search failed', details: error }, { status: response.status });
    }

    const results = await response.json();
    
    return Response.json({ 
      success: true, 
      supplier: 'biyaheko',
      results 
    });

  } catch (error) {
    console.error('Biyaheko search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
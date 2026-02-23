import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search_type, origin, destination, check_in, check_out, guests } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].wanderlinx_email) {
      return Response.json({ error: 'Wanderlinx credentials not configured' }, { status: 400 });
    }

    const { wanderlinx_email, wanderlinx_password } = credentials[0];

    // Wanderlinx API endpoint (placeholder - replace with actual API)
    const apiUrl = 'https://api.mywanderlinx.com/search';

    const payload = {
      email: wanderlinx_email,
      password: wanderlinx_password,
      search_type,
      origin,
      destination,
      check_in,
      check_out,
      guests
    };

    console.log('Wanderlinx search request:', { search_type, destination, check_in, check_out });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Wanderlinx API error:', error);
      return Response.json({ error: 'Wanderlinx search failed', details: error }, { status: response.status });
    }

    const results = await response.json();
    
    return Response.json({ 
      success: true, 
      supplier: 'wanderlinx',
      results 
    });

  } catch (error) {
    console.error('Wanderlinx search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
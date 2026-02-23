import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { search_type, destination, tour_type, departure_date, travelers } = await req.json();

    // Get credentials
    const credentials = await base44.asServiceRole.entities.SupplierCredentials.filter({}, '-created_date', 1);
    if (!credentials.length || !credentials[0].tripzynx_username) {
      return Response.json({ error: 'Tripzynx credentials not configured' }, { status: 400 });
    }

    const { tripzynx_username, tripzynx_password } = credentials[0];

    // Tripzynx API endpoint (placeholder - replace with actual API)
    const apiUrl = 'https://api.tripzynx.com/search';

    const payload = {
      username: tripzynx_username,
      password: tripzynx_password,
      search_type,
      destination,
      tour_type,
      departure_date,
      travelers
    };

    console.log('Tripzynx search request:', { search_type, destination, tour_type });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Tripzynx API error:', error);
      return Response.json({ error: 'Tripzynx search failed', details: error }, { status: response.status });
    }

    const results = await response.json();
    
    return Response.json({ 
      success: true, 
      supplier: 'tripzynx',
      results 
    });

  } catch (error) {
    console.error('Tripzynx search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});